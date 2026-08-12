-- 1. Add the clock_code column if it doesn't exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS clock_code TEXT UNIQUE;

-- 2. Seed some codes for your mock data (Optional - for testing)
-- You can set specific codes for employees here:
UPDATE employees SET clock_code = '12345' WHERE email = 'stanleyboshoff@gmail.com';
UPDATE employees SET clock_code = '54321' WHERE employee_number = 'EMP002';
UPDATE employees SET clock_code = '11111' WHERE employee_number = 'EMP003';
