// tests/e2e/cashier-flow.spec.ts
import { test, expect, type Page } from "@playwright/test";

test.describe("Full flow: Waiter places order -> Admin cooks -> Waiter serves & completes -> Cashier settles", () => {
    test.setTimeout(120_000);

    test("Waiter -> Admin -> Waiter -> Cashier", async ({ browser }) => {
        const context = await browser.newContext();

        // Prevent print dialogs / popups from freezing headed runs
        await context.addInitScript(() => {
            // @ts-ignore
            window.print = () => { };
        });

        const page = await context.newPage();

        // 1) Waiter: place an order
        await login(page, {
            email: "waiter@active.com",
            password: "Password@123",
            expectedHeading: "Active Tables",
        });

        const tableNumber = await waiterPlaceOrderOnUsableTable(page);

        // 2) Admin: cook first eligible order
        await login(page, {
            email: "owner@active.com",
            password: "Password@123",
            expectedRoleText: /restaurant admin|admin/i,
        });

        await adminCookFirstEligibleOrder(page);

        // 3) Waiter: open same table and Serve -> Complete
        await login(page, {
            email: "waiter@active.com",
            password: "Password@123",
            expectedHeading: "Active Tables",
        });

        await waiterServeAndCompleteByTable(page, tableNumber);

        // 4) Cashier: settle
        await login(page, {
            email: "cashier@active.com",
            password: "Password@123",
            expectedHeading: "Payment Queue",
        });

        await cashierSettleFirstPending(page);

        await context.close();
    });
});

/* ---------------------------
   Login (cookie-based auth)
   IMPORTANT: do NOT touch localStorage on about:blank
---------------------------- */
async function login(
    page: Page,
    opts: {
        email: string;
        password: string;
        expectedHeading?: string;
        expectedRoleText?: RegExp;
    }
) {
    // Clear cookies to fully logout previous user
    await page.context().clearCookies();

    // Go to a real origin first (so storage access is allowed if needed)
    await page.goto("/auth/login", { waitUntil: "domcontentloaded", timeout: 45_000 });

    // OPTIONAL: if your app stores anything in storage, clear it safely here
    // (This will not throw because we're on http://localhost:3000 now.)
    await page
        .evaluate(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch {
                // ignore
            }
        })
        .catch(() => { });

    // Your login inputs do NOT have name/id/labelFor,
    // so rely on type.
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible({ timeout: 30_000 });
    await emailInput.fill(opts.email);

    await expect(passwordInput).toBeVisible({ timeout: 30_000 });
    await passwordInput.fill(opts.password);

    await page.getByRole("button", { name: /login|sign in/i }).first().click();

    // Wait for navigation away from login
    await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 30_000 });

    // Best-effort landing checks
    if (opts.expectedHeading) {
        await expect(page.getByRole("heading", { name: opts.expectedHeading })).toBeVisible({ timeout: 30_000 });
    } else if (opts.expectedRoleText) {
        await page.getByText(opts.expectedRoleText).first().waitFor({ state: "visible", timeout: 20_000 }).catch(() => { });
    }
}

/* ---------------------------
   Waiter: choose a usable table and place 1 item order
---------------------------- */
async function waiterPlaceOrderOnUsableTable(page: Page): Promise<string> {
    await expect(page.getByRole("heading", { name: "Active Tables" })).toBeVisible({ timeout: 30_000 });

    const anyTableBtn = page.getByRole("button").filter({ hasText: /Table\s*T-\d+/i }).first();
    await expect(anyTableBtn).toBeVisible({ timeout: 30_000 });

    const parseTableNumber = (text: string) => {
        const t = text.replace(/\s+/g, " ").trim();
        const m = t.match(/Table\s+(T-\s*\d+)/i);
        return m ? m[1].replace(/\s+/g, "") : null;
    };

    // Prefer AVAILABLE
    const availableBtns = page.getByRole("button").filter({ hasText: /AVAILABLE/i });
    const availableCount = await availableBtns.count().catch(() => 0);

    if (availableCount > 0) {
        const btn = availableBtns.first();
        const tableText = await btn.innerText();
        const tableNumber = parseTableNumber(tableText);
        if (!tableNumber) throw new Error(`Could not parse table number from AVAILABLE button: ${tableText}`);

        await btn.click();
        await waiterAddOneItemAndSend(page, tableNumber);
        return tableNumber;
    }

    // Fallback: OCCUPIED where we can start a new order (New Order / Order Completed)
    const occupiedBtns = page.getByRole("button").filter({ hasText: /OCCUPIED/i });
    const occupiedCount = await occupiedBtns.count().catch(() => 0);

    for (let i = 0; i < occupiedCount; i++) {
        const btn = occupiedBtns.nth(i);
        const tableText = await btn.innerText();
        const tableNumber = parseTableNumber(tableText);
        if (!tableNumber) continue;

        await btn.scrollIntoViewIfNeeded().catch(() => { });
        await btn.click();

        const isCompleted = await page.getByText(/^Order Completed$/i).isVisible().catch(() => false);
        const isNewOrder = await page.getByText(/^New Order$/i).isVisible().catch(() => false);

        if (isCompleted || isNewOrder) {
            await waiterAddOneItemAndSend(page, tableNumber);
            return tableNumber;
        }
    }

    throw new Error(
        "No AVAILABLE tables found and no OCCUPIED table was eligible to place a new order (needs 'New Order' or 'Order Completed')."
    );
}

async function waiterAddOneItemAndSend(page: Page, tableNumber: string) {
    // Wait for table selection to be confirmed in the order summary
    await expect(page.getByText(new RegExp(`Recipient\\s*:\\s*Table\\s*${tableNumber}`, "i"))).toBeVisible({
        timeout: 30_000,
    });

    // Wait for menu section heading to be visible
    const menuHeading = page.getByRole("heading", { name: /special menu for you/i });
    await expect(menuHeading).toBeVisible({ timeout: 30_000 });

    // Find the menu grid container (sibling of the heading's parent, contains menu item cards with NRs prices)
    // Use CSS selector to target the grid of menu items
    const menuGrid = page.locator("div.grid").filter({ hasText: /NRs\./i }).first();
    await expect(menuGrid).toBeVisible({ timeout: 30_000 });

    // Click the first menu item card (div with cursor-pointer containing h4 and price)
    const firstMenuItem = menuGrid.locator("h4").first();
    await expect(firstMenuItem).toBeVisible({ timeout: 30_000 });
    await firstMenuItem.click();

    // Wait for cart to update - cart header appears when cart.length > 0
    await expect(page.getByText(/adding to order\s*\(\s*[1-9]\d*\s*\)/i)).toBeVisible({
        timeout: 15_000,
    });

    const sendOrAddBtn = page.getByRole("button", { name: /Send to Kitchen|Add Items to Order/i }).first();
    await expect(sendOrAddBtn).toBeVisible({ timeout: 30_000 });
    await expect(sendOrAddBtn).toBeEnabled({ timeout: 30_000 });
    await sendOrAddBtn.click();

    await expect(page.locator("text=#ORD-").first()).toBeVisible({ timeout: 45_000 });
}

/* ---------------------------
   Admin: mark first eligible order COOKED (not PAID)
---------------------------- */
async function adminCookFirstEligibleOrder(page: Page) {
    await page.goto("/admin/orders", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible({ timeout: 30_000 });

    await page.getByText("Loading orders...").waitFor({ state: "detached", timeout: 30_000 }).catch(() => { });

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });

    const count = await rows.count();

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);

        const paymentText = (await row.locator("td").nth(5).innerText().catch(() => "")).toUpperCase();
        if (paymentText.includes("PAID")) continue;

        const statusSelect = row.locator("select").first();
        const selectVisible = await statusSelect.isVisible().catch(() => false);
        if (!selectVisible) continue;

        await statusSelect.selectOption("COOKED");
        await page.waitForTimeout(1200);

        await row.getByText("COOKED", { exact: true }).first().waitFor({ state: "visible", timeout: 20_000 }).catch(() => { });
        return;
    }

    throw new Error("No eligible (not paid, with visible dropdown) order found to mark COOKED.");
}

/* ---------------------------
   Waiter: open same table and Serve -> Complete (scoped selectors)
---------------------------- */
async function waiterServeAndCompleteByTable(page: Page, tableNumber: string) {
    await expect(page.getByRole("heading", { name: "Active Tables" })).toBeVisible({ timeout: 30_000 });

    const tableBtn = page
        .getByRole("button")
        .filter({ hasText: new RegExp(`Table\\s*${escapeRegExp(tableNumber)}`, "i") })
        .first();
    await expect(tableBtn).toBeVisible({ timeout: 30_000 });
    await tableBtn.click();

    const orderSummary = page.locator("div").filter({ has: page.getByRole("heading", { name: "Order Summary" }) }).first();
    await expect(orderSummary).toBeVisible({ timeout: 30_000 });

    const statusBlock = orderSummary.locator("p", { hasText: "Order Status" }).locator("..");
    const statusValue = statusBlock.locator("p").nth(1);

    await expect(statusValue).toHaveText(/COOKED/i, { timeout: 60_000 });

    const serveBtn = orderSummary.getByRole("button", { name: /^Serve$/i }).first();
    await expect(serveBtn).toBeVisible({ timeout: 30_000 });
    await expect(serveBtn).toBeEnabled({ timeout: 30_000 });
    await serveBtn.click();

    await expect(statusValue).toHaveText(/SERVED/i, { timeout: 45_000 });

    const completeBtn = orderSummary.getByRole("button", { name: /^Complete$/i }).first();
    await expect(completeBtn).toBeVisible({ timeout: 30_000 });
    await expect(completeBtn).toBeEnabled({ timeout: 30_000 });
    await completeBtn.click();

    await expect(statusValue).toHaveText(/COMPLETED/i, { timeout: 45_000 });

    await orderSummary.getByText(/^Order Completed$/i).first().waitFor({ state: "visible", timeout: 30_000 }).catch(() => { });
}

/* ---------------------------
   Cashier: settle first item and mark paid
---------------------------- */
async function cashierSettleFirstPending(page: Page) {
    await expect(page.getByRole("heading", { name: "Payment Queue" })).toBeVisible({ timeout: 30_000 });

    const settleBtn = page.getByRole("button", { name: /Settle/i }).first();
    await expect(settleBtn).toBeVisible({ timeout: 60_000 });

    const rows = page.locator("table tbody tr");
    const before = await rows.count().catch(() => 0);

    await settleBtn.click();

    const markPaidBtn = page.getByRole("button", { name: /Mark Paid/i }).first();
    await expect(markPaidBtn).toBeVisible({ timeout: 30_000 });
    await markPaidBtn.click();

    await expect(async () => {
        const after = await rows.count().catch(() => 0);
        if (before === 0) expect(after).toBe(0);
        else expect(after).toBeLessThan(before);
    }).toPass({ timeout: 45_000 });
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}