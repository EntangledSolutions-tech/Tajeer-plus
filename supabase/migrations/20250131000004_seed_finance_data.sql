-- Seed data for Finance Transaction Types
-- This migration populates the finance_transaction_types table with standard transaction types

-- Income transaction types
INSERT INTO public.finance_transaction_types (name, code, category, description) VALUES
-- Rental Company Income
('Rental Income', 'RENTAL_INCOME', 'income', 'Income from vehicle rentals'),
('Late Fee', 'LATE_FEE', 'income', 'Late return fees'),
('Penalty Fee', 'PENALTY_FEE', 'income', 'Penalty fees for violations'),
('Service Fee', 'SERVICE_FEE', 'income', 'Additional service fees'),
('Insurance Claim', 'INSURANCE_CLAIM', 'income', 'Insurance claim payments'),

-- Customer Finance Income
('Customer Payment', 'CUSTOMER_PAYMENT', 'income', 'Payment received from customer'),
('Contract Closure', 'CONTRACT_CLOSURE', 'income', 'Final payment on contract closure'),
('Penalty Payment', 'PENALTY_PAYMENT', 'income', 'Penalty payment from customer'),
('Refund Adjustment', 'REFUND_ADJUSTMENT', 'income', 'Refund adjustment payment'),

-- Vehicle Finance Income
('Vehicle Sale', 'VEHICLE_SALE', 'income', 'Income from selling a vehicle'),
('Vehicle Return', 'VEHICLE_RETURN', 'income', 'Income from vehicle return'),
('Deprecation Recovery', 'DEPRECATION_RECOVERY', 'income', 'Recovery from vehicle deprecation'),

-- Expense transaction types
('Fuel Expense', 'FUEL_EXPENSE', 'expense', 'Fuel costs for vehicles'),
('Maintenance Expense', 'MAINTENANCE_EXPENSE', 'expense', 'Vehicle maintenance costs'),
('Insurance Expense', 'INSURANCE_EXPENSE', 'expense', 'Insurance premium payments'),
('Office Expense', 'OFFICE_EXPENSE', 'expense', 'Office operational expenses'),
('Marketing Expense', 'MARKETING_EXPENSE', 'expense', 'Marketing and advertising costs'),
('Employee Expense', 'EMPLOYEE_EXPENSE', 'expense', 'Employee-related expenses'),
('Utility Expense', 'UTILITY_EXPENSE', 'expense', 'Utility bills and services'),
('Rent Expense', 'RENT_EXPENSE', 'expense', 'Office and facility rent'),
('Equipment Expense', 'EQUIPMENT_EXPENSE', 'expense', 'Equipment purchase and maintenance'),

-- Vehicle Finance Expenses
('Vehicle Purchase', 'VEHICLE_PURCHASE', 'expense', 'Purchase of new vehicles'),
('Vehicle Deprecation', 'VEHICLE_DEPRECATION', 'expense', 'Vehicle deprecation costs'),
('Vehicle Penalty', 'VEHICLE_PENALTY', 'expense', 'Penalties related to vehicles'),
('Vehicle Service', 'VEHICLE_SERVICE', 'expense', 'Vehicle service costs'),
('Vehicle Accident', 'VEHICLE_ACCIDENT', 'expense', 'Accident-related expenses'),

-- Asset transaction types
('Asset Purchase', 'ASSET_PURCHASE', 'asset_transaction', 'Purchase of business assets'),
('Asset Sale', 'ASSET_SALE', 'asset_transaction', 'Sale of business assets'),
('Asset Deprecation', 'ASSET_DEPRECATION', 'asset_transaction', 'Asset deprecation'),
('Asset Transfer', 'ASSET_TRANSFER', 'asset_transaction', 'Transfer of assets between branches')

ON CONFLICT (code) DO NOTHING;

-- Create a function to generate transaction numbers
CREATE OR REPLACE FUNCTION generate_transaction_number(transaction_type_code VARCHAR(50))
RETURNS VARCHAR(100) AS $$
DECLARE
    prefix VARCHAR(10);
    sequence_number INTEGER;
    transaction_number VARCHAR(100);
BEGIN
    -- Set prefix based on transaction type
    CASE transaction_type_code
        WHEN 'RENTAL_INCOME' THEN prefix := 'RIN';
        WHEN 'LATE_FEE' THEN prefix := 'LAT';
        WHEN 'PENALTY_FEE' THEN prefix := 'PEN';
        WHEN 'SERVICE_FEE' THEN prefix := 'SRV';
        WHEN 'INSURANCE_CLAIM' THEN prefix := 'INS';
        WHEN 'CUSTOMER_PAYMENT' THEN prefix := 'CPY';
        WHEN 'CONTRACT_CLOSURE' THEN prefix := 'CCL';
        WHEN 'PENALTY_PAYMENT' THEN prefix := 'PPY';
        WHEN 'REFUND_ADJUSTMENT' THEN prefix := 'REF';
        WHEN 'VEHICLE_SALE' THEN prefix := 'VSL';
        WHEN 'VEHICLE_RETURN' THEN prefix := 'VRT';
        WHEN 'DEPRECATION_RECOVERY' THEN prefix := 'DRC';
        WHEN 'FUEL_EXPENSE' THEN prefix := 'FUE';
        WHEN 'MAINTENANCE_EXPENSE' THEN prefix := 'MNT';
        WHEN 'INSURANCE_EXPENSE' THEN prefix := 'INE';
        WHEN 'OFFICE_EXPENSE' THEN prefix := 'OFF';
        WHEN 'MARKETING_EXPENSE' THEN prefix := 'MKT';
        WHEN 'EMPLOYEE_EXPENSE' THEN prefix := 'EMP';
        WHEN 'UTILITY_EXPENSE' THEN prefix := 'UTL';
        WHEN 'RENT_EXPENSE' THEN prefix := 'REN';
        WHEN 'EQUIPMENT_EXPENSE' THEN prefix := 'EQP';
        WHEN 'VEHICLE_PURCHASE' THEN prefix := 'VPR';
        WHEN 'VEHICLE_DEPRECATION' THEN prefix := 'VDP';
        WHEN 'VEHICLE_PENALTY' THEN prefix := 'VPN';
        WHEN 'VEHICLE_SERVICE' THEN prefix := 'VSC';
        WHEN 'VEHICLE_ACCIDENT' THEN prefix := 'VAC';
        WHEN 'ASSET_PURCHASE' THEN prefix := 'APR';
        WHEN 'ASSET_SALE' THEN prefix := 'ASL';
        WHEN 'ASSET_DEPRECATION' THEN prefix := 'ADP';
        WHEN 'ASSET_TRANSFER' THEN prefix := 'ATR';
        ELSE prefix := 'TXN';
    END CASE;
    
    -- Get next sequence number for this prefix
    SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM LENGTH(prefix) + 1) AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM public.finance_transactions
    WHERE transaction_number LIKE prefix || '%';
    
    -- Format transaction number
    transaction_number := prefix || LPAD(sequence_number::TEXT, 6, '0');
    
    RETURN transaction_number;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate VAT amounts
CREATE OR REPLACE FUNCTION calculate_vat_amount(
    total_amount DECIMAL(15,2),
    vat_rate DECIMAL(5,2) DEFAULT 15.00,
    vat_included BOOLEAN DEFAULT false
)
RETURNS DECIMAL(15,2) AS $$
BEGIN
    IF vat_included THEN
        -- VAT is included in total amount
        RETURN ROUND(total_amount * (vat_rate / (100 + vat_rate)), 2);
    ELSE
        -- VAT is added to total amount
        RETURN ROUND(total_amount * (vat_rate / 100), 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate net invoice amount
CREATE OR REPLACE FUNCTION calculate_net_invoice(
    total_amount DECIMAL(15,2),
    total_discount DECIMAL(15,2) DEFAULT 0.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    vat_included BOOLEAN DEFAULT false
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    net_amount DECIMAL(15,2);
BEGIN
    net_amount := total_amount - total_discount;
    
    IF vat_included THEN
        -- VAT is included, so net invoice is the amount after discount
        RETURN net_amount;
    ELSE
        -- VAT is added, so net invoice includes VAT
        RETURN net_amount + vat_amount;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate remaining amount
CREATE OR REPLACE FUNCTION calculate_remaining_amount(
    net_invoice DECIMAL(15,2),
    total_paid DECIMAL(15,2) DEFAULT 0.00
)
RETURNS DECIMAL(15,2) AS $$
BEGIN
    RETURN GREATEST(net_invoice - total_paid, 0.00);
END;
$$ LANGUAGE plpgsql;


