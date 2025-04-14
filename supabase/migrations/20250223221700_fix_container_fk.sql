-- Create container_lists table
CREATE TABLE IF NOT EXISTS container_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create container_items table
CREATE TABLE IF NOT EXISTS container_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    container_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create foreign key constraint
ALTER TABLE container_items
ADD CONSTRAINT container_items_container_id_fkey
FOREIGN KEY (container_id)
REFERENCES container_lists(id)
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE container_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_items ENABLE ROW LEVEL SECURITY;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_container_lists_user_id ON container_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_container_items_user_id ON container_items(user_id);
CREATE INDEX IF NOT EXISTS idx_container_items_container_id ON container_items(container_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_container_lists_updated_at
    BEFORE UPDATE ON container_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_container_items_updated_at
    BEFORE UPDATE ON container_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
