-- First disable RLS
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "roles_select" ON roles;
DROP POLICY IF EXISTS "roles_insert" ON roles;
DROP POLICY IF EXISTS "roles_update" ON roles;
DROP POLICY IF EXISTS "roles_delete" ON roles;

-- Re-enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all operations
CREATE POLICY "roles_access"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() = user_id THEN true  -- Users can access their own role
      WHEN EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role = 'admin'::user_role
        AND r.id != roles.id  -- Prevent recursion
      ) THEN true  -- Admins can access all roles
      ELSE false
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.uid() = user_id THEN true  -- Users can modify their own role
      WHEN EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role = 'admin'::user_role
        AND r.id != roles.id  -- Prevent recursion
      ) THEN true  -- Admins can modify all roles
      ELSE false
    END
  );

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON roles(user_id);

-- Ensure we have at least one admin user
INSERT INTO roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'demo@example.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin';