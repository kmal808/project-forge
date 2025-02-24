/*
  # Update role policies and ensure admin user

  1. Changes
    - Drop all existing policies
    - Create new role management policies
    - Add performance optimization
    - Set up initial admin user

  2. Security
    - Allow authenticated users to read roles
    - Restrict role management to admins
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
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new role management policy
CREATE POLICY "role_read_policy"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "role_insert_policy"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND role = 'crew'
    AND NOT EXISTS (
      SELECT 1 FROM roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "role_admin_policy"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON roles(user_id);

-- Ensure we have at least one admin user
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM roles 
    WHERE role = 'admin'
  ) THEN
    -- Get the first user
    INSERT INTO roles (user_id, role)
    SELECT id, 'admin'
    FROM auth.users
    ORDER BY created_at
    LIMIT 1
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin';
  END IF;
END $$;