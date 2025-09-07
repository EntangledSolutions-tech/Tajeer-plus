-- Create a function to get user profile data for the navbar
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE(
    id UUID,
    name TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        CONCAT(p.first_name, ' ', p.last_name)::TEXT as name,
        p.avatar_url
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
