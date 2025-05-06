-- Drop existing tables if they exist
DROP TABLE IF EXISTS container_items CASCADE;
DROP TABLE IF EXISTS container_lists CASCADE;

-- Create container_lists table
CREATE TABLE container_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    container_number TEXT NOT NULL UNIQUE,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create container_items table
CREATE TABLE container_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    container_id UUID NOT NULL,
    job_name TEXT NOT NULL,
    job_number TEXT NOT NULL,
    manufacturer_order_number TEXT NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop existing foreign key constraint if it exists
DO $$ 
BEGIN
    ALTER TABLE container_items DROP CONSTRAINT IF EXISTS container_items_container_id_fkey;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create foreign key constraint
ALTER TABLE container_items
ADD CONSTRAINT container_items_container_id_fkey
FOREIGN KEY (container_id)
REFERENCES container_lists(id)
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE container_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own container lists" ON container_lists;
    DROP POLICY IF EXISTS "Users can insert their own container lists" ON container_lists;
    DROP POLICY IF EXISTS "Users can update their own container lists" ON container_lists;
    DROP POLICY IF EXISTS "Users can delete their own container lists" ON container_lists;
    DROP POLICY IF EXISTS "Users can view their own container items" ON container_items;
    DROP POLICY IF EXISTS "Users can insert their own container items" ON container_items;
    DROP POLICY IF EXISTS "Users can update their own container items" ON container_items;
    DROP POLICY IF EXISTS "Users can delete their own container items" ON container_items;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create RLS policies for container_lists
CREATE POLICY "Users can view their own container lists"
    ON container_lists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own container lists"
    ON container_lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own container lists"
    ON container_lists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own container lists"
    ON container_lists FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for container_items
CREATE POLICY "Users can view their own container items"
    ON container_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own container items"
    ON container_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own container items"
    ON container_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own container items"
    ON container_items FOR DELETE
    USING (auth.uid() = user_id);

-- Drop existing indexes if they exist
DO $$ 
BEGIN
    DROP INDEX IF EXISTS idx_container_lists_user_id;
    DROP INDEX IF EXISTS idx_container_lists_container_number;
    DROP INDEX IF EXISTS idx_container_items_user_id;
    DROP INDEX IF EXISTS idx_container_items_container_id;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create indexes
CREATE INDEX idx_container_lists_user_id ON container_lists(user_id);
CREATE INDEX idx_container_lists_container_number ON container_lists(container_number);
CREATE INDEX idx_container_items_user_id ON container_items(user_id);
CREATE INDEX idx_container_items_container_id ON container_items(container_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_container_lists_updated_at ON container_lists;
    DROP TRIGGER IF EXISTS update_container_items_updated_at ON container_items;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

CREATE TRIGGER update_container_lists_updated_at
    BEFORE UPDATE ON container_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_container_items_updated_at
    BEFORE UPDATE ON container_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
