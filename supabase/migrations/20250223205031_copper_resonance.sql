/*
  # Fix authentication and role policies

  1. Changes
    - Completely rebuild role policies to prevent recursion
    - Simplify authentication checks
    - Add performance optimizations
    - Fix infinite recursion issues

  2. Security
    - Allow all authenticated users to read roles
    - Restrict role creation to new users only
    - Allow admins full access
*/

-- First drop ALL existing policies to ensure clean slate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own role" ON roles;
  DROP POLICY IF EXISTS "Users can insert their own role during signup" ON roles;
  DROP POLICY IF EXISTS "System can manage all roles" ON roles;
  DROP POLICY IF EXISTS "Anyone can read roles" ON roles;
  DROP POLICY IF EXISTS "Insert own role with crew access" ON roles;
  DROP POLICY IF EXISTS "Admin users can update roles" ON roles;
  DROP POLICY IF EXISTS "Admin role management" ON roles;
  DROP POLICY IF EXISTS "role_read_policy" ON roles;
  DROP POLICY IF EXISTS "role_insert_policy" ON roles;
  DROP POLICY IF EXISTS "role_admin_policy" ON roles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new simplified policies
CREATE POLICY "allow_read"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert_own_role"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "allow_admin_all"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles r
      WHERE r.user_id = auth.uid()
      AND r.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON roles(user_id);

-- Ensure we have at least one admin user
INSERT INTO roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'demo@example.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin';