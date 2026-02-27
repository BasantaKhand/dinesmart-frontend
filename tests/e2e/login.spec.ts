import { test, expect } from '@playwright/test';
import { login, logout, assertLoggedInUI, LoginUser } from './e2e-auth.helpers';

const PASSWORD = 'Password@123';

const users: { name: string; user: LoginUser }[] = [
    {
        name: 'Superadmin can login and redirect to /superadmin',
        user: { email: 'superadmin@demo.com', password: PASSWORD, expectedPath: '/superadmin' },
    },
    {
        name: 'Admin can login and redirect to /admin',
        user: { email: 'owner@active.com', password: PASSWORD, expectedPath: '/admin' },
    },
    {
        name: 'Waiter can login and redirect to /waiter',
        user: { email: 'waiter@active.com', password: PASSWORD, expectedPath: '/waiter' },
    },
    {
        name: 'Cashier can login and redirect to /cashier',
        user: { email: 'cashier@active.com', password: PASSWORD, expectedPath: '/cashier' },
    },
];

test.describe('E2E Auth - Login', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure clean session before every test
        await page.context().clearCookies();
    });

    for (const t of users) {
        test(t.name, async ({ page }) => {
            await login(page, t.user);
            await assertLoggedInUI(page, t.user.expectedPath);
            await logout(page);
        });
    }

    test('Invalid credentials show error message and stay on /auth/login', async ({ page }) => {
        await page.goto('/auth/login');
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

        await page.getByPlaceholder('you@restaurant.com').fill('wrong@example.com');
        await page.getByPlaceholder('••••••••').fill('wrong-password');
        await page.getByRole('button', { name: /^login$/i }).click();

        await expect(page).toHaveURL(/\/auth\/login/i);

        const errorBox = page.locator('div').filter({ hasText: /login failed|invalid|unauthorized|incorrect/i }).first();
        await expect(errorBox).toBeVisible();
    });
});