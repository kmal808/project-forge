/*
  # Add Files and Walkthroughs Tables

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `type` (text)
      - `size` (bigint)
      - `job_id` (text)
      - `user_id` (uuid, foreign key)
      - Timestamps

    - `walkthroughs`
      - `id` (uuid, primary key)
      - `job_id` (text)
      - `completion_date` (date)
      - `client_name` (text)
      - `client_signature` (text, optional)
      - `installation_issues` (jsonb)
      - `manufacturing_issues` (jsonb)
      - `payment_status` (enum)
      - `payment_amount` (decimal)
      - `follow_up_needed` (boolean)
      - `follow_up_notes` (text, optional)
      - `user_id` (uuid, foreign key)
      - Timestamps

    - `walkthrough_photos` (junction table)
      - `walkthrough_id` (uuid, foreign key)
      - `file_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'complete');

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  job_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create walkthroughs table
CREATE TABLE IF NOT EXISTS walkthroughs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL,
  completion_date date NOT NULL,
  client_name text NOT NULL,
  client_signature text,
  installation_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  manufacturing_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_amount decimal NOT NULL DEFAULT 0,
  follow_up_needed boolean NOT NULL DEFAULT false,
  follow_up_notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create junction table for walkthrough photos
CREATE TABLE IF NOT EXISTS walkthrough_photos (
  walkthrough_id uuid NOT NULL REFERENCES walkthroughs(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (walkthrough_id, file_id)
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkthroughs ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for files
CREATE POLICY "Users can manage their own files"
  ON files
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for walkthroughs
CREATE POLICY "Users can manage their own walkthroughs"
  ON walkthroughs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for walkthrough photos
CREATE POLICY "Users can manage walkthrough photos if they own the walkthrough"
  ON walkthrough_photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM walkthroughs
      WHERE id = walkthrough_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM walkthroughs
      WHERE id = walkthrough_id
      AND user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_walkthroughs_updated_at
  BEFORE UPDATE ON walkthroughs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();