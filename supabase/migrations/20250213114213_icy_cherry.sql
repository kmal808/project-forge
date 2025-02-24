/*
  # Add role-based authentication

  1. New Types
    - `user_role` enum for different user roles

  2. New Tables
    - `roles` table to store user roles
    - Links to auth.users table

  3. Security
    - Enable RLS
    - Add policies for role management
*/

-- Create role enum
CREATE TYPE user_role AS ENUM ('admin', 'warehouse', 'sales', 'crew');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'crew',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles
CREATE POLICY "Users can read their own role"
  ON roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
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

-- Create updated_at trigger
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to set default role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.roles (user_id, role)
  VALUES (new.id, 'crew');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set default role
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();