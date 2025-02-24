/*
  # Fix Inventory Schema

  1. Changes
    - Drop existing container-based tables
    - Create new inventory table with proper schema
    - Add RLS policies and indexes
    - Add triggers for updated_at

  2. Security
    - Enable RLS
    - Add policy for authenticated users
    - Create indexes for performance
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS container_items CASCADE;
DROP TABLE IF EXISTS container_lists CASCADE;

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own inventory" ON inventory;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  job_number text NOT NULL,
  manufacturer_order_number text NOT NULL,
  item_type item_type NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  date_added timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create new policy with unique name
CREATE POLICY "inventory_user_access_policy"
  ON inventory
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON inventory(item_type);

-- Create updated_at trigger
DO $$ 
BEGIN
  CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;