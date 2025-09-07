import { expect, test } from '@playwright/test';

test.describe('Vehicle Creation E2E Tests', () => {
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

  test('should open vehicle creation modal', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Click on Create Vehicle button
    await page.click('[data-testid="create-vehicle-button"]');

    // Verify modal is opened
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Verify stepper is displayed
    await expect(page.locator('[data-testid="vehicle-stepper"]')).toBeVisible();

    // Verify first step is active
    await expect(page.locator('[data-testid="step-basic-info"]')).toHaveClass(/active/);
  });

  test('should navigate through vehicle creation steps', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Step 1: Basic Information
    await page.fill('[data-testid="plate-number"]', 'ABC-123');
    await page.selectOption('[data-testid="make"]', 'Toyota');
    await page.selectOption('[data-testid="model"]', 'Camry');
    await page.fill('[data-testid="make-year"]', '2023');
    await page.selectOption('[data-testid="color"]', 'White');
    await page.fill('[data-testid="vin-number"]', '1HGBH41JXMN109186');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify technical specifications step is active
    await expect(page.locator('[data-testid="step-technical-specs"]')).toHaveClass(/active/);

    // Step 2: Technical Specifications
    await page.fill('[data-testid="engine-size"]', '2.5L');
    await page.fill('[data-testid="fuel-type"]', 'Gasoline');
    await page.fill('[data-testid="transmission"]', 'Automatic');
    await page.fill('[data-testid="mileage"]', '15000');
    await page.fill('[data-testid="seating-capacity"]', '5');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify pricing step is active
    await expect(page.locator('[data-testid="step-pricing"]')).toHaveClass(/active/);

    // Step 3: Pricing
    await page.fill('[data-testid="expected-sale-price"]', '25000');
    await page.fill('[data-testid="daily-rental-rate"]', '100');
    await page.fill('[data-testid="monthly-rental-rate"]', '2500');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify branch assignment step is active
    await expect(page.locator('[data-testid="step-branch-assignment"]')).toHaveClass(/active/);

    // Step 4: Branch Assignment
    await page.selectOption('[data-testid="branch"]', 'branch-1');
    await page.selectOption('[data-testid="status"]', 'available');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify features step is active
    await expect(page.locator('[data-testid="step-features"]')).toHaveClass(/active/);

    // Step 5: Features
    await page.check('[data-testid="feature-air-conditioning"]');
    await page.check('[data-testid="feature-gps"]');
    await page.check('[data-testid="feature-bluetooth"]');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Verify documents step is active
    await expect(page.locator('[data-testid="step-documents"]')).toHaveClass(/active/);

    // Step 6: Documents
    await page.fill('[data-testid="documents-count"]', '3');

    // Submit the vehicle
    await page.click('[data-testid="submit-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Vehicle created successfully');

    // Verify modal is closed
    await expect(page.locator('[data-testid="vehicle-modal"]')).not.toBeVisible();
  });

  test('should validate required fields in vehicle creation', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Try to proceed without filling required fields
    await page.click('[data-testid="next-button"]');

    // Verify validation errors are shown
    await expect(page.locator('[data-testid="plate-number-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="make-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="model-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="make-year-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="color-error"]')).toBeVisible();
  });

  test('should cancel vehicle creation', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Click Cancel button
    await page.click('[data-testid="cancel-button"]');

    // Verify modal is closed
    await expect(page.locator('[data-testid="vehicle-modal"]')).not.toBeVisible();
  });

  test('should handle API errors during vehicle creation', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/vehicles', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Fill all required fields quickly
    await page.fill('[data-testid="plate-number"]', 'ABC-123');
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
    await page.check('[data-testid="feature-gps"]');
    await page.click('[data-testid="next-button"]');

    await page.fill('[data-testid="documents-count"]', '3');
    await page.click('[data-testid="submit-button"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to create vehicle');
  });

  test('should navigate back through stepper steps', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Fill first step and move to second step
    await page.fill('[data-testid="plate-number"]', 'ABC-123');
    await page.selectOption('[data-testid="make"]', 'Toyota');
    await page.selectOption('[data-testid="model"]', 'Camry');
    await page.fill('[data-testid="make-year"]', '2023');
    await page.selectOption('[data-testid="color"]', 'White');
    await page.fill('[data-testid="vin-number"]', '1HGBH41JXMN109186');
    await page.click('[data-testid="next-button"]');

    // Verify we're on second step
    await expect(page.locator('[data-testid="step-technical-specs"]')).toHaveClass(/active/);

    // Click Back button
    await page.click('[data-testid="back-button"]');

    // Verify we're back on first step
    await expect(page.locator('[data-testid="step-basic-info"]')).toHaveClass(/active/);

    // Verify form data is preserved
    await expect(page.locator('[data-testid="plate-number"]')).toHaveValue('ABC-123');
    await expect(page.locator('[data-testid="make"]')).toHaveValue('Toyota');
    await expect(page.locator('[data-testid="model"]')).toHaveValue('Camry');
  });

  test('should show progress indicator correctly', async ({ page }) => {
    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Verify progress indicator shows step 1 of 6
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 1 of 6');

    // Move to next step
    await page.fill('[data-testid="plate-number"]', 'ABC-123');
    await page.selectOption('[data-testid="make"]', 'Toyota');
    await page.selectOption('[data-testid="model"]', 'Camry');
    await page.fill('[data-testid="make-year"]', '2023');
    await page.selectOption('[data-testid="color"]', 'White');
    await page.fill('[data-testid="vin-number"]', '1HGBH41JXMN109186');
    await page.click('[data-testid="next-button"]');

    // Verify progress indicator shows step 2 of 6
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('Step 2 of 6');
  });

  test('should validate unique plate number', async ({ page }) => {
    // Mock API to return existing plate number error
    await page.route('**/api/vehicles', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Plate number already exists' })
      });
    });

    await page.goto('/vehicles');
    await page.waitForSelector('[data-testid="vehicles-table"]');

    // Open vehicle creation modal
    await page.click('[data-testid="create-vehicle-button"]');
    await expect(page.locator('[data-testid="vehicle-modal"]')).toBeVisible();

    // Fill form with existing plate number
    await page.fill('[data-testid="plate-number"]', 'EXISTING-123');
    await page.selectOption('[data-testid="make"]', 'Toyota');
    await page.selectOption('[data-testid="model"]', 'Camry');
    await page.fill('[data-testid="make-year"]', '2023');
    await page.selectOption('[data-testid="color"]', 'White');
    await page.fill('[data-testid="vin-number"]', '1HGBH41JXMN109186');
    await page.click('[data-testid="next-button"]');

    // Fill remaining steps quickly
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

    // Verify validation error is displayed
    await expect(page.locator('[data-testid="plate-number-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="plate-number-error"]')).toContainText('Plate number already exists');
  });
});
