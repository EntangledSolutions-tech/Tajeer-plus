import { expect, test } from '@playwright/test';

test.describe('Vehicle Contract Management E2E Tests', () => {
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

  test('should display vehicle contracts list', async ({ page }) => {
    // Navigate to vehicles page
    await page.goto('/vehicles');

    // Wait for vehicles list to load
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Click on first vehicle to view details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');

    // Wait for vehicle details page
    await page.waitForURL('**/vehicles/**');

    // Click on Contracts tab
    await page.click('[data-testid="contracts-tab"]');

    // Verify contracts section is displayed
    await expect(page.locator('[data-testid="contracts-section"]')).toBeVisible();

    // Check for summary cards
    await expect(page.locator('[data-testid="contracts-summary"]')).toBeVisible();

    // Check for contracts table
    await expect(page.locator('[data-testid="contracts-table"]')).toBeVisible();
  });

  test('should filter vehicle contracts by status', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Navigate to vehicle details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/vehicles/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
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

  test('should search vehicle contracts', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Navigate to vehicle details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/vehicles/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
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

  test('should navigate to contract details from vehicle contracts', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Navigate to vehicle details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/vehicles/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on Details button for first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="details-button"]');

    // Verify navigation to contract details page
    await page.waitForURL('**/contracts/**');
    await expect(page.locator('[data-testid="contract-details"]')).toBeVisible();
  });

  test('should handle empty vehicle contracts state', async ({ page }) => {
    // Mock API to return empty results
    await page.route('**/api/vehicles/*/contracts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          contracts: [],
          summary: { total: 0, active: 0, completed: 0 },
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
        })
      });
    });

    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Navigate to vehicle details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/vehicles/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');

    // Verify empty state message
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No contracts found for this vehicle');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/vehicles/*/contracts', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Navigate to vehicle details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/vehicles/**');

    // Go to contracts tab
    await page.click('[data-testid="contracts-tab"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Error');
  });
});
