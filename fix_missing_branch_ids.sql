-- Check for customers without branch_id
SELECT
  id,
  name,
  user_id,
  branch_id,
  created_at
FROM public.customers
WHERE branch_id IS NULL
ORDER BY created_at DESC;

-- Check for contracts without branch_id
SELECT
  id,
  contract_number,
  customer_name,
  user_id,
  branch_id,
  created_at
FROM public.contracts
WHERE branch_id IS NULL
ORDER BY created_at DESC;

-- Check for vehicles without branch_id
SELECT
  id,
  plate_number,
  user_id,
  branch_id,
  created_at
FROM public.vehicles
WHERE branch_id IS NULL
ORDER BY created_at DESC;

-- Fix: Update customers to use user's first active branch
UPDATE public.customers c
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  WHERE b.user_id = c.user_id
    AND b.is_active = true
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE c.branch_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.user_id = c.user_id AND b.is_active = true
  );

-- Fix: Update contracts to use user's first active branch
UPDATE public.contracts ct
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  WHERE b.user_id = ct.user_id
    AND b.is_active = true
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE ct.branch_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.user_id = ct.user_id AND b.is_active = true
  );

-- Fix: Update vehicles to use user's first active branch
UPDATE public.vehicles v
SET branch_id = (
  SELECT b.id
  FROM public.branches b
  WHERE b.user_id = v.user_id
    AND b.is_active = true
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE v.branch_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.user_id = v.user_id AND b.is_active = true
  );

-- Verify the updates
SELECT 'Customers with NULL branch_id' as check_type, COUNT(*) as count FROM public.customers WHERE branch_id IS NULL
UNION ALL
SELECT 'Contracts with NULL branch_id', COUNT(*) FROM public.contracts WHERE branch_id IS NULL
UNION ALL
SELECT 'Vehicles with NULL branch_id', COUNT(*) FROM public.vehicles WHERE branch_id IS NULL;

