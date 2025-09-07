import { expect, test } from '@playwright/test';

test.describe('Contract Creation Workflow E2E Tests', () => {
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

  test('should open contract creation modal', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Click on Create Contract button
    await page.click('[data-testid="create-contract-button"]');

    // Verify modal is opened
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Verify stepper is displayed
    await expect(page.locator('[data-testid="contract-stepper"]')).toBeVisible();

    // Verify first step is active
    await expect(page.locator('[data-testid="step-contract-details"]')).toHaveClass(/active/);
  });

  test('should navigate through contract creation steps', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Open contract creation modal
    await page.click('[data-testid="create-contract-button"]');
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Fill contract details step
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="contract-type"]', 'rental');
    await page.selectOption('[data-testid="insurance-type"]', 'comprehensive');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify customer details step is active
    await expect(page.locator('[data-testid="step-customer-details"]')).toHaveClass(/active/);

    // Fill customer details
    await page.selectOption('[data-testid="customer-type"]', 'new');
    await page.fill('[data-testid="customer-name"]', 'John Doe');
    await page.fill('[data-testid="customer-id-number"]', '1234567890');
    await page.selectOption('[data-testid="customer-classification"]', 'individual');
    await page.fill('[data-testid="customer-date-of-birth"]', '1990-01-01');
    await page.selectOption('[data-testid="customer-license-type"]', 'driving');
    await page.fill('[data-testid="customer-address"]', '123 Main St, City');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify vehicle details step is active
    await expect(page.locator('[data-testid="step-vehicle-details"]')).toHaveClass(/active/);

    // Fill vehicle details
    await page.selectOption('[data-testid="selected-vehicle-id"]', 'vehicle-1');
    await page.fill('[data-testid="vehicle-plate"]', 'ABC-123');
    await page.fill('[data-testid="vehicle-serial-number"]', 'VIN123456789');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify pricing terms step is active
    await expect(page.locator('[data-testid="step-pricing-terms"]')).toHaveClass(/active/);

    // Fill pricing terms
    await page.fill('[data-testid="daily-rental-rate"]', '100');
    await page.fill('[data-testid="hourly-delay-rate"]', '10');
    await page.fill('[data-testid="current-km"]', '50000');
    await page.fill('[data-testid="rental-days"]', '31');
    await page.fill('[data-testid="permitted-daily-km"]', '200');
    await page.fill('[data-testid="excess-km-rate"]', '0.5');
    await page.selectOption('[data-testid="payment-method"]', 'card');
    await page.check('[data-testid="membership-enabled"]');
    await page.fill('[data-testid="total-amount"]', '3100');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify vehicle inspection step is active
    await expect(page.locator('[data-testid="step-vehicle-inspection"]')).toHaveClass(/active/);

    // Fill vehicle inspection
    await page.selectOption('[data-testid="selected-inspector"]', 'inspector-1');
    await page.fill('[data-testid="inspector-name"]', 'Inspector Name');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify documents step is active
    await expect(page.locator('[data-testid="step-documents"]')).toHaveClass(/active/);

    // Fill documents
    await page.fill('[data-testid="documents-count"]', '3');

    // Submit the contract
    await page.click('[data-testid="submit-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Contract created successfully');

    // Verify modal is closed
    await expect(page.locator('[data-testid="contract-modal"]')).not.toBeVisible();
  });

  test('should validate required fields in contract creation', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Open contract creation modal
    await page.click('[data-testid="create-contract-button"]');
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Try to proceed without filling required fields
    await page.click('[data-testid="next-button"]');

    // Verify validation errors are shown
    await expect(page.locator('[data-testid="start-date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="contract-type-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="insurance-type-error"]')).toBeVisible();
  });

  test('should cancel contract creation', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Open contract creation modal
    await page.click('[data-testid="create-contract-button"]');
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Click Cancel button
    await page.click('[data-testid="cancel-button"]');

    // Verify modal is closed
    await expect(page.locator('[data-testid="contract-modal"]')).not.toBeVisible();
  });

  test('should handle API errors during contract creation', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/contracts', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Open contract creation modal
    await page.click('[data-testid="create-contract-button"]');
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Fill all required fields quickly
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="contract-type"]', 'rental');
    await page.selectOption('[data-testid="insurance-type"]', 'comprehensive');
    await page.click('[data-testid="next-button"]');

    await page.selectOption('[data-testid="customer-type"]', 'new');
    await page.fill('[data-testid="customer-name"]', 'John Doe');
    await page.fill('[data-testid="customer-id-number"]', '1234567890');
    await page.selectOption('[data-testid="customer-classification"]', 'individual');
    await page.fill('[data-testid="customer-date-of-birth"]', '1990-01-01');
    await page.selectOption('[data-testid="customer-license-type"]', 'driving');
    await page.fill('[data-testid="customer-address"]', '123 Main St, City');
    await page.click('[data-testid="next-button"]');

    await page.selectOption('[data-testid="selected-vehicle-id"]', 'vehicle-1');
    await page.fill('[data-testid="vehicle-plate"]', 'ABC-123');
    await page.fill('[data-testid="vehicle-serial-number"]', 'VIN123456789');
    await page.click('[data-testid="next-button"]');

    await page.fill('[data-testid="daily-rental-rate"]', '100');
    await page.fill('[data-testid="hourly-delay-rate"]', '10');
    await page.fill('[data-testid="current-km"]', '50000');
    await page.fill('[data-testid="rental-days"]', '31');
    await page.fill('[data-testid="permitted-daily-km"]', '200');
    await page.fill('[data-testid="excess-km-rate"]', '0.5');
    await page.selectOption('[data-testid="payment-method"]', 'card');
    await page.fill('[data-testid="total-amount"]', '3100');
    await page.click('[data-testid="next-button"]');

    await page.selectOption('[data-testid="selected-inspector"]', 'inspector-1');
    await page.fill('[data-testid="inspector-name"]', 'Inspector Name');
    await page.click('[data-testid="next-button"]');

    await page.fill('[data-testid="documents-count"]', '3');
    await page.click('[data-testid="submit-button"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to create contract');
  });

  test('should navigate back through stepper steps', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Open contract creation modal
    await page.click('[data-testid="create-contract-button"]');
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Fill first step and move to second step
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="contract-type"]', 'rental');
    await page.selectOption('[data-testid="insurance-type"]', 'comprehensive');
    await page.click('[data-testid="next-button"]');

    // Verify we're on second step
    await expect(page.locator('[data-testid="step-customer-details"]')).toHaveClass(/active/);

    // Click Back button
    await page.click('[data-testid="back-button"]');

    // Verify we're back on first step
    await expect(page.locator('[data-testid="step-contract-details"]')).toHaveClass(/active/);

    // Verify form data is preserved
    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('2024-01-01');
    await expect(page.locator('[data-testid="end-date"]')).toHaveValue('2024-01-31');
    await expect(page.locator('[data-testid="contract-type"]')).toHaveValue('rental');
  });

  test('should show progress indicator correctly', async ({ page }) => {
    await page.goto('/contracts');
    await page.waitForSelector('[data-testid="contracts-table"]');

    // Open contract creation modal
    await page.click('[data-testid="create-contract-button"]');
    await expect(page.locator('[data-testid="contract-modal"]')).toBeVisible();

    // Verify progress indicator shows step 1 of 6
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 1 of 6');

    // Move to next step
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="contract-type"]', 'rental');
    await page.selectOption('[data-testid="insurance-type"]', 'comprehensive');
    await page.click('[data-testid="next-button"]');

    // Verify progress indicator shows step 2 of 6
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 2 of 6');
  });
});
