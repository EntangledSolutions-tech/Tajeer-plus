import { expect, test } from '@playwright/test';

test.describe('Customer Contract Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and authenticate
    await page.goto('/auth/sign-in');

    // Fill in login credentials (adjust based on your test setup)
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="sign-in-button"]');

    // Wait for redirect to home page
    await page.waitForURL('**/home');
  });

  test('should display customer contracts list', async ({ page }) => {
    // Navigate to customers page
    await page.goto('/customers');

    // Wait for customers list to load
    await page.waitForSelector('[data-testid="customers-table"]');

    // Click on first customer to view details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');

    // Wait for customer details page
    await page.waitForURL('**/customers/**');

    // Click on Contracts tab
    await page.click('[data-testid="contracts-tab"]');

    // Verify contracts section is displayed
    await expect(page.locator('[data-testid="contracts-section"]')).toBeVisible();

    // Check for summary cards
    await expect(page.locator('[data-testid="contracts-summary"]')).toBeVisible();

    // Check for contracts table
    await expect(page.locator('[data-testid="contracts-table"]')).toBeVisible();
  });

  test('should filter customer contracts by status', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Test All Status filter
    await page.click('[data-testid="all-status-filter"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Test Active filter
    await page.click('[data-testid="active-filter"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Verify only active contracts are shown
    const statusBadges = page.locator('[data-testid="contract-status"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText('Active');
    }

    // Test Completed filter
    await page.click('[data-testid="completed-filter"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Verify only completed contracts are shown
    const completedBadges = page.locator('[data-testid="contract-status"]');
    const completedCount = await completedBadges.count();

    for (let i = 0; i < completedCount; i++) {
      await expect(completedBadges.nth(i)).toHaveText('Completed');
    }
  });

  test('should search customer contracts', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Search for a contract
    await page.fill('[data-testid="contract-search"]', 'ABC-123');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify search results
    const contractRows = page.locator('[data-testid="contract-row"]');
    const count = await contractRows.count();

    // Should have at least one result
    expect(count).toBeGreaterThan(0);

    // Verify the vehicle plate is visible
    await expect(page.locator('[data-testid="vehicle-plate"]')).toContainText('ABC-123');
  });

  test('should navigate to contract details from customer contracts', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on Details button for first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="details-button"]');

    // Verify navigation to contract details page
    await page.waitForURL('**/contracts/**');
    await expect(page.locator('[data-testid="contract-details"]')).toBeVisible();
  });

  test('should handle empty customer contracts state', async ({ page }) => {
    // Mock API to return empty results
    await page.route('**/api/customers/*/contracts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          contracts: [],
          summary: { total: 0, active: 0, completed: 0, draft: 0, cancelled: 0 },
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
        })
      });
    });

    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');

    // Verify empty state message
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No contracts found for this customer');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/customers/*/contracts', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Error');
  });

  test('should display contract summary statistics', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Verify summary cards are displayed
    await expect(page.locator('[data-testid="total-contracts"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-contracts"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-contracts"]')).toBeVisible();

    // Verify summary cards contain numbers
    const totalContracts = page.locator('[data-testid="total-contracts"]');
    const activeContracts = page.locator('[data-testid="active-contracts"]');
    const completedContracts = page.locator('[data-testid="completed-contracts"]');

    await expect(totalContracts).toContainText(/\d+/);
    await expect(activeContracts).toContainText(/\d+/);
    await expect(completedContracts).toContainText(/\d+/);
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Mock API to return paginated results
    await page.route('**/api/customers/*/contracts', route => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') || '1';

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          contracts: Array.from({ length: 10 }, (_, i) => ({
            id: `contract-${(parseInt(pageParam) - 1) * 10 + i + 1}`,
            contract_number: `CON-${String((parseInt(pageParam) - 1) * 10 + i + 1).padStart(3, '0')}`,
            status: 'active',
            vehicle_plate: `ABC-${String(i + 1).padStart(3, '0')}`,
            start_date: '2024-01-01',
            end_date: '2024-01-31',
            total_amount: 1500.00,
            customer_name: 'John Doe',
            created_at: '2024-01-01T00:00:00Z'
          })),
          summary: { total: 25, active: 15, completed: 10, draft: 0, cancelled: 0 },
          pagination: {
            page: parseInt(pageParam),
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNextPage: parseInt(pageParam) < 3,
            hasPrevPage: parseInt(pageParam) > 1
          }
        })
      });
    });

    await page.goto('/customers');
    await page.waitForSelector('[data-testid="customers-table"]');

    // Navigate to customer details
    await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/customers/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Verify pagination controls are displayed
    await expect(page.locator('[data-testid="pagination-controls"]')).toBeVisible();

    // Test next page navigation
    await page.click('[data-testid="next-page-button"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Verify we're on page 2
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');

    // Test previous page navigation
    await page.click('[data-testid="prev-page-button"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Verify we're back on page 1
    await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
  });
});
