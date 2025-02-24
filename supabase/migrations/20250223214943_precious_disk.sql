-- First drop existing container items table and its dependencies
DROP TABLE IF EXISTS container_items CASCADE;

-- Recreate container items table with correct schema
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
ALTER TABLE container_items ENABLE ROW LEVEL SECURITY;

-- Create policies for container items
CREATE POLICY "Users can manage their own container items"
  ON container_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_container_items_container_id ON container_items(container_id);
CREATE INDEX idx_container_items_user_id ON container_items(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_container_items_updated_at
  BEFORE UPDATE ON container_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();