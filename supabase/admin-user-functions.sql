-- =====================================================
-- ADMIN USER MANAGEMENT FUNCTIONS (FIXED)
-- These allow admins to view and manage users from the client
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_all_users();
DROP FUNCTION IF EXISTS update_user_role(UUID, TEXT);
DROP FUNCTION IF EXISTS delete_user_account(UUID);

-- Function: Get all users (for admins only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if caller is admin
  IF COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text, '') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can view users';
  END IF;

  -- Build JSON array of users
  SELECT COALESCE(json_agg(user_data), '[]'::json)
  INTO result
  FROM (
    SELECT json_build_object(
      'id', u.id::text,
      'email', u.email,
      'created_at', u.created_at,
      'confirmed_at', u.confirmed_at,
      'last_sign_in_at', u.last_sign_in_at,
      'role', u.raw_user_meta_data->>'role',
      'name', u.raw_user_meta_data->>'name'
    ) as user_data
    FROM auth.users u
    ORDER BY u.created_at DESC
  ) subquery;

  RETURN result;
END;
$$;

-- Function: Update user role (for admins only)
CREATE OR REPLACE FUNCTION update_user_role(
  user_id UUID,
  new_role TEXT
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin
  IF COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text, '') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;

  -- Validate new role
  IF new_role NOT IN ('admin', 'instructor', 'pending') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, instructor, or pending';
  END IF;

  -- Update user metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Function: Delete user (for admins only)
CREATE OR REPLACE FUNCTION delete_user_account(
  user_id UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin
  IF COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text, '') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Don't allow deleting yourself
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Delete user
  DELETE FROM auth.users WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Allow authenticated users to call these functions
-- (the functions themselves check if the user is admin)
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- =====================================================
-- VERIFICATION & TEST
-- =====================================================

SELECT '✅ Admin user management functions created!' as status;

-- Test if functions exist
SELECT 
  'Functions created:' as info,
  proname as function_name,
  pg_get_function_result(oid) as returns
FROM pg_proc
WHERE proname IN ('get_all_users', 'update_user_role', 'delete_user_account')
  AND pronamespace = 'public'::regnamespace;

-- Test get_all_users (will only work if you're admin)
-- Uncomment to test:
-- SELECT get_all_users();
