-- Align Employee emails with Supabase Auth users created in dashboard
-- Run this in your Supabase SQL Editor

UPDATE employees SET email = 'stanleyboshoff@gmail.com' WHERE employee_number = 'EMP001';
UPDATE employees SET email = 'owner@rems.test' WHERE employee_number = 'EMP002';
UPDATE employees SET email = 'hr@rems.test' WHERE employee_number = 'EMP003';
UPDATE employees SET email = 'gm@rems.test' WHERE employee_number = 'EMP004';
UPDATE employees SET email = 'chef@rems.test' WHERE employee_number = 'EMP005';
UPDATE employees SET email = 'floor@rems.test' WHERE employee_number = 'EMP006';
UPDATE employees SET email = 'sous@rems.test' WHERE employee_number = 'EMP007';
UPDATE employees SET email = 'waiter_snr@rems.test' WHERE employee_number = 'EMP008';
UPDATE employees SET email = 'waiter@rems.test' WHERE employee_number = 'EMP009';
UPDATE employees SET email = 'entry@rems.test' WHERE employee_number = 'EMP014';
UPDATE employees SET email = 'trainee@rems.test' WHERE employee_number = 'EMP020';

-- Verify update
SELECT first_name, last_name, email, role FROM employees ORDER BY employee_number;
