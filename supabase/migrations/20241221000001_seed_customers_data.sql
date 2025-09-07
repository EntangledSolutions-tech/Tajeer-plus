-- Insert sample customers
INSERT INTO customers (
    name, id_type, id_number, classification, license_type, date_of_birth,
    address, mobile_number, nationality, status, membership_id, membership_tier,
    membership_points, membership_valid_until, membership_benefits
) VALUES
(
    'Liam Johnson', 'National ID', '4823917460', 'Individual', 'Light Vehicle',
    '1990-05-15', 'Riyadh, Saudi Arabia', '+966 50 123 4567', 'Saudi', 'Active',
    '934827850522', 'Gold', 12897, '2027-10-12',
    'Lorem ipsum dolor sit amet consectetur. Risus scelerisque eget ullamcorper amet viverra nunc massa quam.'
),
(
    'Sarah Ahmed', 'Iqama', '9876543210', 'Individual', 'Light Vehicle',
    '1985-08-22', 'Jeddah, Saudi Arabia', '+966 55 987 6543', 'Saudi', 'Active',
    '123456789012', 'Silver', 8500, '2027-06-15',
    'Premium benefits including priority booking and special discounts.'
),
(
    'Mohammed Al-Rashid', 'National ID', '1122334455', 'Individual', 'Heavy Vehicle',
    '1978-12-03', 'Dammam, Saudi Arabia', '+966 54 111 2222', 'Saudi', 'Active',
    '987654321098', 'Bronze', 3200, '2027-03-20',
    'Standard membership benefits with basic rental privileges.'
),
(
    'ABC Company Ltd', 'Commercial ID', 'COM123456', 'Company', 'Light Vehicle',
    NULL, 'Business District, Riyadh', '+966 11 234 5678', 'Saudi', 'Active',
    'CORP987654', 'Platinum', 25000, '2028-01-01',
    'Corporate benefits including fleet management and bulk discounts.'
),
(
    'Fatima Hassan', 'Passport', 'PAS789012', 'Individual', 'Motorcycle',
    '1992-03-10', 'Mecca, Saudi Arabia', '+966 56 333 4444', 'Saudi', 'Blacklisted',
    '456789123456', 'Bronze', 1500, '2026-11-30',
    'Limited benefits due to account status.'
);

-- Insert sample customer contracts
INSERT INTO customer_contracts (
    customer_id, contract_number, start_date, end_date, daily_rate, total_amount,
    deposit_amount, status, contract_type, notes
) VALUES
(
    (SELECT id FROM customers WHERE name = 'Liam Johnson' LIMIT 1),
    'CON-2024-001', '2024-01-15', '2024-01-20', 150.00, 750.00, 200.00, 'Active', 'Rental',
    'Weekend rental for business trip'
),
(
    (SELECT id FROM customers WHERE name = 'Sarah Ahmed' LIMIT 1),
    'CON-2024-002', '2024-02-01', '2024-02-05', 120.00, 480.00, 150.00, 'Completed', 'Rental',
    'Family vacation rental'
),
(
    (SELECT id FROM customers WHERE name = 'Mohammed Al-Rashid' LIMIT 1),
    'CON-2024-003', '2024-01-10', '2024-01-25', 200.00, 3000.00, 500.00, 'Active', 'Long-term',
    'Extended business contract'
);

-- Insert sample customer invoices
INSERT INTO customer_invoices (
    customer_id, contract_id, invoice_number, invoice_date, due_date, subtotal,
    tax_amount, discount_amount, total_amount, status, payment_method
) VALUES
(
    (SELECT id FROM customers WHERE name = 'Liam Johnson' LIMIT 1),
    (SELECT id FROM customer_contracts WHERE contract_number = 'CON-2024-001' LIMIT 1),
    'INV-2024-001', '2024-01-15', '2024-01-20', 750.00, 75.00, 0.00, 825.00, 'Paid', 'Credit Card'
),
(
    (SELECT id FROM customers WHERE name = 'Sarah Ahmed' LIMIT 1),
    (SELECT id FROM customer_contracts WHERE contract_number = 'CON-2024-002' LIMIT 1),
    'INV-2024-002', '2024-02-01', '2024-02-05', 480.00, 48.00, 20.00, 508.00, 'Paid', 'Cash'
),
(
    (SELECT id FROM customers WHERE name = 'Mohammed Al-Rashid' LIMIT 1),
    (SELECT id FROM customer_contracts WHERE contract_number = 'CON-2024-003' LIMIT 1),
    'INV-2024-003', '2024-01-10', '2024-01-25', 3000.00, 300.00, 0.00, 3300.00, 'Pending', NULL
);

-- Insert sample customer finance transactions
INSERT INTO customer_finance (
    customer_id, transaction_type, amount, description, transaction_date, payment_method, reference_number, status
) VALUES
(
    (SELECT id FROM customers WHERE name = 'Liam Johnson' LIMIT 1),
    'Payment', 825.00, 'Rental payment for CON-2024-001', '2024-01-15', 'Credit Card', 'TXN-001', 'Completed'
),
(
    (SELECT id FROM customers WHERE name = 'Sarah Ahmed' LIMIT 1),
    'Payment', 508.00, 'Rental payment for CON-2024-002', '2024-02-01', 'Cash', 'TXN-002', 'Completed'
),
(
    (SELECT id FROM customers WHERE name = 'Mohammed Al-Rashid' LIMIT 1),
    'Deposit', 500.00, 'Security deposit for CON-2024-003', '2024-01-10', 'Bank Transfer', 'TXN-003', 'Completed'
);

-- Insert sample customer penalties
INSERT INTO customer_penalties (
    customer_id, contract_id, penalty_type, amount, description, penalty_date, due_date, status
) VALUES
(
    (SELECT id FROM customers WHERE name = 'Fatima Hassan' LIMIT 1),
    NULL, 'Late Return', 100.00, 'Vehicle returned 2 hours late', '2024-01-15', '2024-01-20', 'Pending'
),
(
    (SELECT id FROM customers WHERE name = 'Liam Johnson' LIMIT 1),
    (SELECT id FROM customer_contracts WHERE contract_number = 'CON-2024-001' LIMIT 1),
    'Damage Fee', 250.00, 'Minor scratch on passenger door', '2024-01-20', '2024-01-25', 'Paid'
);

-- Insert sample customer branches
INSERT INTO customer_branches (
    customer_id, branch_name, branch_code, address, contact_person, phone, email, is_primary, status
) VALUES
(
    (SELECT id FROM customers WHERE name = 'ABC Company Ltd' LIMIT 1),
    'Main Office', 'BR-001', 'Business District, Riyadh', 'Ahmed Al-Mansouri', '+966 11 234 5678', 'main@abc.com', TRUE, 'Active'
),
(
    (SELECT id FROM customers WHERE name = 'ABC Company Ltd' LIMIT 1),
    'Jeddah Branch', 'BR-002', 'Corniche Road, Jeddah', 'Sara Al-Zahra', '+966 12 345 6789', 'jeddah@abc.com', FALSE, 'Active'
),
(
    (SELECT id FROM customers WHERE name = 'Mohammed Al-Rashid' LIMIT 1),
    'Personal Address', 'BR-003', 'Dammam, Saudi Arabia', 'Mohammed Al-Rashid', '+966 54 111 2222', 'mohammed@email.com', TRUE, 'Active'
);