-- Restaurise REMS - 20 Employee Professional Mock Dataset
-- South African Restaurant Context (FOH, BOH, Management)
-- Run this in the Supabase SQL Editor.

-- 1. Ensure Roles Exist (Hierarchy-Aligned)
-- Note: We use UUIDs here. If roles already exist, we update their authority levels.
INSERT INTO roles (id, role_name, classification, authority_level) VALUES
(uuid_generate_v4(), 'General Manager', 'Management', 3),
(uuid_generate_v4(), 'Head Chef', 'Management', 3),
(uuid_generate_v4(), 'Floor Manager', 'Management', 4),
(uuid_generate_v4(), 'Sous Chef', 'BOH', 4),
(uuid_generate_v4(), 'Senior Waiter', 'FOH', 5),
(uuid_generate_v4(), 'Line Cook', 'BOH', 6),
(uuid_generate_v4(), 'Waiter', 'FOH', 6),
(uuid_generate_v4(), 'Runner', 'FOH', 6),
(uuid_generate_v4(), 'Cleaner', 'BOH', 6)
ON CONFLICT (role_name) DO UPDATE SET authority_level = EXCLUDED.authority_level;

-- 2. Insert 20 Employees
-- We use a DO block to fetch role IDs and manage the hierarchy.
DO $$
DECLARE
    role_gm UUID;
    role_hc UUID;
    role_fm UUID;
    role_sc UUID;
    role_sw UUID;
    role_lc UUID;
    role_w UUID;
    role_r UUID;
    role_c UUID;
    emp_gm UUID;
    emp_hc UUID;
    emp_fm UUID;
BEGIN
    SELECT id INTO role_gm FROM roles WHERE role_name = 'General Manager';
    SELECT id INTO role_hc FROM roles WHERE role_name = 'Head Chef';
    SELECT id INTO role_fm FROM roles WHERE role_name = 'Floor Manager';
    SELECT id INTO role_sc FROM roles WHERE role_name = 'Sous Chef';
    SELECT id INTO role_sw FROM roles WHERE role_name = 'Senior Waiter';
    SELECT id INTO role_lc FROM roles WHERE role_name = 'Line Cook';
    SELECT id INTO role_w FROM roles WHERE role_name = 'Waiter';
    SELECT id INTO role_r FROM roles WHERE role_name = 'Runner';
    SELECT id INTO role_c FROM roles WHERE role_name = 'Cleaner';

    -- Manager: Stanley (GM)
    INSERT INTO employees (id, first_name, last_name, role_id, role, department, employment_type, start_date, branch, sa_id_number, employee_number)
    VALUES (uuid_generate_v4(), 'Stanley', 'Boshoff', role_gm, 'General Manager', 'Management', 'Full Time', '2025-01-01', 'Centurion Central', '8501015000081', 'EMP001')
    RETURNING id INTO emp_gm;

    -- Kitchen Lead
    INSERT INTO employees (id, first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number)
    VALUES (uuid_generate_v4(), 'Thabo', 'Mokoena', role_hc, 'Head Chef', 'BOH', 'Full Time', '2025-02-15', 'Centurion Central', emp_gm, 'EMP002')
    RETURNING id INTO emp_hc;

    -- FOH Manager
    INSERT INTO employees (id, first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number)
    VALUES (uuid_generate_v4(), 'Sarah', 'Smit', role_fm, 'Floor Manager', 'FOH', 'Full Time', '2025-03-01', 'Centurion Central', emp_gm, 'EMP003')
    RETURNING id INTO emp_fm;

    -- Waiters & Runners (Reporting to Sarah)
    INSERT INTO employees (first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number)
    VALUES
    ('John', 'Doe', role_sw, 'Senior Waiter', 'FOH', 'Full Time', '2025-05-10', 'Centurion Central', emp_fm, 'EMP004'),
    ('Lerato', 'Khumalo', role_w, 'Waiter', 'FOH', 'Part Time', '2025-06-20', 'Centurion Central', emp_fm, 'EMP005'),
    ('David', 'Miller', role_w, 'Waiter', 'FOH', 'Casual', '2025-07-01', 'Centurion Central', emp_fm, 'EMP006'),
    ('Nomvula', 'Zwane', role_w, 'Waiter', 'FOH', 'Part Time', '2025-07-15', 'Centurion Central', emp_fm, 'EMP007'),
    ('Kevin', 'Naidoo', role_r, 'Runner', 'FOH', 'Casual', '2025-08-01', 'Centurion Central', emp_fm, 'EMP008'),
    ('Elena', 'Petrova', role_r, 'Runner', 'FOH', 'Full Time', '2025-08-10', 'Centurion Central', emp_fm, 'EMP009'),
    ('Sipho', 'Dlamini', role_w, 'Waiter', 'FOH', 'Part Time', '2025-08-20', 'Centurion Central', emp_fm, 'EMP010');

    -- BOH Team (Reporting to Thabo)
    INSERT INTO employees (first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number)
    VALUES
    ('Andre', 'van Wyk', role_sc, 'Sous Chef', 'BOH', 'Full Time', '2025-04-01', 'Centurion Central', emp_hc, 'EMP011'),
    ('Buhle', 'Guma', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-05-01', 'Centurion Central', emp_hc, 'EMP012'),
    ('Peter', 'Jones', role_lc, 'Line Cook', 'BOH', 'Part Time', '2025-06-01', 'Centurion Central', emp_hc, 'EMP013'),
    ('Grace', 'Molefe', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-06-15', 'Centurion Central', emp_hc, 'EMP014'),
    ('Mandla', 'Nkosi', role_lc, 'Line Cook', 'BOH', 'Casual', '2025-07-01', 'Centurion Central', emp_hc, 'EMP015'),
    ('Tshepo', 'Radebe', role_c, 'Cleaner', 'BOH', 'Full Time', '2025-01-10', 'Centurion Central', emp_hc, 'EMP016'),
    ('Zanele', 'Mbeki', role_c, 'Cleaner', 'BOH', 'Full Time', '2025-02-01', 'Centurion Central', emp_hc, 'EMP017'),
    ('Riaan', 'Botha', role_lc, 'Line Cook', 'BOH', 'Part Time', '2025-03-20', 'Centurion Central', emp_hc, 'EMP018'),
    ('Maria', 'Garcia', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-04-10', 'Centurion Central', emp_hc, 'EMP019'),
    ('Fikile', 'Zulu', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-05-05', 'Centurion Central', emp_hc, 'EMP020');

END $$;

-- 3. Insert Sample Performance Reviews (To power the Score UI)
INSERT INTO performance_reviews (employee_id, rating, comments)
SELECT id, (RANDOM() * 3 + 7), 'Consistently high standard of service.' FROM employees;

-- 4. Insert Sample Timesheets (To power Attendance UI)
INSERT INTO employee_timesheets (employee_id, clock_in, clock_out, status)
SELECT
    id,
    NOW() - INTERVAL '2 days' + INTERVAL '8 hours',
    NOW() - INTERVAL '2 days' + INTERVAL '17 hours',
    'Completed'
FROM employees;

-- 5. Insert Sample Activity Logs
INSERT INTO activity_logs (employee_id, action, category)
SELECT id, 'Profile baseline synchronized', 'System' FROM employees;
