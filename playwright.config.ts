import { defineConfig } from "@playwright/test";

export default defineConfig({
    timeout: 90000, // 90 seconds per test
    retries: 1, // Retry failed tests once
    use: {
        baseURL: "http://localhost:3000",
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});