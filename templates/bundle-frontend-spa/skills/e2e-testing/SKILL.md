---
name: e2e-testing
description: Create end-to-end tests with Playwright for complete user flows in web applications. Use when you need to test user flows, validate frontend-backend integration, automate UI testing, or set up a Playwright test suite. Supports Playwright MCP tools for interactive testing.
version: 1.0.0
author: Maestro
---

# E2E Testing with Playwright

Write and run end-to-end tests for full user flows using Playwright, with support for both the Playwright test framework and Playwright MCP tools for interactive browser automation.

## When to Use
- User needs to test a complete user flow (login, create, edit, delete)
- User wants to validate frontend-backend integration
- User needs to set up a Playwright test suite from scratch
- User wants to automate visual testing or screenshots
- User needs to debug a failing E2E test

## Available Operations
1. Set up Playwright in a project
2. Write tests for user flows (login, CRUD, navigation)
3. Create Page Object Models for complex tests
4. Run tests and debug failures
5. Use Playwright MCP tools for interactive browser testing

## Multi-Step Workflow

### Step 1: Install and Set Up Playwright
```bash
npm init playwright@latest
# Select TypeScript, tests folder, GitHub Actions workflow

# Or add to existing project:
npm install -D @playwright/test
npx playwright install
```

Verify installation:
```bash
npx playwright --version
```

### Step 2: Configure Playwright
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: Create Auth Setup (Reusable Login)
```typescript
// tests/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // Save auth state for other tests to reuse
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' });
});
```

### Step 4: Write a User Flow Test
```typescript
// tests/e2e/items.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Item Management', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('should create a new item from the dashboard', async ({ page }) => {
    // Navigate to items page
    await page.goto('/items');
    await expect(page.locator('h1')).toHaveText('Items');

    // Click "New" button
    await page.click('button:has-text("New")');
    await expect(page.locator('dialog')).toBeVisible();

    // Fill the form
    await page.fill('[name="title"]', 'Test Item Created by E2E');
    await page.fill('[name="description"]', 'This item was created during end-to-end testing');
    await page.selectOption('[name="priority"]', 'high');

    // Submit
    await page.click('button:has-text("Create")');

    // Verify creation
    await expect(page.locator('text=Item created')).toBeVisible();
    await expect(page.locator('text=Test Item Created by E2E')).toBeVisible();
  });

  test('should search and filter items', async ({ page }) => {
    await page.goto('/items');

    // Search
    await page.fill('[data-testid="search"]', 'Test Item');
    await page.press('[data-testid="search"]', 'Enter');

    // Verify results
    await expect(page.locator('[data-testid="item-card"]')).toHaveCount(1);
  });

  test('should show dashboard metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify key elements are visible
    await expect(page.locator('[data-testid="metric-active-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible();
  });
});
```

### Step 5: Create Page Object Model (for complex flows)
```typescript
// tests/e2e/pages/ItemPage.ts
import { Page, expect } from '@playwright/test';

export class ItemPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/items');
    await expect(this.page.locator('h1')).toHaveText('Items');
  }

  async create(title: string, description: string, priority = 'medium') {
    await this.page.click('button:has-text("New")');
    await this.page.fill('[name="title"]', title);
    await this.page.fill('[name="description"]', description);
    await this.page.selectOption('[name="priority"]', priority);
    await this.page.click('button:has-text("Create")');
    await expect(this.page.locator('text=Item created')).toBeVisible();
  }

  async search(query: string) {
    await this.page.fill('[data-testid="search"]', query);
    await this.page.press('[data-testid="search"]', 'Enter');
  }

  async getItemCount(): Promise<number> {
    return this.page.locator('[data-testid="item-card"]').count();
  }
}

// Usage in test:
// const itemPage = new ItemPage(page);
// await itemPage.navigate();
// await itemPage.create('My Item', 'Description', 'high');
```

### Step 6: Run Tests
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/items.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Run specific browser only
npx playwright test --project=chromium

# Show HTML report
npx playwright show-report
```

### Step 7: Debug Failing Tests
```bash
# Run with step-by-step debugging
npx playwright test --debug

# Show trace viewer for last failed run
npx playwright show-trace test-results/*/trace.zip

# Generate screenshots for visual comparison
npx playwright test --update-snapshots
```

### Using Playwright MCP Tools (Interactive Testing)
For interactive browser testing during development, use the Playwright MCP tools:
```
# Navigate to a URL
mcp__playwright__browser_navigate(url="http://localhost:5173/login")

# Take a snapshot to see current page state
mcp__playwright__browser_snapshot()

# Fill a form field
mcp__playwright__browser_fill_form(selector='[name="email"]', value="admin@example.com")

# Click a button
mcp__playwright__browser_click(selector='button[type="submit"]')

# Take a screenshot
mcp__playwright__browser_take_screenshot()

# Wait for navigation
mcp__playwright__browser_wait_for(selector='h1:has-text("Dashboard")')
```

## Resources
- `references/playwright-selectors.md` - Selector strategies and best practices
- `references/test-patterns.md` - Common E2E test patterns

## Examples
### Example 1: Test a Login Flow
User asks: "Write E2E tests for our login page"
Response approach:
1. Set up Playwright config with webServer pointing to dev server
2. Write test for successful login (fill form, submit, verify redirect)
3. Write test for failed login (invalid credentials, verify error message)
4. Write test for logout (click logout, verify redirect to login)
5. Run tests with `npx playwright test --headed`

### Example 2: Test CRUD Operations
User asks: "Add E2E tests for creating, editing, and deleting items"
Response approach:
1. Create auth setup to reuse login state
2. Write create test: navigate, fill form, submit, verify
3. Write edit test: click item, modify fields, save, verify
4. Write delete test: click delete, confirm, verify removal
5. Use Page Object Model if flows are complex
6. Run with `npx playwright test`

## Notes
- Always use `data-testid` attributes for test selectors -- more stable than CSS classes
- Use auth setup with storage state to avoid logging in every test
- Run tests in parallel by default, use `test.describe.serial` only when order matters
- Enable trace recording on CI for debugging remote failures
- Keep tests independent: each test should set up its own data, not depend on other tests
- Use `expect` assertions (not raw conditionals) for clear failure messages
