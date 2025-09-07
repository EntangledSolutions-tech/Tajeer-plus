import { expect, test } from '@playwright/test';

test.describe('Contract Details View E2E Tests', () => {
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

  test('should display contract details', async ({ page }) => {
    // Navigate to contracts list
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract to view details
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');

    // Wait for contract details page
    await page.waitForURL('**/contracts/**');

    // Verify contract details are displayed
    await expect(page.locator('[data-testid="contract-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="contract-customer-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="contract-vehicle-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="contract-pricing-info"]')).toBeVisible();
  });

  test('should display contract status correctly', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify status badge is displayed
    await expect(page.locator('[data-testid="contract-status-badge"]')).toBeVisible();

    // Check if status is one of the expected values
    const statusText = await page.locator('[data-testid="contract-status-badge"]').textContent();
    expect(['Draft', 'Active', 'Completed', 'Cancelled']).toContain(statusText);
  });

  test('should display contract overview information', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify contract overview section
    await expect(page.locator('[data-testid="contract-overview"]')).toBeVisible();

    // Check for key contract information
    await expect(page.locator('[data-testid="contract-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="tajeer-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test('should display customer information', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify customer information section
    await expect(page.locator('[data-testid="contract-customer-info"]')).toBeVisible();

    // Check for customer details
    await expect(page.locator('[data-testid="customer-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-id-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-classification"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-license-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-address"]')).toBeVisible();
  });

  test('should display vehicle information', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify vehicle information section
    await expect(page.locator('[data-testid="contract-vehicle-info"]')).toBeVisible();

    // Check for vehicle details
    await expect(page.locator('[data-testid="vehicle-plate"]')).toBeVisible();
    await expect(page.locator('[data-testid="vehicle-serial-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="vehicle-make"]')).toBeVisible();
    await expect(page.locator('[data-testid="vehicle-model"]')).toBeVisible();
    await expect(page.locator('[data-testid="vehicle-year"]')).toBeVisible();
    await expect(page.locator('[data-testid="vehicle-color"]')).toBeVisible();
  });

  test('should display pricing and terms information', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify pricing information section
    await expect(page.locator('[data-testid="contract-pricing-info"]')).toBeVisible();

    // Check for pricing details
    await expect(page.locator('[data-testid="daily-rental-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="hourly-delay-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-km"]')).toBeVisible();
    await expect(page.locator('[data-testid="rental-days"]')).toBeVisible();
    await expect(page.locator('[data-testid="permitted-daily-km"]')).toBeVisible();
    await expect(page.locator('[data-testid="excess-km-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test('should display vehicle inspection information', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify vehicle inspection section
    await expect(page.locator('[data-testid="contract-inspection-info"]')).toBeVisible();

    // Check for inspection details
    await expect(page.locator('[data-testid="inspector-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="inspection-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="inspection-notes"]')).toBeVisible();
  });

  test('should display documents information', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Verify documents section
    await expect(page.locator('[data-testid="contract-documents-info"]')).toBeVisible();

    // Check for documents details
    await expect(page.locator('[data-testid="documents-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="documents-list"]')).toBeVisible();
  });

  test('should allow editing contract details', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Click edit button
    await page.click('[data-testid="edit-contract-button"]');

    // Verify edit modal is opened
    await expect(page.locator('[data-testid="edit-contract-modal"]')).toBeVisible();

    // Make some changes
    await page.fill('[data-testid="edit-total-amount"]', '3500');

    // Save changes
    await page.click('[data-testid="save-changes-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Contract updated successfully');

    // Verify modal is closed
    await expect(page.locator('[data-testid="edit-contract-modal"]')).not.toBeVisible();
  });

  test('should allow printing contract', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Set up print dialog handler
    page.on('dialog', dialog => dialog.accept());

    // Click print button
    await page.click('[data-testid="print-contract-button"]');

    // Verify print dialog was triggered (this is handled by the dialog handler)
    // In a real test, you might want to verify the print preview or PDF generation
  });

  test('should allow exporting contract', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('[data-testid="export-contract-button"]');

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toMatch(/contract.*\.pdf$/);
  });

  test('should handle contract status changes', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on first contract
    await page.click('[data-testid="contract-row"]:first-child [data-testid="view-button"]');
    await page.waitForURL('**/contracts/**');

    // Click status change button
    await page.click('[data-testid="change-status-button"]');

    // Verify status change modal is opened
    await expect(page.locator('[data-testid="status-change-modal"]')).toBeVisible();

    // Select new status
    await page.selectOption('[data-testid="new-status"]', 'completed');

    // Add status change reason
    await page.fill('[data-testid="status-change-reason"]', 'Contract completed successfully');

    // Confirm status change
    await page.click('[data-testid="confirm-status-change"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Status updated successfully');

    // Verify modal is closed
    await expect(page.locator('[data-testid="status-change-modal"]')).not.toBeVisible();

    // Verify status badge is updated
    await expect(page.locator('[data-testid="contract-status-badge"]')).toContainText('Completed');
  });
});
