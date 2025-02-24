/*
  # Fix role policies and permissions

  1. Changes
    - Drop and recreate policies with unique names
    - Ensure clean policy removal
    - Add performance optimizations
    - Fix admin access

  2. Security
    - Allow all authenticated users to read roles
    - Restrict role creation to new users only
    - Allow admins full access
*/

-- First drop ALL existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "allow_read" ON roles;
  DROP POLICY IF EXISTS "allow_insert_own_role" ON roles;
  DROP POLICY IF EXISTS "allow_admin_all" ON roles;
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

-- Disable RLS temporarily to ensure clean slate
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Drop all policies again to be extra safe
DROP POLICY IF EXISTS "allow_read" ON roles;
DROP POLICY IF EXISTS "allow_insert_own_role" ON roles;
DROP POLICY IF EXISTS "allow_admin_all" ON roles;

-- Re-enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "roles_read_policy_v1"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_insert_policy_v1"
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

CREATE POLICY "roles_admin_policy_v1"
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

-- Create index for performance if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_roles_user_id'
  ) THEN
    CREATE INDEX idx_roles_user_id ON roles(user_id);
  END IF;
END $$;

-- Ensure we have at least one admin user
INSERT INTO roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'demo@example.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin';