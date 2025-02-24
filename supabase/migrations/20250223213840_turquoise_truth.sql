/*
  # Create quotes and quote items tables

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `status` (enum: draft, sent, accepted, rejected)
      - `total_amount` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, references auth.users)
    
    - `quote_items`
      - `id` (uuid, primary key)
      - `quote_id` (uuid, references quotes)
      - `product_type` (item_type)
      - `series` (text)
      - `width` (integer)
      - `height` (integer)
      - `operation` (text)
      - `frame_color` (text)
      - `glass_type` (text)
      - `hardware` (text)
      - `screen_type` (text)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own quotes and items
*/

-- Create quote status enum
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  total_amount decimal NOT NULL DEFAULT 0,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create quote items table
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_type item_type NOT NULL,
  series text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  operation text NOT NULL,
  frame_color text NOT NULL,
  glass_type text NOT NULL,
  hardware text NOT NULL,
  screen_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
CREATE POLICY "Users can manage their own quotes"
  ON quotes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for quote items
CREATE POLICY "Users can manage quote items if they own the quote"
  ON quote_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE id = quote_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE id = quote_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- Create updated_at triggers
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_items_updated_at
  BEFORE UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();