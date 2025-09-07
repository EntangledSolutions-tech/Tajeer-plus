-- Fix permissions for is_admin function
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Also grant to anon users in case they need it for registration
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
