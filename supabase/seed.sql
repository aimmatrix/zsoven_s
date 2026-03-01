-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  basic_pay INTEGER NOT NULL,
  working_days INTEGER NOT NULL DEFAULT 26,
  ot_divisor INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create salary_records table
CREATE TABLE IF NOT EXISTS salary_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  working_days INTEGER NOT NULL,
  -- Earnings inputs
  odt_days NUMERIC(5,1) DEFAULT 0,
  ot_hours NUMERIC(5,1) DEFAULT 0,
  leave_pay_enabled BOOLEAN DEFAULT FALSE,
  leave_pay_amount NUMERIC(10,2) DEFAULT 5000,
  bonus_enabled BOOLEAN DEFAULT FALSE,
  bonus_amount NUMERIC(10,2) DEFAULT 0,
  -- Deduction inputs
  absent_days NUMERIC(5,1) DEFAULT 0,
  loan_amount NUMERIC(10,2) DEFAULT 0,
  loan_paid BOOLEAN DEFAULT FALSE,
  penalty_description TEXT DEFAULT '',
  penalty_amount NUMERIC(10,2) DEFAULT 0,
  sales_cred_item TEXT DEFAULT '',
  sales_cred_amount NUMERIC(10,2) DEFAULT 0,
  iou_amount NUMERIC(10,2) DEFAULT 0,
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Seed the 13 employees
INSERT INTO employees (name, basic_pay, working_days, ot_divisor, sort_order) VALUES
  ('ZAINAB USMAN',         100000, 26, 12,  1),
  ('TINA EZEKIEL',          52000, 26, 10,  2),
  ('HALIMA S ABDULLAHI',     20000, 26,  8,  3),
  ('AISHA 1',               35000, 26, 14,  4),
  ('AISHA 2',               35000, 26,  5,  5),
  ('MAGDALENE',             35000, 26,  6,  6),
  ('BELLO AHMED MUSA',      45000, 26, 10,  7),
  ('HAUWA',                 17000, 30,  8,  8),
  ('HAYATU S BAWA',         35000, 26, 14,  9),
  ('TIMOTHY M PAUL',        22000, 26,  8, 10),
  ('MUSTAPHA ABBAS',        40000, 26, 10, 11),
  ('GLORIA EZEKIEL AUTA',   40000, 26, 12, 12),
  ('ADAMU YAHYA',           30000, 26, 10, 13);

-- Disable RLS for simplicity (internal tool)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth needed for this internal tool)
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on salary_records" ON salary_records FOR ALL USING (true) WITH CHECK (true);
