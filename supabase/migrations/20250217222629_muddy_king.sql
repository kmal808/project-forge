-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own role" ON roles;
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON roles;
DROP POLICY IF EXISTS "System can manage all roles" ON roles;

-- Create new, simplified policies
CREATE POLICY "Anyone can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert own role with crew access"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND role = 'crew'
  );

CREATE POLICY "Admin users can update roles"
  ON roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (true);