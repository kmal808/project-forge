/*
  # Restore Container-based Inventory System

  1. New Tables
    - `container_lists`
      - `id` (uuid, primary key)
      - `container_number` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
    
    - `container_items`
      - `id` (uuid, primary key)
      - `container_id` (uuid, references container_lists)
      - `job_name` (text)
      - `job_number` (text)
      - `manufacturer_order_number` (text)
      - `item_type` (item_type enum)
      - `quantity` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Create indexes for performance
*/

-- Drop existing inventory table and its dependencies
DROP TABLE IF EXISTS inventory CASCADE;

-- Create container lists table
CREATE TABLE container_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create container items table
CREATE TABLE container_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id uuid NOT NULL REFERENCES container_lists(id) ON DELETE CASCADE,
  job_name text NOT NULL,
  job_number text NOT NULL,
  manufacturer_order_number text NOT NULL,
  item_type item_type NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE container_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_items ENABLE ROW LEVEL SECURITY;

-- Create policies for container lists
CREATE POLICY "container_lists_policy"
  ON container_lists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for container items
CREATE POLICY "container_items_policy"
  ON container_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_container_lists_user_id ON container_lists(user_id);
CREATE INDEX idx_container_lists_container_number ON container_lists(container_number);
CREATE INDEX idx_container_items_container_id ON container_items(container_id);
CREATE INDEX idx_container_items_user_id ON container_items(user_id);
CREATE INDEX idx_container_items_item_type ON container_items(item_type);

-- Create updated_at triggers
CREATE TRIGGER update_container_lists_updated_at
  BEFORE UPDATE ON container_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_container_items_updated_at
  BEFORE UPDATE ON container_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();