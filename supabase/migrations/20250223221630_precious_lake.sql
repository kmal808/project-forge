-- First disable RLS
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "roles_access" ON roles;

-- Re-enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create simple policies that avoid recursion
CREATE POLICY "roles_read"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);  -- Everyone can read roles

CREATE POLICY "roles_insert"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);  -- Users can only insert their own role

CREATE POLICY "roles_update"
  ON roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );  -- Only admins can update roles

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON roles(user_id);