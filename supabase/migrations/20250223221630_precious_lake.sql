-- First disable RLS
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE container_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE container_lists DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "roles_access" ON roles;

-- Drop existing foreign key constraint if it exists
ALTER TABLE container_items DROP CONSTRAINT IF EXISTS container_items_container_id_fkey;

-- Recreate the foreign key constraint with proper ON DELETE behavior
ALTER TABLE container_items
ADD CONSTRAINT container_items_container_id_fkey
FOREIGN KEY (container_id)
REFERENCES container_lists(id)
ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_lists ENABLE ROW LEVEL SECURITY;

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

-- Verify the foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'container_items_container_id_fkey'
        AND table_name = 'container_items'
    ) THEN
        RAISE EXCEPTION 'Foreign key constraint not created successfully';
    END IF;
END $$;
