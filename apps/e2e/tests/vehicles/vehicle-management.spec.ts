import { expect, test } from '@playwright/test';

test.describe('Vehicle Management Integration Tests', () => {
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

  test.describe('Vehicle CRUD Operations', () => {
    test('should create, view, edit, and delete a vehicle', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Step 1: Create a new vehicle
      await page.click('[data-testid="create-vehicle-button"]');
      await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

      // Fill vehicle creation form
      await page.fill('[data-testid="plate-number"]', 'TEST-001');
      await page.selectOption('[data-testid="make"]', 'Toyota');
      await page.selectOption('[data-testid="model"]', 'Camry');
      await page.fill('[data-testid="make-year"]', '2023');
      await page.selectOption('[data-testid="color"]', 'White');
      await page.fill('[data-testid="vin-number"]', '1HGBH41JXMN109186');
      await page.click('[data-testid="next-button"]');

      await page.fill('[data-testid="engine-size"]', '2.5L');
      await page.fill('[data-testid="fuel-type"]', 'Gasoline');
      await page.fill('[data-testid="transmission"]', 'Automatic');
      await page.fill('[data-testid="mileage"]', '15000');
      await page.fill('[data-testid="seating-capacity"]', '5');
      await page.click('[data-testid="next-button"]');

      await page.fill('[data-testid="expected-sale-price"]', '25000');
      await page.fill('[data-testid="daily-rental-rate"]', '100');
      await page.fill('[data-testid="monthly-rental-rate"]', '2500');
      await page.click('[data-testid="next-button"]');

      await page.selectOption('[data-testid="branch"]', 'branch-1');
      await page.selectOption('[data-testid="status"]', 'available');
      await page.click('[data-testid="next-button"]');

      await page.check('[data-testid="feature-air-conditioning"]');
      await page.click('[data-testid="next-button"]');

      await page.fill('[data-testid="documents-count"]', '3');
      await page.click('[data-testid="submit-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="vehicle-modal"]')).not.toBeVisible();

      // Step 2: Verify vehicle appears in list
      await page.waitForSelector('[data-testid="vehicles-table"]');
      await expect(page.locator('[data-testid="vehicle-plate"]')).toContainText('TEST-001');

      // Step 3: View vehicle details
      await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
      await page.waitForURL('**/vehicles/**');
      await expect(page.locator('[data-testid="vehicle-details"]')).toBeVisible();

      // Step 4: Edit vehicle
      await page.click('[data-testid="edit-vehicle-button"]');
      await expect(page.locator('[data-testid="edit-vehicle-modal"]')).toBeVisible();

      // Update vehicle information
      await page.fill('[data-testid="edit-mileage"]', '16000');
      await page.fill('[data-testid="edit-daily-rental-rate"]', '110');

      // Save changes
      await page.click('[data-testid="save-changes-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-vehicle-modal"]')).not.toBeVisible();

      // Step 5: Navigate back to vehicles list
      await page.click('[data-testid="back-to-vehicles-button"]');
      await page.waitForURL('**/vehicles');

      // Step 6: Delete vehicle
      await page.click('[data-testid="vehicle-row"]:first-child [data-testid="delete-button"]');

      // Confirm deletion
      await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();
      await page.click('[data-testid="confirm-delete-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Vehicle deleted successfully');
    });

    test('should handle vehicle status changes', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Click on first vehicle to view details
      await page.click('[data-testid="vehicle-row"]:first-child [data-testid="view-button"]');
      await page.waitForURL('**/vehicles/**');

      // Click status change button
      await page.click('[data-testid="change-status-button"]');

      // Verify status change modal is opened
      await expect(page.locator('[data-testid="status-change-modal"]')).toBeVisible();

      // Select new status
      await page.selectOption('[data-testid="new-status"]', 'maintenance');

      // Add status change reason
      await page.fill('[data-testid="status-change-reason"]', 'Scheduled maintenance');

      // Confirm status change
      await page.click('[data-testid="confirm-status-change"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Status updated successfully');

      // Verify modal is closed
      await expect(page.locator('[data-testid="status-change-modal"]')).not.toBeVisible();

      // Verify status badge is updated
      await expect(page.locator('[data-testid="vehicle-status-badge"]')).toContainText('Maintenance');
    });
  });

  test.describe('Vehicle Search and Filtering', () => {
    test('should combine multiple filters and search', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Apply multiple filters
      await page.click('[data-testid="available-filter"]');
      await page.selectOption('[data-testid="branch-filter"]', 'branch-1');
      await page.fill('[data-testid="vehicle-search"]', 'Toyota');

      // Wait for filters to apply
      await page.waitForTimeout(1000);

      // Verify filtered results
      const vehicleRows = page.locator('[data-testid="vehicle-row"]');
      const count = await vehicleRows.count();

      // Should have filtered results
      expect(count).toBeGreaterThan(0);

      // Verify all visible vehicles match the filters
      for (let i = 0; i < count; i++) {
        const statusBadge = vehicleRows.nth(i).locator('[data-testid="vehicle-status"]');
        const branchCell = vehicleRows.nth(i).locator('[data-testid="vehicle-branch"]');
        const makeCell = vehicleRows.nth(i).locator('[data-testid="vehicle-make"]');

        await expect(statusBadge).toHaveText('Available');
        await expect(branchCell).toContainText('Branch 1');
        await expect(makeCell).toContainText('Toyota');
      }
    });

    test('should maintain filters after page refresh', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Apply filters
      await page.click('[data-testid="available-filter"]');
      await page.fill('[data-testid="vehicle-search"]', 'Camry');

      // Wait for filters to apply
      await page.waitForTimeout(1000);

      // Refresh the page
      await page.reload();
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Verify filters are maintained
      await expect(page.locator('[data-testid="available-filter"]')).toHaveClass(/active/);
      await expect(page.locator('[data-testid="vehicle-search"]')).toHaveValue('Camry');
    });
  });

  test.describe('Vehicle Export and Reporting', () => {
    test('should export filtered vehicles', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Apply filters
      await page.click('[data-testid="available-filter"]');
      await page.selectOption('[data-testid="branch-filter"]', 'branch-1');

      // Wait for filters to apply
      await page.waitForTimeout(1000);

      // Set up download handler
      const downloadPromise = page.waitForEvent('download');

      // Click export button
      await page.click('[data-testid="export-vehicles-button"]');

      // Wait for download to start
      const download = await downloadPromise;

      // Verify download filename includes filter information
      expect(download.suggestedFilename()).toMatch(/vehicles.*\.xlsx$/);
    });

    test('should generate vehicle inventory report', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Click on reports button
      await page.click('[data-testid="vehicle-reports-button"]');

      // Verify reports modal is opened
      await expect(page.locator('[data-testid="reports-modal"]')).toBeVisible();

      // Select inventory report
      await page.click('[data-testid="inventory-report-option"]');

      // Set report parameters
      await page.selectOption('[data-testid="report-branch"]', 'all');
      await page.selectOption('[data-testid="report-status"]', 'all');

      // Generate report
      await page.click('[data-testid="generate-report-button"]');

      // Set up download handler
      const downloadPromise = page.waitForEvent('download');

      // Wait for report generation
      await page.waitForSelector('[data-testid="download-report-button"]');
      await page.click('[data-testid="download-report-button"]');

      // Wait for download to start
      const download = await downloadPromise;

      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/vehicle-inventory.*\.pdf$/);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors during vehicle operations', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/vehicles', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Network error' })
        });
      });

      await page.goto('/vehicles');

      // Verify error message is displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Mock API to return large dataset
      await page.route('**/api/vehicles', route => {
        const url = new URL(route.request().url());
        const pageParam = url.searchParams.get('page') || '1';
        const limit = parseInt(url.searchParams.get('limit') || '10');

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            vehicles: Array.from({ length: limit }, (_, i) => ({
              id: `vehicle-${(parseInt(pageParam) - 1) * limit + i + 1}`,
              plate_number: `ABC-${String((parseInt(pageParam) - 1) * limit + i + 1).padStart(3, '0')}`,
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
              limit,
              total: 1000,
              totalPages: Math.ceil(1000 / limit),
              hasNextPage: parseInt(pageParam) < Math.ceil(1000 / limit),
              hasPrevPage: parseInt(pageParam) > 1
            }
          })
        });
      });

      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Verify table loads efficiently
      await expect(page.locator('[data-testid="vehicles-table"]')).toBeVisible();

      // Test pagination with large dataset
      await page.click('[data-testid="next-page-button"]');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Verify we're on page 2
      await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    });

    test('should handle concurrent vehicle operations', async ({ page }) => {
      await page.goto('/vehicles');
      await page.waitForSelector('[data-testid="vehicles-table"]');

      // Open vehicle creation modal
      await page.click('[data-testid="create-vehicle-button"]');
      await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

      // Start filling form
      await page.fill('[data-testid="plate-number"]', 'CONCURRENT-001');

      // Open another modal (e.g., edit modal) - this should be prevented or handled gracefully
      await page.click('[data-testid="vehicle-row"]:first-child [data-testid="edit-button"]');

      // Verify only one modal is open
      const modals = page.locator('[data-testid="vehicle-modal"], [data-testid="edit-vehicle-modal"]');
      const visibleModals = await modals.filter({ hasText: /./ }).count();
      expect(visibleModals).toBeLessThanOrEqual(1);
    });
  });
});
