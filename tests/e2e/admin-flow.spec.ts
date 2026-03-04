import { test, expect, Page } from "@playwright/test";

const ADMIN_EMAIL = "owner@active.com";
const PASSWORD = "Password@123";

async function uiLogin(page: Page, email: string, password: string) {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    await page.getByPlaceholder("you@restaurant.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);

    await page.getByRole("button", { name: /^login$/i }).click();
    await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 20000 });
}

async function gotoAdmin(page: Page) {
    await expect(page).toHaveURL(/\/admin/i, { timeout: 20000 });
}

/**
 * Orders: go to /admin/orders and mark first eligible order to COOKED.
 * Fix: wait for loading state to disappear before reading rows.
 */
async function completeFirstEligibleOrder(page: Page) {
    await page.goto("/admin/orders", { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /^orders$/i })).toBeVisible({ timeout: 20000 });

    // ✅ IMPORTANT: wait until "Loading orders..." is gone
    await expect(page.getByText(/loading orders\.\.\./i)).toBeHidden({ timeout: 30000 });

    // Now either we have empty state OR table rows
    const emptyState = page.getByText(/no orders yet/i);
    if (await emptyState.isVisible().catch(() => false)) {
        test.skip(true, "No orders exist to mark as COMPLETED.");
        return;
    }

    // Wait for at least one row to exist (in case table renders slightly late)
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 20000 });

    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    let updated = false;

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);

        // Payment column
        const paymentCell = row.locator("td").nth(5);
        const paymentText = (await paymentCell.innerText().catch(() => "")).toUpperCase();

        // Status column
        const statusCell = row.locator("td").nth(4);
        const statusText = (await statusCell.innerText().catch(() => "")).toUpperCase();

        const isPaid = paymentText.includes("PAID");
        const isCompleted = statusText.includes("COMPLETED");

        if (isPaid || isCompleted) continue;

        const statusSelect = row.locator("select").first();
        await expect(statusSelect).toBeEnabled({ timeout: 10000 });

        // Note: Admin dropdown only has PENDING, COOKING, COOKED options
        // Select COOKED as the final kitchen status
        await statusSelect.selectOption("COOKED");

        // Assert row updates (polling also runs)
        await expect(row).toContainText(/COOKED/i, { timeout: 20000 });

        updated = true;
        break;
    }

    if (!updated) {
        test.skip(true, "No eligible (non-PAID, non-COMPLETED) orders found to update.");
    }
}

/**
 * Menu: go to /admin/menu, click Add Item, fill modal, submit,
 * then assert item appears in table.
 */
async function createMenuItem(page: Page, itemName: string) {
    await page.goto("/admin/menu");
    await expect(page.getByRole("heading", { name: /menu items/i })).toBeVisible({ timeout: 20000 });

    await page.getByRole("button", { name: /add item/i }).click();

    const modalTitle = page.getByText(/add menu item|edit menu item/i);
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    const modal = page
        .locator('[role="dialog"]')
        .first()
        .or(page.locator("div").filter({ has: modalTitle }).first());

    const selectsInModal = modal.locator("select");
    await expect(selectsInModal.first()).toBeVisible({ timeout: 10000 });

    // Category select is first
    const catSelect = selectsInModal.first();
    const optionCount = await catSelect.locator("option").count();
    if (optionCount <= 1) {
        await page.keyboard.press("Escape").catch(() => { });
        test.skip(true, "No categories available to attach to menu item. Create a category first.");
        return;
    }

    await modal.getByPlaceholder(/e\.g\.\s*chicken biryani/i).fill(itemName);
    await modal.locator('input[type="number"]').first().fill("450");
    await catSelect.selectOption({ index: 1 });
    await selectsInModal.nth(1).selectOption("Active");

    await modal.getByPlaceholder(/optional description/i).fill("E2E test menu item");
    await modal.getByPlaceholder(/https:\/\/example\.com\/dish\.jpg/i).fill(
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
    );

    const submitBtn = modal.getByRole("button", { name: /add item|update item/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    await expect(modalTitle).toBeHidden({ timeout: 20000 });

    const search = page.getByPlaceholder(/search menu items/i);
    await search.fill(itemName);

    await expect(page.locator("tbody")).toContainText(itemName, { timeout: 20000 });
}

/**
 * Categories: go to /admin/categories, click Add Category, fill modal, submit,
 * then assert category card appears.
 */
async function createCategory(page: Page, categoryName: string) {
    await page.goto("/admin/categories");
    await expect(page.getByRole("heading", { name: /^categories$/i })).toBeVisible({ timeout: 20000 });

    await page.getByRole("button", { name: /add category/i }).click();

    const modalTitle = page.getByText(/create new category|edit category/i);
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    const modal = page
        .locator('[role="dialog"]')
        .first()
        .or(page.locator("div").filter({ has: modalTitle }).first());

    await modal.getByPlaceholder(/e\.g\.\s*italian pasta/i).fill(categoryName);

    const statusSelect = modal.locator("select").first();
    await statusSelect.selectOption("Active");

    await modal.getByPlaceholder(/briefly describe/i).fill("E2E test category");
    await modal.getByPlaceholder(/https:\/\/\.\.\./i).fill(
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80"
    );

    const submitBtn = modal.getByRole("button", { name: /save category|update category/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    await expect(modalTitle).toBeHidden({ timeout: 20000 });

    const search = page.getByPlaceholder(/search categories/i);
    await search.fill(categoryName);

    await expect(page.getByText(new RegExp(categoryName, "i"))).toBeVisible({ timeout: 20000 });
}

test.describe("Admin Flow (E2E)", () => {
    test("Admin: login → Orders page → update first eligible order to COOKED", async ({ page }) => {
        await uiLogin(page, ADMIN_EMAIL, PASSWORD);
        await gotoAdmin(page);
        await completeFirstEligibleOrder(page);
    });

    test("Admin: login → Menu Items page → add a new menu item (modal)", async ({ page }) => {
        await uiLogin(page, ADMIN_EMAIL, PASSWORD);
        await gotoAdmin(page);

        const uniqueName = `E2E Menu Item ${Date.now()}`;
        await createMenuItem(page, uniqueName);
    });

    test("Admin: login → Categories page → add a new category (modal)", async ({ page }) => {
        await uiLogin(page, ADMIN_EMAIL, PASSWORD);
        await gotoAdmin(page);

        const uniqueName = `E2E Category ${Date.now()}`;
        await createCategory(page, uniqueName);
    });
});