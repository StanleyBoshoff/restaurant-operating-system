-- Restaurise REMS - 20 Employee Professional Mock Dataset (Resilient Edition)
-- South African Restaurant Context (FOH, BOH, Management)
-- This script is IDEMPOTENT (safe to run multiple times).

-- 1. Ensure Roles Exist
INSERT INTO roles (id, role_name, classification, authority_level, is_reporting_position) VALUES
(uuid_generate_v4(), 'General Manager', 'Management', 3, TRUE),
(uuid_generate_v4(), 'Head Chef', 'Management', 3, TRUE),
(uuid_generate_v4(), 'Floor Manager', 'Management', 4, TRUE),
(uuid_generate_v4(), 'Sous Chef', 'BOH', 4, TRUE),
(uuid_generate_v4(), 'Senior Waiter', 'FOH', 5, FALSE),
(uuid_generate_v4(), 'Line Cook', 'BOH', 6, FALSE),
(uuid_generate_v4(), 'Waiter', 'FOH', 6, FALSE),
(uuid_generate_v4(), 'Runner', 'FOH', 6, FALSE),
(uuid_generate_v4(), 'Cleaner', 'BOH', 6, FALSE)
ON CONFLICT (role_name) DO UPDATE SET
    authority_level = EXCLUDED.authority_level,
    is_reporting_position = EXCLUDED.is_reporting_position;

-- 2. Insert 20 Employees
DO $$
DECLARE
    role_gm UUID; role_hc UUID; role_fm UUID; role_sc UUID;
    role_sw UUID; role_lc UUID; role_w UUID; role_r UUID; role_c UUID;
    emp_gm UUID; emp_hc UUID; emp_fm UUID;
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
    INSERT INTO employees (id, first_name, last_name, role_id, role, department, employment_type, start_date, branch, sa_id_number, employee_number, nationality)
    VALUES (uuid_generate_v4(), 'Stanley', 'Boshoff', role_gm, 'General Manager', 'Management', 'Full Time', '2025-01-01', 'Centurion Central', '8501015000081', 'EMP001', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role_id = EXCLUDED.role_id, role = EXCLUDED.role,
        department = EXCLUDED.department, employment_type = EXCLUDED.employment_type, start_date = EXCLUDED.start_date,
        branch = EXCLUDED.branch, sa_id_number = EXCLUDED.sa_id_number, nationality = EXCLUDED.nationality
    RETURNING id INTO emp_gm;

    -- Kitchen Lead
    INSERT INTO employees (id, first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number, nationality)
    VALUES (uuid_generate_v4(), 'Thabo', 'Mokoena', role_hc, 'Head Chef', 'BOH', 'Full Time', '2025-02-15', 'Centurion Central', emp_gm, 'EMP002', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role_id = EXCLUDED.role_id, role = EXCLUDED.role,
        department = EXCLUDED.department, employment_type = EXCLUDED.employment_type, start_date = EXCLUDED.start_date,
        branch = EXCLUDED.branch, reports_to_id = EXCLUDED.reports_to_id, nationality = EXCLUDED.nationality
    RETURNING id INTO emp_hc;

    -- FOH Manager
    INSERT INTO employees (id, first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number, nationality)
    VALUES (uuid_generate_v4(), 'Sarah', 'Smit', role_fm, 'Floor Manager', 'FOH', 'Full Time', '2025-03-01', 'Centurion Central', emp_gm, 'EMP003', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role_id = EXCLUDED.role_id, role = EXCLUDED.role,
        department = EXCLUDED.department, employment_type = EXCLUDED.employment_type, start_date = EXCLUDED.start_date,
        branch = EXCLUDED.branch, reports_to_id = EXCLUDED.reports_to_id, nationality = EXCLUDED.nationality
    RETURNING id INTO emp_fm;

    -- Batch Insert Staff
    INSERT INTO employees (first_name, last_name, role_id, role, department, employment_type, start_date, branch, reports_to_id, employee_number, nationality)
    VALUES
    ('John', 'Doe', role_sw, 'Senior Waiter', 'FOH', 'Full Time', '2025-05-10', 'Centurion Central', emp_fm, 'EMP004', 'South African'),
    ('Lerato', 'Khumalo', role_w, 'Waiter', 'FOH', 'Part Time', '2025-06-20', 'Centurion Central', emp_fm, 'EMP005', 'South African'),
    ('David', 'Miller', role_w, 'Waiter', 'FOH', 'Casual', '2025-07-01', 'Centurion Central', emp_fm, 'EMP006', 'South African'),
    ('Nomvula', 'Zwane', role_w, 'Waiter', 'FOH', 'Part Time', '2025-07-15', 'Centurion Central', emp_fm, 'EMP007', 'South African'),
    ('Kevin', 'Naidoo', role_r, 'Runner', 'FOH', 'Casual', '2025-08-01', 'Centurion Central', emp_fm, 'EMP008', 'South African'),
    ('Elena', 'Petrova', role_r, 'Runner', 'FOH', 'Full Time', '2025-08-10', 'Centurion Central', emp_fm, 'EMP009', 'Bulgarian'),
    ('Sipho', 'Dlamini', role_w, 'Waiter', 'FOH', 'Part Time', '2025-08-20', 'Centurion Central', emp_fm, 'EMP010', 'South African'),
    ('Andre', 'van Wyk', role_sc, 'Sous Chef', 'BOH', 'Full Time', '2025-04-01', 'Centurion Central', emp_hc, 'EMP011', 'South African'),
    ('Buhle', 'Guma', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-05-01', 'Centurion Central', emp_hc, 'EMP012', 'South African'),
    ('Peter', 'Jones', role_lc, 'Line Cook', 'BOH', 'Part Time', '2025-06-01', 'Centurion Central', emp_hc, 'EMP013', 'South African'),
    ('Grace', 'Molefe', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-06-15', 'Centurion Central', emp_hc, 'EMP014', 'South African'),
    ('Mandla', 'Nkosi', role_lc, 'Line Cook', 'BOH', 'Casual', '2025-07-01', 'Centurion Central', emp_hc, 'EMP015', 'South African'),
    ('Tshepo', 'Radebe', role_c, 'Cleaner', 'BOH', 'Full Time', '2025-01-10', 'Centurion Central', emp_hc, 'EMP016', 'South African'),
    ('Zanele', 'Mbeki', role_c, 'Cleaner', 'BOH', 'Full Time', '2025-02-01', 'Centurion Central', emp_hc, 'EMP017', 'South African'),
    ('Riaan', 'Botha', role_lc, 'Line Cook', 'BOH', 'Part Time', '2025-03-20', 'Centurion Central', emp_hc, 'EMP018', 'South African'),
    ('Maria', 'Garcia', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-04-10', 'Centurion Central', emp_hc, 'EMP019', 'Spanish'),
    ('Fikile', 'Zulu', role_lc, 'Line Cook', 'BOH', 'Full Time', '2025-05-05', 'Centurion Central', emp_hc, 'EMP020', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role_id = EXCLUDED.role_id, role = EXCLUDED.role,
        department = EXCLUDED.department, employment_type = EXCLUDED.employment_type, start_date = EXCLUDED.start_date,
        branch = EXCLUDED.branch, reports_to_id = EXCLUDED.reports_to_id, nationality = EXCLUDED.nationality;

END $$;

-- 3. Mock Schedules (For Variance Reports)
INSERT INTO employee_schedules (employee_id, shift_date, scheduled_in, scheduled_out, department)
SELECT id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours', department FROM employees
ON CONFLICT (employee_id, shift_date) DO NOTHING;

-- 4. Mock Timesheets (For Attendance Reports)
INSERT INTO employee_timesheets (employee_id, shift_date, clock_in, clock_out, status, is_approved)
SELECT id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours', 'Completed', TRUE FROM employees
ON CONFLICT (employee_id, shift_date) DO NOTHING;

-- 5. Mock Payroll Adjustments (Tips, Allowances)
INSERT INTO employee_payroll_adjustments (employee_id, adjustment_type, amount, notes)
SELECT id, 'CC Tip', (RANDOM() * 500 + 100), 'Monthly allocation' FROM employees WHERE role = 'Waiter'
ON CONFLICT DO NOTHING;

-- 6. Mock Budgets
INSERT INTO department_budgets (department, branch, month_year, budgeted_hours, budgeted_cost)
VALUES
('FOH', 'Centurion Central', date_trunc('month', CURRENT_DATE), 1200, 45000),
('BOH', 'Centurion Central', date_trunc('month', CURRENT_DATE), 800, 32000),
('Management', 'Centurion Central', date_trunc('month', CURRENT_DATE), 320, 25000)
ON CONFLICT (department, branch, month_year) DO UPDATE SET budgeted_hours = EXCLUDED.budgeted_hours, budgeted_cost = EXCLUDED.budgeted_cost;
