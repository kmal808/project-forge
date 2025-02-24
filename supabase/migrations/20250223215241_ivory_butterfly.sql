-- Drop existing inventory tables
DROP TABLE IF EXISTS container_items CASCADE;
DROP TABLE IF EXISTS container_lists CASCADE;

-- Create inventory table
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

-- Create policies for inventory
CREATE POLICY "Users can manage their own inventory"
  ON inventory
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_item_type ON inventory(item_type);

-- Create updated_at trigger
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();