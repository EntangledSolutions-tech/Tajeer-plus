# Test Suite Documentation

This document provides comprehensive information about the test suite for the Tajeer Plus application, specifically focusing on vehicle customers and contracts functionality.

## Test Structure

The test suite is organized using **End-to-End (E2E) tests** with Playwright, following the same pattern as the existing authentication tests in the project.

### Test Categories

1. **Vehicle Contract Management** (`vehicle-contracts.spec.ts`)
   - Vehicle contracts list display
   - Status filtering for vehicle contracts
   - Search functionality
   - Navigation to contract details
   - Empty state handling
   - API error handling

2. **Customer Contract Management** (`customer-contracts.spec.ts`)
   - Customer contracts list display
   - Status filtering for customer contracts
   - Search functionality with debouncing
   - Navigation to contract details
   - Summary statistics display
   - Pagination handling
   - Empty state handling
   - API error handling

3. **Contract Creation Workflow** (`contract-creation.spec.ts`)
   - Contract creation modal opening
   - Multi-step form navigation
   - Form validation
   - Data persistence across steps
   - Success/error handling
   - Progress indication
   - Back navigation through steps

4. **Contract Details View** (`contract-details.spec.ts`)
   - Contract details display
   - Status badge rendering
   - Contract overview information
   - Customer information display
   - Vehicle information display
   - Pricing and terms information
   - Vehicle inspection information
   - Documents information
   - Contract editing functionality
   - Print and export functionality
   - Status change handling

5. **Contract Management Integration** (`contracts.spec.ts`)
   - Contract list management
   - Cross-navigation between different sections
   - Error handling scenarios
   - Pagination testing

## Test Files Created

### E2E Test Files

#### Vehicle Contract Management Tests
- **File**: `apps/e2e/tests/contracts/vehicle-contracts.spec.ts`
- **Purpose**: Tests vehicle-specific contract management functionality
- **Coverage**:
  - Contract list display and navigation
  - Status filtering (Active, Completed)
  - Search functionality
  - Navigation to contract details
  - Empty state handling
  - API error scenarios

#### Customer Contract Management Tests
- **File**: `apps/e2e/tests/contracts/customer-contracts.spec.ts`
- **Purpose**: Tests customer-specific contract management functionality
- **Coverage**:
  - Contract list display and navigation
  - Status filtering (All Status, Active, Completed)
  - Search functionality with debouncing
  - Navigation to contract details
  - Summary statistics display
  - Pagination handling
  - Empty state handling
  - API error scenarios

#### Contract Creation Workflow Tests
- **File**: `apps/e2e/tests/contracts/contract-creation.spec.ts`
- **Purpose**: Tests the complete contract creation process
- **Coverage**:
  - Modal opening and closing
  - Multi-step form navigation (6 steps)
  - Form validation and error handling
  - Data persistence across steps
  - Success and error scenarios
  - Progress indication
  - Back navigation through steps

#### Contract Details View Tests
- **File**: `apps/e2e/tests/contracts/contract-details.spec.ts`
- **Purpose**: Tests contract details viewing and management
- **Coverage**:
  - Contract details display
  - Status badge rendering
  - All information sections (overview, customer, vehicle, pricing, inspection, documents)
  - Contract editing functionality
  - Print and export functionality
  - Status change handling

#### Contract Management Integration Tests
- **File**: `apps/e2e/tests/contracts/contracts.spec.ts`
- **Purpose**: Tests integration between different contract management features
- **Coverage**:
  - Contract list management
  - Cross-navigation between vehicle/customer/contract sections
  - Error handling scenarios
  - Pagination testing

## Test Configuration

### Playwright Configuration
- **File**: `apps/e2e/playwright.config.ts` (existing)
- **Features**:
  - Browser testing (Chromium)
  - Screenshot on failure
  - Trace collection on retry
  - 60-second timeout
  - Local development server integration

### Test Environment Setup
- **Authentication**: Each test authenticates using test credentials
- **Base URL**: `http://localhost:3000`
- **Test Data**: Uses realistic mock data for contracts, customers, and vehicles

## Running Tests

### E2E Tests
```bash
# Run all E2E tests
pnpm --filter e2e test

# Run specific contract tests
pnpm --filter e2e test contracts/

# Run tests with UI
pnpm --filter e2e test:ui

# Show test report
pnpm --filter e2e report

# Run tests in headed mode (for debugging)
pnpm --filter e2e test --headed

# Run specific test file
pnpm --filter e2e test vehicle-contracts.spec.ts
```

## Test Data and Mocking

### Mock Data Structure
```typescript
interface Contract {
  id: string;
  contract_number: string;
  tajeer_number?: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total_amount: number;
  vehicle_plate?: string;
  created_at: string;
}
```

### API Mocking Strategy
- **Success Responses**: Realistic contract data with proper pagination
- **Error Responses**: HTTP 500 errors for error handling tests
- **Empty Responses**: Empty arrays for empty state tests
- **Paginated Responses**: Dynamic pagination based on page parameter

## Test Coverage Areas

### User Interface Testing
- ✅ Contract list display and navigation
- ✅ Status filtering and search functionality
- ✅ Multi-step form workflows
- ✅ Modal interactions
- ✅ Pagination controls
- ✅ Error message display
- ✅ Empty state handling

### User Workflow Testing
- ✅ Complete contract creation process
- ✅ Contract viewing and editing
- ✅ Cross-navigation between sections
- ✅ Status change workflows
- ✅ Print and export functionality

### Error Handling Testing
- ✅ API error scenarios
- ✅ Network failure handling
- ✅ Form validation errors
- ✅ Empty data states

### Integration Testing
- ✅ Vehicle-to-contract navigation
- ✅ Customer-to-contract navigation
- ✅ Contract-to-details navigation
- ✅ Cross-section data consistency

## Best Practices Implemented

### Test Organization
1. **Grouped by functionality** using `test.describe` blocks
2. **Descriptive test names** that explain expected behavior
3. **Consistent authentication** setup in `beforeEach` hooks
4. **Realistic user interactions** (clicks, typing, navigation)
5. **Proper waiting strategies** for async operations

### Test Data Management
1. **Realistic mock data** that mirrors production scenarios
2. **Dynamic API responses** based on request parameters
3. **Comprehensive error scenarios** for robust testing
4. **Edge case coverage** including empty states and errors

### E2E Test Considerations
1. **Complete user workflows** from start to finish
2. **Cross-browser compatibility** (Chromium focus)
3. **Proper element selection** using data-testid attributes
4. **Asynchronous operation handling** with proper waits
5. **Clean test isolation** with fresh authentication per test

## Debugging Tests

### E2E Test Debugging
```bash
# Run tests in headed mode for visual debugging
pnpm --filter e2e test --headed

# Run specific test with debug mode
pnpm --filter e2e test --debug vehicle-contracts.spec.ts

# Run tests with trace collection
pnpm --filter e2e test --trace on

# Show test report with screenshots
pnpm --filter e2e report
```

### Debugging Tips
1. **Use headed mode** to see what's happening visually
2. **Add console.log statements** for debugging (remove in production)
3. **Use page.pause()** to pause execution at specific points
4. **Check trace files** for detailed execution information
5. **Verify data-testid attributes** are present in components

## Continuous Integration

### GitHub Actions Integration
The test suite is designed to run in CI environments with:
- **Parallel test execution** for faster feedback
- **Screenshot collection** on test failures
- **Trace collection** for debugging failed tests
- **Multi-browser testing** capability (currently Chromium)

### Pre-commit Considerations
Consider adding pre-commit hooks to:
- Run E2E tests before major releases
- Validate test file structure
- Ensure data-testid attributes are present

## Maintenance

### Regular Updates
1. **Update test data** as the application evolves
2. **Add tests for new features** following established patterns
3. **Review and update selectors** if UI changes
4. **Remove obsolete tests** for deprecated functionality

### Test Performance
1. **Optimize test execution time** by reducing unnecessary waits
2. **Use parallel execution** where possible
3. **Minimize test data** to reduce setup time
4. **Cache expensive operations** in test setup

## Troubleshooting

### Common Issues
1. **Element not found**: Check data-testid attributes are present
2. **Test timeouts**: Increase timeout values for slow operations
3. **Authentication failures**: Verify test credentials are correct
4. **API mocking issues**: Check route patterns match actual API calls

### Debug Tools
- **Playwright Inspector**: Use `--debug` flag for step-by-step debugging
- **Trace Viewer**: Analyze test execution with `--trace on`
- **Screenshots**: Automatic screenshots on failure for visual debugging
- **Console logs**: Use `console.log` for debugging (remove in production)

This comprehensive E2E test suite ensures the reliability and user experience of the vehicle customers and contracts functionality in the Tajeer Plus application, following the same proven patterns as the existing authentication tests.
