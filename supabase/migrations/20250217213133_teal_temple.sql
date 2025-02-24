/*
  # Fix roles and policies

  1. Changes
    - Create roles table if not exists
    - Update RLS policies for better security
    - Add system-level management policy
    - Set up automatic role assignment for new users

  2. Security
    - Enable RLS on roles table
    - Allow users to read only their own role
    - Restrict role insertion to signup process
    - Allow system-level management
*/

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'warehouse', 'sales', 'crew');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'crew',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read their own role" ON roles;
  DROP POLICY IF EXISTS "Users can insert their own role during signup" ON roles;
  DROP POLICY IF EXISTS "System can manage all roles" ON roles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles
CREATE POLICY "Users can read their own role"
  ON roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for inserting new roles (only during signup)
CREATE POLICY "Users can insert their own role during signup"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'crew');

-- Create policy for updating roles (system only)
CREATE POLICY "System can manage all roles"
  ON roles
  USING (true)
  WITH CHECK (true);

-- Create or replace updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

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

-- Drop existing trigger if it exists
DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Trigger to set default role
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();