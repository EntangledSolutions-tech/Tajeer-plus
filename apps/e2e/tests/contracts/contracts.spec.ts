import { expect, test } from '@playwright/test';

test.describe('Contract Management Integration Tests', () => {
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

  test.describe('Contract List Management', () => {
    test('should display contracts list with proper data', async ({ page }) => {
      await page.goto('/contracts');
      await page.waitForSelector('[data-testid="contracts-table"]');

      // Verify contracts table is displayed
      await expect(page.locator('[data-testid="contracts-table"]')).toBeVisible();

      // Verify table headers
      await expect(page.locator('[data-testid="contract-number-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="customer-name-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="vehicle-plate-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="status-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-date-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="end-date-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-amount-header"]')).toBeVisible();
    });

    test('should filter contracts by status', async ({ page }) => {
      await page.goto('/contracts');
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

    test('should search contracts', async ({ page }) => {
      await page.goto('/contracts');
      await page.waitForSelector('[data-testid="contracts-table"]');

      // Search for a contract
      await page.fill('[data-testid="contract-search"]', 'CON-001');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify search results
      const contractRows = page.locator('[data-testid="contract-row"]');
      const count = await contractRows.count();

      // Should have at least one result
      expect(count).toBeGreaterThan(0);

      // Verify the contract number is visible
      await expect(page.locator('[data-testid="contract-number"]')).toContainText('CON-001');
    });

    test('should handle pagination', async ({ page }) => {
      // Mock API to return paginated results
      await page.route('**/api/contracts', route => {
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

      await page.goto('/contracts');
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

  test.describe('Cross-Navigation Tests', () => {
    test('should navigate from vehicle details to contract details', async ({ page }) => {
      // Start from vehicles page
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Navigate to vehicle details
      await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
      await page.waitForURL('**/vehicles/**');

      // Go to contracts tab
      await page.click('[data-testid="contracts-tab"]');
      await page.waitForSelector('[data-testid="contracts-table"]');

      // Click on contract details
      await page.click('[data-testid="contract-row"]:first-child [data-testid="details-button"]');

      // Verify navigation to contract details page
      await page.waitForURL('**/contracts/**');
      await expect(page.locator('[data-testid="contract-details"]')).toBeVisible();
    });

    test('should navigate from customer details to contract details', async ({ page }) => {
      // Start from customers page
      await page.goto('/customers');
      await page.waitForSelector('[data-testid="customers-table"]');

      // Navigate to customer details
      await page.click('[data-testid="customer-row"]:first-child [data-testid="view-button"]');
      await page.waitForURL('**/customers/**');

      // Go to contracts tab
      await page.click('[data-testid="contracts-tab"]');
      await page.waitForSelector('[data-testid="contracts-table"]');

      // Click on contract details
      await page.click('[data-testid="contract-row"]:first-child [data-testid="details-button"]');

      // Verify navigation to contract details page
      await page.waitForURL('**/contracts/**');
      await expect(page.locator('[data-testid="contract-details"]')).toBeVisible();
    });

    test('should navigate from contract details back to contract list', async ({ page }) => {
      // Start from contracts page
      await page.goto('/contracts');
      await page.waitForSelector('[data-testid="contracts-table"]');

      // Navigate to contract details
      await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
      await page.waitForURL('**/contracts/**');

      // Click back button
      await page.click('[data-testid="back-to-contracts-button"]');

      // Verify navigation back to contracts list
      await page.waitForURL('**/contracts');
      await expect(page.locator('[data-testid="contracts-table"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/contracts', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('/contracts');

      // Verify error message is displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Error');
    });

    test('should handle empty contract lists', async ({ page }) => {
      // Mock API to return empty results
      await page.route('**/api/contracts', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            contracts: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
          })
        });
      });

      await page.goto('/contracts');

      // Verify empty state message
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-state"]')).toContainText('No contracts found');
    });
  });
});
