# Playwright Selector Strategies

## Recommended Priority Order
1. `data-testid` attributes (most stable)
2. ARIA roles and labels
3. Text content
4. CSS selectors (least stable)

## data-testid (Best Practice)
```typescript
// HTML: <button data-testid="submit-btn">Submit</button>
await page.click('[data-testid="submit-btn"]');
await page.locator('[data-testid="item-list"]');
```

## Text Selectors
```typescript
await page.click('text=Submit');
await page.click('button:has-text("Submit")');
await page.locator('h1:has-text("Dashboard")');
```

## ARIA Selectors
```typescript
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('heading', { name: 'Dashboard' });
await page.getByLabel('Email');
await page.getByPlaceholder('Enter your email');
```

## Form Interactions
```typescript
// Fill input by name attribute
await page.fill('[name="email"]', 'user@example.com');

// Select dropdown option
await page.selectOption('[name="priority"]', 'high');

// Check/uncheck checkbox
await page.check('[name="agree"]');
await page.uncheck('[name="newsletter"]');

// Upload file
await page.setInputFiles('[type="file"]', 'path/to/file.pdf');
```

## Waiting Strategies
```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="results"]');

// Wait for URL change
await page.waitForURL('**/dashboard');

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific response
await page.waitForResponse('**/api/items');
```

## Anti-Patterns to Avoid
- Do NOT use CSS class selectors (`.btn-primary`) -- they change with styling
- Do NOT use complex XPath -- hard to maintain
- Do NOT use `page.waitForTimeout(ms)` -- use explicit waits instead
- Do NOT rely on element index (`:nth-child`) -- fragile
