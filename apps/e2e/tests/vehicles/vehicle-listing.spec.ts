import { expect, test } from '@playwright/test';

test.describe('Vehicle Listing E2E Tests', () => {
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

  test('should display vehicles list with proper data', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify vehicles table is displayed
    await expect(page.locator('[data-testid="vehicles-table"]')).toBeVisible();

    // Verify table headers
    await expect(page.locator('[data-testid="plate-number-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="make-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="model-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="year-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="color-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="branch-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="mileage-header"]')).toBeVisible();
  });

  test('should filter vehicles by status', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Test Available filter
    await page.click('[data-testid="available-filter"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify only available vehicles are shown
    const statusBadges = page.locator('[data-testid="vehicle-status"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText('Available');
    }

    // Test Rented filter
    await page.click('[data-testid="rented-filter"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify only rented vehicles are shown
    const rentedBadges = page.locator('[data-testid="vehicle-status"]');
    const rentedCount = await rentedBadges.count();

    for (let i = 0; i < rentedCount; i++) {
      await expect(rentedBadges.nth(i)).toHaveText('Rented');
    }

    // Test Maintenance filter
    await page.click('[data-testid="maintenance-filter"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify only maintenance vehicles are shown
    const maintenanceBadges = page.locator('[data-testid="vehicle-status"]');
    const maintenanceCount = await maintenanceBadges.count();

    for (let i = 0; i < maintenanceCount; i++) {
      await expect(maintenanceBadges.nth(i)).toHaveText('Maintenance');
    }
  });

  test('should filter vehicles by branch', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Select a specific branch
    await page.selectOption('[data-testid="branch-filter"]', 'branch-1');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify only vehicles from selected branch are shown
    const branchCells = page.locator('[data-testid="vehicle-branch"]');
    const count = await branchCells.count();

    for (let i = 0; i < count; i++) {
      await expect(branchCells.nth(i)).toContainText('Branch 1');
    }
  });

  test('should search vehicles by plate number', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Search for a specific plate number
    await page.fill('[data-testid="vehicle-search"]', 'ABC-123');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify search results
    const vehicleRows = page.locator('[data-testid="vehicle-row"]');
    const count = await vehicleRows.count();

    // Should have at least one result
    expect(count).toBeGreaterThan(0);

    // Verify the plate number is visible
    await expect(page.locator('[data-testid="vehicle-plate"]')).toContainText('ABC-123');
  });

  test('should search vehicles by make and model', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Search for Toyota Camry
    await page.fill('[data-testid="vehicle-search"]', 'Toyota Camry');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify search results
    const vehicleRows = page.locator('[data-testid="vehicle-row"]');
    const count = await vehicleRows.count();

    // Should have at least one result
    expect(count).toBeGreaterThan(0);

    // Verify the make and model are visible
    await expect(page.locator('[data-testid="vehicle-make"]')).toContainText('Toyota');
    await expect(page.locator('[data-testid="vehicle-model"]')).toContainText('Camry');
  });

  test('should sort vehicles by different columns', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Test sorting by plate number
    await page.click('[data-testid="plate-number-header"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify sorting indicator is shown
    await expect(page.locator('[data-testid="plate-number-header"]')).toHaveClass(/sorted/);

    // Test sorting by make
    await page.click('[data-testid="make-header"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify sorting indicator is shown
    await expect(page.locator('[data-testid="make-header"]')).toHaveClass(/sorted/);

    // Test sorting by year
    await page.click('[data-testid="year-header"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify sorting indicator is shown
    await expect(page.locator('[data-testid="year-header"]')).toHaveClass(/sorted/);
  });

  test('should handle pagination correctly', async ({ page }) => {
    // Mock API to return paginated results
    await page.route('**/api/vehicles', route => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') || '1';

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          vehicles: Array.from({ length: 10 }, (_, i) => ({
            id: `vehicle-${(parseInt(pageParam) - 1) * 10 + i + 1}`,
            plate_number: `ABC-${String((parseInt(pageParam) - 1) * 10 + i + 1).padStart(3, '0')}`,
            make: 'Toyota',
            model: 'Camry',
            make_year: '2023',
            color: 'White',
            status: 'available',
            branch: 'Branch 1',
            mileage: 15000,
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

    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify pagination controls are displayed
    await expect(page.locator('[data-testid="pagination-controls"]')).toBeVisible();

    // Test next page navigation
    await page.click('[data-testid="next-page-button"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify we're on page 2
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');

    // Test previous page navigation
    await page.click('[data-testid="prev-page-button"]');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify we're back on page 1
    await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
  });

  test('should display vehicle summary statistics', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify summary cards are displayed
    await expect(page.locator('[data-testid="total-vehicles"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-vehicles"]')).toBeVisible();
    await expect(page.locator('[data-testid="rented-vehicles"]')).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-vehicles"]')).toBeVisible();

    // Verify summary cards contain numbers
    const totalVehicles = page.locator('[data-testid="total-vehicles"]');
    const availableVehicles = page.locator('[data-testid="available-vehicles"]');
    const rentedVehicles = page.locator('[data-testid="rented-vehicles"]');
    const maintenanceVehicles = page.locator('[data-testid="maintenance-vehicles"]');

    await expect(totalVehicles).toContainText(/\d+/);
    await expect(availableVehicles).toContainText(/\d+/);
    await expect(rentedVehicles).toContainText(/\d+/);
    await expect(maintenanceVehicles).toContainText(/\d+/);
  });

  test('should navigate to vehicle details', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Click on first vehicle to view details
    await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');

    // Wait for vehicle details page
    await page.waitForURL('**/vehicles/**');

    // Verify vehicle details page is displayed
    await expect(page.locator('[data-testid="vehicle-details"]')).toBeVisible();
  });

  test('should handle empty vehicle list', async ({ page }) => {
    // Mock API to return empty results
    await page.route('**/api/vehicles', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          vehicles: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
        })
      });
    });

    await page.goto('/vehicles');

    // Verify empty state message
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No vehicles found');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/vehicles', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/vehicles');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Error');
  });

  test('should export vehicles list', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('[data-testid="export-vehicles-button"]');

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/vehicles.*\.xlsx$/);
  });

  test('should refresh vehicles list', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Click refresh button
    await page.click('[data-testid="refresh-button"]');

    // Wait for table to reload
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify table is still visible
    await expect(page.locator('[data-testid="vehicles-table"]')).toBeVisible();
  });

  test('should change page size', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Change page size to 25
    await page.selectOption('[data-testid="page-size-selector"]', '25');

    // Wait for table to reload
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify table is still visible
    await expect(page.locator('[data-testid="vehicles-table"]')).toBeVisible();

    // Verify page size indicator shows 25
    await expect(page.locator('[data-testid="page-size-indicator"]')).toContainText('25');
  });

  test('should clear filters and search', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Apply some filters
    await page.click('[data-testid="available-filter"]');
    await page.fill('[data-testid="vehicle-search"]', 'Toyota');
    await page.selectOption('[data-testid="branch-filter"]', 'branch-1');

    // Wait for filters to apply
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Click clear filters button
    await page.click('[data-testid="clear-filters-button"]');

    // Wait for table to reload
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Verify search input is cleared
    await expect(page.locator('[data-testid="vehicle-search"]')).toHaveValue('');

    // Verify all filters are reset
    await expect(page.locator('[data-testid="available-filter"]')).not.toHaveClass(/active/);
    await expect(page.locator('[data-testid="branch-filter"]')).toHaveValue('');
  });
});
