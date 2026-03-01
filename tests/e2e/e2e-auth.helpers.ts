import { expect, Page } from '@playwright/test';

export type LoginUser = {
    email: string;
    password: string;
    expectedPath: '/superadmin' | '/admin' | '/waiter' | '/cashier';
};

export async function gotoLogin(page: Page) {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
}

export async function login(page: Page, user: LoginUser) {
    await gotoLogin(page);

    await page.getByPlaceholder('you@restaurant.com').fill(user.email);
    await page.getByPlaceholder('••••••••').fill(user.password);

    await page.getByRole('button', { name: /^login$/i }).click();

    await expect(page).toHaveURL(new RegExp(`${user.expectedPath}(/)?$`), { timeout: 20000 });
}

function getLogoutButton(page: Page) {
    return page
        .getByRole('button', { name: /^logout$/i })
        .or(page.getByRole('button', { name: /logout/i }))
        .or(page.getByLabel(/logout/i));
}

function getConfirmLogoutButton(page: Page) {
    const dialog = page
        .locator('div')
        .filter({ hasText: /are you sure you want to logout\?/i })
        .first();

    return dialog.getByRole('button', { name: /^logout$/i });
}

export async function logout(page: Page) {
    const logoutBtn = getLogoutButton(page);

    if (await logoutBtn.first().isVisible().catch(() => false)) {
        await logoutBtn.first().click();

        const confirmBtn = getConfirmLogoutButton(page);
        if (await confirmBtn.isVisible().catch(() => false)) {
            await confirmBtn.click();
        }

        await expect(page).toHaveURL(/\/auth\/login/i, { timeout: 20000 });
        return;
    }

    await page.context().clearCookies();
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/i);
}

export async function assertLoggedInUI(page: Page, expectedPath: string) {
    await expect(page).toHaveURL(new RegExp(`${expectedPath}(/)?$`));
    await expect(page.getByRole('heading', { name: /welcome back/i })).toHaveCount(0);

    const logoutBtn = getLogoutButton(page);
    if ((await logoutBtn.count().catch(() => 0)) > 0) {
        await expect(logoutBtn.first()).toBeVisible();
    }
}