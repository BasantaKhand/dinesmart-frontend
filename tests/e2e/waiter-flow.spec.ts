import { test, expect, Page } from "@playwright/test";

const WAITER_EMAIL = "waiter@active.com";
const PASSWORD = "Password@123";

async function uiLogin(page: Page, email: string, password: string) {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    await page.getByPlaceholder("you@restaurant.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);

    await page.getByRole("button", { name: /^login$/i }).click();
    await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 20000 });
}

function sendButton(page: Page) {
    return page.getByRole("button", { name: /send to kitchen|add items to order/i });
}

async function pickFirstAvailableTable(page: Page) {
    await expect(page.getByRole("heading", { name: /active tables/i })).toBeVisible();

    // open filter dropdown and click Available (safe even if already selected)
    const filterContainer = page.locator(".table-filter-container");
    if (await filterContainer.isVisible().catch(() => false)) {
        await filterContainer.locator("button").first().click();

        const availableOption = page.getByRole("button", { name: /^available$/i });
        if (await availableOption.isVisible().catch(() => false)) {
            await availableOption.click();
        } else {
            await page.keyboard.press("Escape").catch(() => { });
        }
    }

    const firstAvailableTable = page
        .getByRole("button")
        .filter({ hasText: /AVAILABLE/i })
        .filter({ hasText: /Table\s+T-/i })
        .first();

    await expect(firstAvailableTable).toBeVisible({ timeout: 20000 });
    await firstAvailableTable.click();

    await expect(page.getByText(/recipient\s*:\s*table/i)).toBeVisible({ timeout: 15000 });
}

async function addFirstMenuItemToCart(page: Page) {
    // Scope to menu section so we don't pick table headings
    const menuSection = page.locator("section", {
        has: page.getByRole("heading", { name: /special menu for you/i }),
    });

    await expect(menuSection).toBeVisible({ timeout: 20000 });

    const firstItemTitle = menuSection.getByRole("heading", { level: 4 }).first();
    await expect(firstItemTitle).toBeVisible({ timeout: 20000 });

    // Click title (bubbles to parent onClick => addToCart)
    await firstItemTitle.click();

    // Cart header appears when cart.length > 0
    await expect(page.getByText(/adding to order\s*\(\s*[1-9]\d*\s*\)/i)).toBeVisible({
        timeout: 15000,
    });

    // Button becomes enabled when cart.length > 0 and table selected
    const btn = sendButton(page);
    await expect(btn).toBeEnabled({ timeout: 15000 });
}

test.describe("Waiter Flow (E2E)", () => {
    test("Waiter: login → select AVAILABLE table → add item → send to kitchen", async ({ page }) => {
        await uiLogin(page, WAITER_EMAIL, PASSWORD);

        await expect(page).toHaveURL(/\/waiter/i, { timeout: 20000 });
        await expect(page.getByText(/waiter panel/i)).toBeVisible();

        await pickFirstAvailableTable(page);
        await addFirstMenuItemToCart(page);

        const btn = sendButton(page);
        await expect(btn).toBeEnabled({ timeout: 15000 });
        await btn.click();

        // Success toast
        await expect(
            page.getByText(/order sent to kitchen successfully|items added to order successfully/i)
        ).toBeVisible({ timeout: 20000 });

        // After sending, cart is cleared => "Adding to Order (...)" should disappear
        await expect(page.getByText(/adding to order\s*\(/i)).toBeHidden({ timeout: 20000 });

        // Active order section should appear (since you now have items in kitchen)
        await expect(page.getByText(/in kitchen\s*\(\s*[1-9]\d*\s*\)/i)).toBeVisible({
            timeout: 20000,
        });

        // Button should be disabled again because cart.length === 0
        await expect(sendButton(page)).toBeDisabled({ timeout: 20000 });
    });
});