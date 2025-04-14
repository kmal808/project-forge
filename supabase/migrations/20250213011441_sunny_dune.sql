/*
  # Initial Schema Setup

  1. Tables
    - users (managed by Supabase Auth)
    - inventory
      - id (uuid, primary key)
      - job_name (text)
      - job_number (text)
      - manufacturer_order_number (text)
      - item_type (text)
      - quantity (integer)
      - notes (text)
      - date_added (timestamptz)
      - user_id (uuid, foreign key)
    - crews
      - id (uuid, primary key)
      - name (text)
      - user_id (uuid, foreign key)
    - employees
      - id (uuid, primary key)
      - name (text)
      - crew_id (uuid, foreign key)
      - user_id (uuid, foreign key)
    - payroll_entries
      - id (uuid, primary key)
      - employee_id (uuid, foreign key)
      - job_name (text)
      - job_number (text)
      - sunday_amount (decimal)
      - monday_amount (decimal)
      - tuesday_amount (decimal)
      - wednesday_amount (decimal)
      - thursday_amount (decimal)
      - friday_amount (decimal)
      - saturday_amount (decimal)
      - date (date)
      - user_id (uuid, foreign key)
    - materials
      - id (uuid, primary key)
      - name (text)
      - quantity (integer)
      - unit (text)
      - status (text)
      - order_date (timestamptz)
      - received_date (timestamptz)
      - notes (text)
      - user_id (uuid, foreign key)
    - punch_list
      - id (uuid, primary key)
      - description (text)
      - status (text)
      - priority (text)
      - assigned_to (uuid, references employees)
      - due_date (timestamptz)
      - completed_date (timestamptz)
      - notes (text)
      - user_id (uuid, foreign key)
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create custom types
CREATE TYPE item_type AS ENUM ('windows', 'siding', 'security-doors', 'entry-doors', 'other');
CREATE TYPE material_status AS ENUM ('needed', 'ordered', 'received');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Inventory table
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

-- Crews table
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  crew_id uuid REFERENCES crews(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payroll entries table
CREATE TABLE IF NOT EXISTS payroll_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  job_name text NOT NULL,
  job_number text NOT NULL,
  sunday_amount decimal NOT NULL DEFAULT 0,
  monday_amount decimal NOT NULL DEFAULT 0,
  tuesday_amount decimal NOT NULL DEFAULT 0,
  wednesday_amount decimal NOT NULL DEFAULT 0,
  thursday_amount decimal NOT NULL DEFAULT 0,
  friday_amount decimal NOT NULL DEFAULT 0,
  saturday_amount decimal NOT NULL DEFAULT 0,
  date date NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL,
  status material_status NOT NULL DEFAULT 'needed',
  order_date timestamptz,
  received_date timestamptz,
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Punch list table
CREATE TABLE IF NOT EXISTS punch_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES employees(id) ON DELETE SET NULL,
  due_date timestamptz,
  completed_date timestamptz,
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_list ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory
CREATE POLICY "Users can manage their own inventory"
  ON inventory
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for crews
CREATE POLICY "Users can manage their own crews"
  ON crews
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for employees
CREATE POLICY "Users can manage their own employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for payroll entries
CREATE POLICY "Users can manage their own payroll entries"
  ON payroll_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for materials
CREATE POLICY "Users can manage their own materials"
  ON materials
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for punch list
CREATE POLICY "Users can manage their own punch list items"
  ON punch_list
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crews_updated_at
  BEFORE UPDATE ON crews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at
  BEFORE UPDATE ON payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_punch_list_updated_at
  BEFORE UPDATE ON punch_list
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
