# Finance Module Database Schema

## Overview
This document describes the comprehensive database schema for the Finance Module of the Tajeer-Plus vehicle rental system. The schema supports all the financial operations required by the existing finance pages and provides a solid foundation for future financial features.

## Database Structure

### Core Finance Tables

#### 1. Finance Transaction Types (`public.finance_transaction_types`)
Master table containing all possible transaction types with categories.

**Key Fields:**
- `id` - Primary key (UUID)
- `name` - Human-readable transaction type name
- `code` - Unique code for programmatic reference
- `category` - Transaction category ('income', 'expense', 'asset_transaction')
- `description` - Optional description
- `is_active` - Whether this transaction type is currently active

**Categories:**
- **Income**: Rental income, late fees, penalties, service fees, insurance claims, customer payments, vehicle sales
- **Expense**: Fuel, maintenance, insurance, office, marketing, employee, utility, rent, equipment costs
- **Asset Transaction**: Asset purchases, sales, deprecation, transfers

#### 2. Finance Transactions (`public.finance_transactions`)
Main table storing all financial transactions with comprehensive financial calculations.

**Key Fields:**
- `id` - Primary key (UUID)
- `transaction_number` - Unique transaction number (auto-generated)
- `transaction_type_id` - Foreign key to finance_transaction_types
- `amount` - Base transaction amount
- `currency` - Currency code (default: SAR)
- `transaction_date` - Date of transaction
- `description` - Transaction description

**Related Entities:**
- `branch_id` - Associated branch
- `vehicle_id` - Associated vehicle
- `customer_id` - Associated customer
- `contract_id` - Associated contract
- `employee_name` - Employee handling transaction

**Invoice Details:**
- `invoice_number` - Invoice reference
- `invoice_date` - Invoice date
- `payment_type` - Payment method ('cash', 'card', 'bank_transfer', 'check')

**VAT Calculations:**
- `vat_included` - Whether VAT is included in total amount
- `vat_rate` - VAT rate percentage (default: 15%)
- `vat_amount` - Calculated VAT amount

**Financial Calculations:**
- `total_amount` - Total transaction amount
- `total_discount` - Applied discount
- `net_invoice` - Net invoice amount after discount and VAT
- `total_paid` - Amount paid
- `remaining_amount` - Outstanding amount

**Status & Metadata:**
- `status` - Transaction status ('pending', 'completed', 'cancelled')
- `user_id` - Owner of the transaction
- `created_at` / `updated_at` - Timestamps

### Specialized Finance Tables

#### 3. Rental Expenses (`public.rental_expenses`)
Specific details for rental company expenses.

**Key Fields:**
- `transaction_id` - Reference to main finance_transaction
- `expense_type` - Type of expense ('fuel', 'maintenance', 'insurance', 'office', 'marketing', etc.)
- `vendor_name` - Vendor/supplier name
- `receipt_number` - Receipt reference
- `receipt_date` - Receipt date

#### 4. Rental Income (`public.rental_income`)
Specific details for rental company income.

**Key Fields:**
- `transaction_id` - Reference to main finance_transaction
- `income_type` - Type of income ('rental', 'late_fee', 'penalty', 'service_fee', etc.)
- `source` - Income source ('contract', 'service', 'penalty', etc.)

#### 5. Customer Finance Transactions (`public.customer_finance_transactions`)
Specific details for customer-related financial transactions.

**Key Fields:**
- `transaction_id` - Reference to main finance_transaction
- `customer_id` - Associated customer
- `transaction_category` - Category ('payment', 'penalty', 'refund', 'adjustment')
- `penalty_reason` - Reason for penalty (if applicable)

#### 6. Vehicle Finance Transactions (`public.vehicle_finance_transactions`)
Specific details for vehicle-related financial transactions.

**Key Fields:**
- `transaction_id` - Reference to main finance_transaction
- `vehicle_id` - Associated vehicle
- `transaction_category` - Category ('sell', 'return', 'deprecation', 'penalty', 'maintenance', 'service', 'insurance', 'accident')

**Specific Fields by Category:**
- **Deprecation**: `expected_sale_price`, `lease_amount_increase`
- **Penalty**: `penalty_reason`, `penalty_date`
- **Insurance**: `insurance_company`, `policy_number`
- **Maintenance**: `maintenance_type`
- **Service**: `service_type`
- **Accident**: `accident_description`

#### 7. Finance Summaries (`public.finance_summaries`)
Pre-calculated summary data for reporting and dashboard display.

**Key Fields:**
- `summary_type` - Type of summary ('daily', 'monthly', 'yearly', 'customer', 'vehicle', 'branch')
- `summary_date` - Date for the summary
- `entity_id` - Associated entity (customer, vehicle, or branch ID)

**Financial Metrics:**
- `total_revenue` - Total revenue for period
- `total_expenses` - Total expenses for period
- `net_profit` - Net profit (revenue - expenses)
- `total_transactions` - Number of transactions

**Specific Metrics:**
- `rental_income` - Income from rentals
- `penalty_income` - Income from penalties
- `maintenance_costs` - Maintenance expenses
- `fuel_costs` - Fuel expenses
- `insurance_costs` - Insurance expenses

## Database Functions

### 1. `generate_transaction_number(transaction_type_code)`
Generates unique transaction numbers with prefixes based on transaction type:
- RIN - Rental Income
- LAT - Late Fee
- PEN - Penalty Fee
- SRV - Service Fee
- INS - Insurance Claim
- CPY - Customer Payment
- CCL - Contract Closure
- PPY - Penalty Payment
- REF - Refund Adjustment
- VSL - Vehicle Sale
- VRT - Vehicle Return
- DRC - Deprecation Recovery
- FUE - Fuel Expense
- MNT - Maintenance Expense
- INE - Insurance Expense
- OFF - Office Expense
- MKT - Marketing Expense
- EMP - Employee Expense
- UTL - Utility Expense
- REN - Rent Expense
- EQP - Equipment Expense
- VPR - Vehicle Purchase
- VDP - Vehicle Deprecation
- VPN - Vehicle Penalty
- VSC - Vehicle Service
- VAC - Vehicle Accident
- APR - Asset Purchase
- ASL - Asset Sale
- ADP - Asset Deprecation
- ATR - Asset Transfer

### 2. `calculate_vat_amount(total_amount, vat_rate, vat_included)`
Calculates VAT amount based on whether VAT is included or added to the total.

### 3. `calculate_net_invoice(total_amount, total_discount, vat_amount, vat_included)`
Calculates net invoice amount considering discounts and VAT.

### 4. `calculate_remaining_amount(net_invoice, total_paid)`
Calculates remaining outstanding amount.

## Security & Performance

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data:
- Users can view, insert, update, and delete their own transactions
- Transaction types are readable by all users
- Proper foreign key constraints maintain data integrity

### Indexes
Comprehensive indexing strategy for optimal performance:
- Foreign key indexes for joins
- Date indexes for time-based queries
- Status indexes for filtering
- Composite indexes for complex queries

### Triggers
Automatic `updated_at` timestamp updates for all tables.

## Integration with Existing Pages

### Rental Finances Page
- Uses `rental_expenses` and `rental_income` tables
- Supports expense and income transaction creation
- Integrates with branches, vehicles, and contracts

### Customer Finances Page
- Uses `customer_finance_transactions` table
- Supports customer payment tracking
- Includes penalty and refund handling

### Vehicle Finances Page
- Uses `vehicle_finance_transactions` table
- Supports all vehicle transaction types (sell, return, deprecation, penalty, maintenance, service, insurance, accident)
- Integrates with vehicle and customer data

## Migration Files Created

1. **`20250131000003_create_finance_tables.sql`** - Main schema creation
2. **`20250131000004_seed_finance_data.sql`** - Transaction types and utility functions
3. **`20250131000005_sample_finance_data.sql`** - Sample data for testing

## Future Enhancements

### Reporting & Analytics
- Financial reports by period, branch, vehicle, or customer
- Profit/loss statements
- Cash flow analysis
- Budget vs actual comparisons

### Advanced Features
- Multi-currency support
- Automated reconciliation
- Financial forecasting
- Integration with accounting systems
- Audit trails and compliance reporting

### API Integration
- RESTful APIs for all finance operations
- Real-time financial dashboards
- Automated transaction processing
- Third-party payment gateway integration

## Usage Examples

### Creating a Rental Expense
```sql
INSERT INTO public.finance_transactions (
    transaction_number,
    transaction_type_id,
    amount,
    transaction_date,
    description,
    branch_id,
    vehicle_id,
    employee_name,
    total_amount,
    net_invoice,
    user_id
) VALUES (
    generate_transaction_number('FUEL_EXPENSE'),
    (SELECT id FROM finance_transaction_types WHERE code = 'FUEL_EXPENSE'),
    150.00,
    CURRENT_DATE,
    'Fuel expense for vehicle maintenance',
    'branch-uuid',
    'vehicle-uuid',
    'Ahmed Al-Rashid',
    150.00,
    calculate_net_invoice(150.00, 0.00, calculate_vat_amount(150.00, 15.00, false), false),
    'user-uuid'
);
```

### Creating a Vehicle Sale
```sql
INSERT INTO public.finance_transactions (
    transaction_number,
    transaction_type_id,
    amount,
    transaction_date,
    description,
    branch_id,
    vehicle_id,
    customer_id,
    invoice_number,
    invoice_date,
    payment_type,
    vat_included,
    total_amount,
    net_invoice,
    user_id
) VALUES (
    generate_transaction_number('VEHICLE_SALE'),
    (SELECT id FROM finance_transaction_types WHERE code = 'VEHICLE_SALE'),
    50000.00,
    CURRENT_DATE,
    'Vehicle sale transaction',
    'branch-uuid',
    'vehicle-uuid',
    'customer-uuid',
    'INV-VEH-001',
    CURRENT_DATE,
    'bank_transfer',
    true,
    50000.00,
    calculate_net_invoice(50000.00, 0.00, calculate_vat_amount(50000.00, 15.00, true), true),
    'user-uuid'
);
```

This comprehensive finance database schema provides a solid foundation for all financial operations in the Tajeer-Plus system, supporting the existing finance pages and enabling future financial features and reporting capabilities.




