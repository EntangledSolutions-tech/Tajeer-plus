-- Seed vehicle configuration data
-- This migration adds sample data to the vehicle configuration tables

-- Insert sample vehicle makes
INSERT INTO public.vehicle_makes (name, description) VALUES
('Toyota', 'Japanese automotive manufacturer'),
('Nissan', 'Japanese multinational automobile manufacturer'),
('Honda', 'Japanese multinational conglomerate'),
('Hyundai', 'South Korean multinational automotive manufacturer'),
('Ford', 'American multinational automobile manufacturer'),
('Chevrolet', 'American automobile division of General Motors'),
('BMW', 'German multinational automotive manufacturer'),
('Mercedes-Benz', 'German automotive manufacturer'),
('Audi', 'German automobile manufacturer'),
('Volkswagen', 'German multinational automotive manufacturer')
ON CONFLICT (name) DO NOTHING;

-- Insert sample vehicle colors
INSERT INTO public.vehicle_colors (name, hex_code, description) VALUES
('White', '#FFFFFF', 'Pure white color'),
('Black', '#000000', 'Pure black color'),
('Silver', '#C0C0C0', 'Metallic silver color'),
('Gray', '#808080', 'Medium gray color'),
('Red', '#FF0000', 'Bright red color'),
('Blue', '#0000FF', 'Deep blue color'),
('Green', '#008000', 'Forest green color'),
('Yellow', '#FFFF00', 'Bright yellow color'),
('Orange', '#FFA500', 'Bright orange color'),
('Purple', '#800080', 'Deep purple color')
ON CONFLICT (name) DO NOTHING;

-- Insert sample vehicle statuses
INSERT INTO public.vehicle_statuses (name, description, color) VALUES
('Available', 'Vehicle is available for rental', '#10B981'),
('Rented', 'Vehicle is currently rented out', '#3B82F6'),
('Maintenance', 'Vehicle is under maintenance', '#F59E0B'),
('Out of Service', 'Vehicle is out of service', '#EF4444'),
('Reserved', 'Vehicle is reserved for future rental', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Insert sample vehicle models (after makes are inserted)
INSERT INTO public.vehicle_models (name, make_id, description) VALUES
('Camry', (SELECT id FROM public.vehicle_makes WHERE name = 'Toyota' LIMIT 1), 'Mid-size sedan'),
('Corolla', (SELECT id FROM public.vehicle_makes WHERE name = 'Toyota' LIMIT 1), 'Compact sedan'),
('Civic', (SELECT id FROM public.vehicle_makes WHERE name = 'Honda' LIMIT 1), 'Compact sedan'),
('Accord', (SELECT id FROM public.vehicle_makes WHERE name = 'Honda' LIMIT 1), 'Mid-size sedan'),
('Elantra', (SELECT id FROM public.vehicle_makes WHERE name = 'Hyundai' LIMIT 1), 'Compact sedan'),
('Sonata', (SELECT id FROM public.vehicle_makes WHERE name = 'Hyundai' LIMIT 1), 'Mid-size sedan'),
('Focus', (SELECT id FROM public.vehicle_makes WHERE name = 'Ford' LIMIT 1), 'Compact car'),
('Fusion', (SELECT id FROM public.vehicle_makes WHERE name = 'Ford' LIMIT 1), 'Mid-size sedan'),
('Cruze', (SELECT id FROM public.vehicle_makes WHERE name = 'Chevrolet' LIMIT 1), 'Compact car'),
('Malibu', (SELECT id FROM public.vehicle_makes WHERE name = 'Chevrolet' LIMIT 1), 'Mid-size sedan')
ON CONFLICT (name, make_id) DO NOTHING;

-- Insert sample vehicle owners
INSERT INTO public.vehicle_owners (name, contact_person, phone, email, address) VALUES
('ABC Rental Company', 'Ahmed Al-Rashid', '+966 50 123 4567', 'ahmed@abc-rental.com', 'Riyadh, Saudi Arabia'),
('XYZ Fleet Services', 'Sarah Ahmed', '+966 55 987 6543', 'sarah@xyz-fleet.com', 'Jeddah, Saudi Arabia'),
('Premium Auto Rentals', 'Mohammed Hassan', '+966 54 111 2222', 'mohammed@premium-auto.com', 'Dammam, Saudi Arabia')
ON CONFLICT (code) DO NOTHING;

-- Insert sample vehicle actual users
INSERT INTO public.vehicle_actual_users (name, contact_person, phone, email, address) VALUES
('Business Travel Solutions', 'Fatima Al-Zahra', '+966 56 333 4444', 'fatima@business-travel.com', 'Riyadh, Saudi Arabia'),
('Corporate Fleet Management', 'Omar Al-Sayed', '+966 57 555 6666', 'omar@corporate-fleet.com', 'Jeddah, Saudi Arabia'),
('Executive Car Services', 'Layla Al-Mansouri', '+966 58 777 8888', 'layla@executive-car.com', 'Dammam, Saudi Arabia')
ON CONFLICT (code) DO NOTHING;
