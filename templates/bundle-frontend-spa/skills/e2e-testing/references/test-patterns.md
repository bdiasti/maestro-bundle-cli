# E2E Test Patterns

## Authentication Setup (Shared Login State)
```typescript
// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: '.auth/user.json' });
});

// In tests:
test.use({ storageState: '.auth/user.json' });
```

## CRUD Test Pattern
```typescript
test.describe('Items CRUD', () => {
  test('create', async ({ page }) => {
    await page.goto('/items');
    await page.click('button:has-text("New")');
    await page.fill('[name="title"]', 'E2E Test Item');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=E2E Test Item')).toBeVisible();
  });

  test('read', async ({ page }) => {
    await page.goto('/items');
    await expect(page.locator('[data-testid="item-card"]').first()).toBeVisible();
  });

  test('update', async ({ page }) => {
    await page.goto('/items');
    await page.click('[data-testid="item-card"]');
    await page.fill('[name="title"]', 'Updated Title');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Updated Title')).toBeVisible();
  });

  test('delete', async ({ page }) => {
    await page.goto('/items');
    const count = await page.locator('[data-testid="item-card"]').count();
    await page.click('[data-testid="delete-btn"]');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('[data-testid="item-card"]')).toHaveCount(count - 1);
  });
});
```

## Page Object Model Pattern
```typescript
class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator('[data-testid="error"]')).toHaveText(message);
  }
}
```

## API Mocking Pattern
```typescript
test('shows empty state when API returns no items', async ({ page }) => {
  await page.route('**/api/items', (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.goto('/items');
  await expect(page.locator('text=No items found')).toBeVisible();
});
```
