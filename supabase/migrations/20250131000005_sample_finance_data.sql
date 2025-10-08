-- Sample Finance Data
-- This migration creates sample finance data for testing and demonstration

-- Insert sample finance transactions for different users
-- Note: This will only work if there are existing users, branches, vehicles, and customers

-- Sample Rental Company Expenses
INSERT INTO public.finance_transactions (
    transaction_number,
    transaction_type_id,
    amount,
    transaction_date,
    description,
    branch_id,
    vehicle_id,
    employee_name,
    invoice_number,
    invoice_date,
    payment_type,
    vat_included,
    vat_rate,
    vat_amount,
    total_amount,
    total_discount,
    net_invoice,
    total_paid,
    remaining_amount,
    status,
    user_id
)
SELECT
    generate_transaction_number('FUEL_EXPENSE'),
    ftt.id,
    150.00,
    CURRENT_DATE - INTERVAL '1 day',
    'Fuel expense for vehicle maintenance',
    b.id,
    v.id,
    'Ahmed Al-Rashid',
    'INV-FUEL-001',
    CURRENT_DATE - INTERVAL '1 day',
    'cash',
    false,
    15.00,
    calculate_vat_amount(150.00, 15.00, false),
    150.00,
    0.00,
    calculate_net_invoice(150.00, 0.00, calculate_vat_amount(150.00, 15.00, false), false),
    150.00,
    calculate_remaining_amount(calculate_net_invoice(150.00, 0.00, calculate_vat_amount(150.00, 15.00, false), false), 150.00),
    'completed',
    u.id
FROM auth.users u
CROSS JOIN public.branches b
CROSS JOIN public.vehicles v
CROSS JOIN public.finance_transaction_types ftt
WHERE u.email = 'admin@example.com'
  AND b.is_active = true
  AND v.id IS NOT NULL
  AND ftt.code = 'FUEL_EXPENSE'
LIMIT 1;

-- Sample Rental Company Income
INSERT INTO public.finance_transactions (
    transaction_number,
    transaction_type_id,
    amount,
    transaction_date,
    description,
    branch_id,
    vehicle_id,
    contract_id,
    employee_name,
    invoice_number,
    invoice_date,
    payment_type,
    vat_included,
    vat_rate,
    vat_amount,
    total_amount,
    total_discount,
    net_invoice,
    total_paid,
    remaining_amount,
    status,
    user_id
)
SELECT
    generate_transaction_number('RENTAL_INCOME'),
    ftt.id,
    500.00,
    CURRENT_DATE - INTERVAL '2 days',
    'Daily rental income',
    b.id,
    v.id,
    c.id,
    'Fatima Al-Zahra',
    'INV-RENT-001',
    CURRENT_DATE - INTERVAL '2 days',
    'card',
    true,
    15.00,
    calculate_vat_amount(500.00, 15.00, true),
    500.00,
    0.00,
    calculate_net_invoice(500.00, 0.00, calculate_vat_amount(500.00, 15.00, true), true),
    500.00,
    calculate_remaining_amount(calculate_net_invoice(500.00, 0.00, calculate_vat_amount(500.00, 15.00, true), true), 500.00),
    'completed',
    u.id
FROM auth.users u
CROSS JOIN public.branches b
CROSS JOIN public.vehicles v
CROSS JOIN public.contracts c
CROSS JOIN public.finance_transaction_types ftt
WHERE u.email = 'admin@example.com'
  AND b.is_active = true
  AND v.id IS NOT NULL
  AND c.id IS NOT NULL
  AND ftt.code = 'RENTAL_INCOME'
LIMIT 1;

-- Sample Customer Finance Transaction
INSERT INTO public.finance_transactions (
    transaction_number,
    transaction_type_id,
    amount,
    transaction_date,
    description,
    branch_id,
    customer_id,
    contract_id,
    employee_name,
    invoice_number,
    invoice_date,
    payment_type,
    vat_included,
    vat_rate,
    vat_amount,
    total_amount,
    total_discount,
    net_invoice,
    total_paid,
    remaining_amount,
    status,
    user_id
)
SELECT
    generate_transaction_number('CUSTOMER_PAYMENT'),
    ftt.id,
    1000.00,
    CURRENT_DATE - INTERVAL '3 days',
    'Customer payment for contract',
    b.id,
    cust.id,
    c.id,
    'Mohammed Al-Fahad',
    'INV-CUST-001',
    CURRENT_DATE - INTERVAL '3 days',
    'bank_transfer',
    true,
    15.00,
    calculate_vat_amount(1000.00, 15.00, true),
    1000.00,
    0.00,
    calculate_net_invoice(1000.00, 0.00, calculate_vat_amount(1000.00, 15.00, true), true),
    1000.00,
    calculate_remaining_amount(calculate_net_invoice(1000.00, 0.00, calculate_vat_amount(1000.00, 15.00, true), true), 1000.00),
    'completed',
    u.id
FROM auth.users u
CROSS JOIN public.branches b
CROSS JOIN public.customers cust
CROSS JOIN public.contracts c
CROSS JOIN public.finance_transaction_types ftt
WHERE u.email = 'admin@example.com'
  AND b.is_active = true
  AND cust.id IS NOT NULL
  AND c.id IS NOT NULL
  AND ftt.code = 'CUSTOMER_PAYMENT'
LIMIT 1;

-- Sample Vehicle Finance Transaction (Sale)
INSERT INTO public.finance_transactions (
    transaction_number,
    transaction_type_id,
    amount,
    transaction_date,
    description,
    branch_id,
    vehicle_id,
    customer_id,
    employee_name,
    invoice_number,
    invoice_date,
    payment_type,
    vat_included,
    vat_rate,
    vat_amount,
    total_amount,
    total_discount,
    net_invoice,
    total_paid,
    remaining_amount,
    status,
    user_id
)
SELECT
    generate_transaction_number('VEHICLE_SALE'),
    ftt.id,
    50000.00,
    CURRENT_DATE - INTERVAL '4 days',
    'Vehicle sale transaction',
    b.id,
    v.id,
    cust.id,
    'Ahmed Al-Rashid',
    'INV-VEH-001',
    CURRENT_DATE - INTERVAL '4 days',
    'bank_transfer',
    true,
    15.00,
    calculate_vat_amount(50000.00, 15.00, true),
    50000.00,
    0.00,
    calculate_net_invoice(50000.00, 0.00, calculate_vat_amount(50000.00, 15.00, true), true),
    50000.00,
    calculate_remaining_amount(calculate_net_invoice(50000.00, 0.00, calculate_vat_amount(50000.00, 15.00, true), true), 50000.00),
    'completed',
    u.id
FROM auth.users u
CROSS JOIN public.branches b
CROSS JOIN public.vehicles v
CROSS JOIN public.customers cust
CROSS JOIN public.finance_transaction_types ftt
WHERE u.email = 'admin@example.com'
  AND b.is_active = true
  AND v.id IS NOT NULL
  AND cust.id IS NOT NULL
  AND ftt.code = 'VEHICLE_SALE'
LIMIT 1;

-- Insert corresponding rental expenses
INSERT INTO public.rental_expenses (transaction_id, expense_type, vendor_name, receipt_number, receipt_date, user_id)
SELECT
    ft.id,
    'fuel',
    'Saudi Aramco',
    'RCP-FUEL-001',
    CURRENT_DATE - INTERVAL '1 day',
    ft.user_id
FROM public.finance_transactions ft
WHERE ft.transaction_number LIKE 'FUE%'
LIMIT 1;

-- Insert corresponding rental income
INSERT INTO public.rental_income (transaction_id, income_type, source, user_id)
SELECT
    ft.id,
    'rental',
    'contract',
    ft.user_id
FROM public.finance_transactions ft
WHERE ft.transaction_number LIKE 'RIN%'
LIMIT 1;

-- Insert corresponding customer finance transaction
INSERT INTO public.customer_finance_transactions (transaction_id, customer_id, transaction_category, user_id)
SELECT
    ft.id,
    ft.customer_id,
    'payment',
    ft.user_id
FROM public.finance_transactions ft
WHERE ft.transaction_number LIKE 'CPY%'
LIMIT 1;

-- Insert corresponding vehicle finance transaction
INSERT INTO public.vehicle_finance_transactions (transaction_id, vehicle_id, transaction_category, user_id)
SELECT
    ft.id,
    ft.vehicle_id,
    'sell',
    ft.user_id
FROM public.finance_transactions ft
WHERE ft.transaction_number LIKE 'VSL%'
LIMIT 1;

-- Create sample finance summaries
INSERT INTO public.finance_summaries (
    summary_type,
    summary_date,
    entity_id,
    total_revenue,
    total_expenses,
    net_profit,
    total_transactions,
    rental_income,
    penalty_income,
    maintenance_costs,
    fuel_costs,
    insurance_costs,
    user_id
)
SELECT
    'daily',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    1500.00,
    150.00,
    1350.00,
    2,
    500.00,
    0.00,
    0.00,
    150.00,
    0.00,
    u.id
FROM auth.users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

INSERT INTO public.finance_summaries (
    summary_type,
    summary_date,
    entity_id,
    total_revenue,
    total_expenses,
    net_profit,
    total_transactions,
    rental_income,
    penalty_income,
    maintenance_costs,
    fuel_costs,
    insurance_costs,
    user_id
)
SELECT
    'monthly',
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'),
    NULL,
    45000.00,
    5000.00,
    40000.00,
    15,
    30000.00,
    2000.00,
    2000.00,
    1500.00,
    1500.00,
    u.id
FROM auth.users u
WHERE u.email = 'admin@example.com'
LIMIT 1;
