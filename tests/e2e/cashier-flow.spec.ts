import { test, expect, type Page } from "@playwright/test";

test.describe("Full flow: Admin completes order -> Waiter prints bill -> Cashier settles", () => {
    test("Admin -> Waiter -> Cashier", async ({ browser }) => {
        const context = await browser.newContext();

        // Prevent print dialogs from freezing headed runs
        await context.addInitScript(() => {
            // @ts-ignore
            window.print = () => { };
        });

        const page = await context.newPage();

        // ---------------------------
        // 1) Admin: mark an order COMPLETED (and not PAID)
        // ---------------------------
        await login(page, {
            email: "owner@active.com",
            password: "Password@123",
            expectedRoleText: /restaurant admin|admin/i, // soft check (optional)
        });

        await adminCompleteFirstEligibleOrder(page);

        // ---------------------------
        // 2) Waiter: OCCUPIED table with COMPLETED order -> View Bill & Print -> confirm close
        // ---------------------------
        await login(page, {
            email: "waiter@active.com",
            password: "Password@123",
            expectedHeading: "Active Tables",
        });

        await expect(page.getByRole("heading", { name: "Active Tables" })).toBeVisible({ timeout: 20000 });

        await waiterOpenOccupiedTableWithCompletedOrder(page);

        const viewBillBtn = page.getByRole("button", { name: /View Bill & Print|Bill Printed/i });
        await expect(viewBillBtn).toBeVisible({ timeout: 20000 });
        await expect(viewBillBtn).toBeEnabled({ timeout: 20000 });
        await viewBillBtn.click();

        const billingModal = page.locator("div.fixed.inset-0").filter({ has: page.getByText("Summary") });
        await expect(billingModal).toBeVisible({ timeout: 20000 });

        const printBtn = billingModal.getByRole("button", { name: /^Print Bill$/i }).first();

        const popupPromise = page.waitForEvent("popup").catch(() => null);
        await printBtn.click();

        const popup = await popupPromise;
        if (popup) {
            await popup.waitForLoadState("domcontentloaded").catch(() => { });
            await popup.close().catch(() => { });
        }

        // Close billing modal by clicking the X button in Summary header
        const summaryHeader = billingModal.getByText("Summary").locator("..");
        const closeXBtn = summaryHeader.locator("button").last();
        await closeXBtn.click();

        await expect(page.getByText("Confirm Bill Status")).toBeVisible({ timeout: 20000 });
        await page.getByRole("button", { name: "Yes, Close" }).click();

        // ---------------------------
        // 3) Cashier: Payment Queue -> Settle -> Mark Paid
        // ---------------------------
        await login(page, {
            email: "cashier@active.com",
            password: "Password@123",
            expectedHeading: "Payment Queue",
        });

        await expect(page.getByRole("heading", { name: "Payment Queue" })).toBeVisible({ timeout: 20000 });

        // Wait until at least one "Settle" exists (order must match: COMPLETED + billPrinted true + paymentStatus PENDING)
        const settleBtn = page.getByRole("button", { name: /Settle/i }).first();
        await expect(settleBtn).toBeVisible({ timeout: 45000 });

        const queueRows = page.locator("table tbody tr");
        const beforeCount = await queueRows.count().catch(() => 0);

        await settleBtn.click();

        const markPaidBtn = page.getByRole("button", { name: /Mark Paid/i });
        await expect(markPaidBtn).toBeVisible({ timeout: 20000 });
        await markPaidBtn.click();

        await expect(async () => {
            const afterCount = await queueRows.count().catch(() => 0);
            if (beforeCount === 0) expect(afterCount).toBe(0);
            else expect(afterCount).toBeLessThan(beforeCount);
        }).toPass({ timeout: 30000 });

        await context.close();
    });
});

// ---------------------------
// Shared login via /auth/login
// ---------------------------
async function login(
    page: Page,
    opts: {
        email: string;
        password: string;
        expectedHeading?: string; // e.g. "Active Tables" / "Payment Queue"
        expectedRoleText?: RegExp; // optional soft check
    }
) {
    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });

    const email = page
        .getByLabel(/email/i)
        .or(page.getByPlaceholder(/email/i))
        .or(page.locator('input[name="email"]'))
        .or(page.locator('input#email'));

    const password = page
        .getByLabel(/password/i)
        .or(page.getByPlaceholder(/password/i))
        .or(page.locator('input[name="password"]'))
        .or(page.locator('input#password'));

    await email.fill(opts.email);
    await password.fill(opts.password);

    await page.getByRole("button", { name: /login|sign in/i }).first().click();

    // Wait for navigation away from login
    await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 20000 });

    // Role/landing checks (best-effort, won’t fail your whole suite if UI differs slightly)
    if (opts.expectedHeading) {
        await expect(page.getByRole("heading", { name: opts.expectedHeading })).toBeVisible({ timeout: 20000 });
    } else if (opts.expectedRoleText) {
        await expect(page.getByText(opts.expectedRoleText)).toBeVisible({ timeout: 20000 }).catch(() => { });
    }
}

// ---------------------------
// Admin: mark first eligible order COMPLETED (not PAID)
// ---------------------------
async function adminCompleteFirstEligibleOrder(page: Page) {
    await page.goto("/admin/orders", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible({ timeout: 20000 });

    // Wait for loading to disappear
    await page.getByText("Loading orders...").waitFor({ state: "detached", timeout: 30000 }).catch(() => { });

    // Poll until either rows appear or empty state is visible
    await expect
        .poll(
            async () => {
                const emptyVisible = await page.getByText(/No orders yet/i).isVisible().catch(() => false);
                const rowCount = await page.locator("tbody tr").count().catch(() => 0);
                return emptyVisible ? "EMPTY" : rowCount > 0 ? "HAS_ROWS" : "WAIT";
            },
            { timeout: 30000, intervals: [500, 1000, 1500] }
        )
        .toBe("HAS_ROWS");

    const rows = page.locator("tbody tr");
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);

        // Payment column: td index 5
        const paymentCell = row.locator("td").nth(5);
        const paymentText = (await paymentCell.innerText().catch(() => "")).toUpperCase();

        if (paymentText.includes("PAID")) continue;

        const statusSelect = row.locator("select").first();
        await expect(statusSelect).toBeVisible({ timeout: 10000 });

        await statusSelect.selectOption("COMPLETED");

        // allow optimistic update + refetch
        await page.waitForTimeout(1500);

        // optional assert: row now shows COMPLETED badge
        await expect(row.getByText("COMPLETED", { exact: true })).toBeVisible({ timeout: 20000 }).catch(() => { });

        return;
    }

    throw new Error("No eligible (not paid) order found to mark COMPLETED.");
}

// ---------------------------
// Waiter: pick an OCCUPIED table that has COMPLETED order
// ---------------------------
async function waiterOpenOccupiedTableWithCompletedOrder(page: Page) {
    const occupiedButtons = page.getByRole("button").filter({ hasText: "OCCUPIED" });
    await expect(occupiedButtons.first()).toBeVisible({ timeout: 20000 });

    const total = await occupiedButtons.count();

    // Try each occupied table quickly
    for (let i = 0; i < total; i++) {
        const btn = occupiedButtons.nth(i);
        await btn.scrollIntoViewIfNeeded().catch(() => { });
        await btn.click();

        await expect(page.getByText("Order Status")).toBeVisible({ timeout: 15000 });

        const completed = await page
            .getByText("COMPLETED", { exact: true })
            .isVisible({ timeout: 6000 })
            .catch(() => false);

        if (completed) return;
    }

    // Wait a bit (admin update may take time) and retry once
    await page.waitForTimeout(4000);

    for (let i = 0; i < total; i++) {
        const btn = occupiedButtons.nth(i);
        await btn.scrollIntoViewIfNeeded().catch(() => { });
        await btn.click();

        await expect(page.getByText("Order Status")).toBeVisible({ timeout: 15000 });

        const completed = await page
            .getByText("COMPLETED", { exact: true })
            .isVisible({ timeout: 8000 })
            .catch(() => false);

        if (completed) return;
    }

    throw new Error("Could not find an OCCUPIED table with a COMPLETED order.");
}