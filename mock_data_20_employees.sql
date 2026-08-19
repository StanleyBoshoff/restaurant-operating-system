-- Restaurise REMS - 20 Employee Professional Mock Dataset (Resilient Edition)
-- South African Restaurant Context (FOH, BOH, Management)
-- This script is IDEMPOTENT (safe to run multiple times).

-- 0. Fix the Test Registry Table (Allowing multiple users per level)
DROP TABLE IF EXISTS test_credentials;
CREATE TABLE test_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT,
    email TEXT UNIQUE,
    password TEXT,
    level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Ensure Roles Exist with Terminal Permission
INSERT INTO roles (role_name, classification, authority_level, is_reporting_position, permissions) VALUES
('Master Technician', 'Admin', 10, TRUE, '{"can_access_settings": true, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_edit_personnel": true, "can_delete_personnel": true, "can_view_financial_reports": true, "can_export_data": true, "can_edit_attendance_register": true, "can_edit_committed_timesheets": true, "can_edit_terminal_records": true, "can_access_terminal": true, "can_view_reports": true, "can_view_timesheets": true, "can_view_leave_tracker": true, "can_manage_checklists": true, "can_submit_forms": true, "can_manage_training": true, "can_access_safety": true, "can_access_communication": true}'),
('Owner', 'Management', 9, TRUE, '{"can_access_settings": true, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_access_terminal": true, "can_view_reports": true, "can_view_timesheets": true}'),
('HR Manager', 'Management', 8, TRUE, '{"can_access_settings": false, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_access_terminal": true, "can_view_reports": true}'),
('General Manager', 'Management', 7, TRUE, '{"can_access_settings": false, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_access_terminal": true, "can_view_reports": true}'),
('Head Chef', 'Management', 6, TRUE, '{"can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": false}'),
('Floor Manager', 'Management', 5, TRUE, '{"can_manage_disciplinary": true, "can_approve_leave": false}'),
('Sous Chef', 'BOH', 4, TRUE, '{"can_manage_disciplinary": false, "can_approve_leave": false}'),
('Senior Waiter', 'FOH', 3, FALSE, '{"can_manage_disciplinary": false, "can_approve_leave": false}'),
('Waiter', 'FOH', 2, FALSE, '{}'),
('Entry Level', 'BOH', 1, FALSE, '{}')
ON CONFLICT (role_name) DO UPDATE SET
    authority_level = EXCLUDED.authority_level,
    is_reporting_position = EXCLUDED.is_reporting_position,
    permissions = EXCLUDED.permissions;

-- 2. Clear existing employees and insert 20 Mock Employees with sequential 5-digit clock codes
TRUNCATE TABLE employee_timesheets, employees CASCADE;

DO $$
DECLARE
    r_mt UUID; r_owner UUID; r_hr UUID; r_gm UUID; r_hc UUID; r_fm UUID; r_sc UUID; r_sw UUID; r_w UUID; r_e UUID;
BEGIN
    SELECT id INTO r_mt FROM roles WHERE role_name = 'Master Technician';
    SELECT id INTO r_owner FROM roles WHERE role_name = 'Owner';
    SELECT id INTO r_hr FROM roles WHERE role_name = 'HR Manager';
    SELECT id INTO r_gm FROM roles WHERE role_name = 'General Manager';
    SELECT id INTO r_hc FROM roles WHERE role_name = 'Head Chef';
    SELECT id INTO r_fm FROM roles WHERE role_name = 'Floor Manager';
    SELECT id INTO r_sc FROM roles WHERE role_name = 'Sous Chef';
    SELECT id INTO r_sw FROM roles WHERE role_name = 'Senior Waiter';
    SELECT id INTO r_w FROM roles WHERE role_name = 'Waiter';
    SELECT id INTO r_e FROM roles WHERE role_name = 'Entry Level';

    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code) VALUES
    ('Stanley', 'Boshoff', 'stanleyboshoff@gmail.com', r_mt, 'Master Technician', 'Admin', 'Full Time', '2025-01-01', 'EMP001', '10001'),
    ('Owner', 'User', 'owner@rems.test', r_owner, 'Owner', 'Management', 'Full Time', '2025-01-01', 'EMP002', '10002'),
    ('HR', 'Manager', 'hr@rems.test', r_hr, 'HR Manager', 'Management', 'Full Time', '2025-01-01', 'EMP003', '10003'),
    ('Thabo', 'Mokoena', 'gm@rems.test', r_gm, 'General Manager', 'Management', 'Full Time', '2025-02-15', 'EMP004', '10004'),
    ('Chef', 'Thabo', 'chef@rems.test', r_hc, 'Head Chef', 'BOH', 'Full Time', '2025-02-15', 'EMP005', '10005'),
    ('Sarah', 'Smit', 'floor@rems.test', r_fm, 'Floor Manager', 'Management', 'Full Time', '2025-03-01', 'EMP006', '10006'),
    ('Andre', 'van Wyk', 'sous@rems.test', r_sc, 'Sous Chef', 'BOH', 'Full Time', '2025-04-01', 'EMP007', '10007'),
    ('John', 'Doe', 'senior.waiter@rems.test', r_sw, 'Senior Waiter', 'FOH', 'Full Time', '2025-05-10', 'EMP008', '10008'),
    ('Lerato', 'Khumalo', 'waiter1@rems.test', r_w, 'Waiter', 'FOH', 'Part Time', '2025-06-20', 'EMP009', '10009'),
    ('Sipho', 'Zulu', 'waiter2@rems.test', r_w, 'Waiter', 'FOH', 'Part Time', '2025-06-25', 'EMP010', '10010'),
    ('Nomvula', 'Dlamini', 'waiter3@rems.test', r_w, 'Waiter', 'FOH', 'Full Time', '2025-07-01', 'EMP011', '10011'),
    ('Pieter', 'Botha', 'waiter4@rems.test', r_w, 'Waiter', 'FOH', 'Full Time', '2025-07-05', 'EMP012', '10012'),
    ('Elena', 'Naidoo', 'waiter5@rems.test', r_w, 'Waiter', 'FOH', 'Part Time', '2025-07-10', 'EMP013', '10013'),
    ('Bongani', 'Nkosi', 'cook1@rems.test', r_e, 'Entry Level', 'BOH', 'Full Time', '2025-08-01', 'EMP014', '10014'),
    ('Fatima', 'Patel', 'cook2@rems.test', r_e, 'Entry Level', 'BOH', 'Full Time', '2025-08-05', 'EMP015', '10015'),
    ('Gary', 'Smith', 'cook3@rems.test', r_e, 'Entry Level', 'BOH', 'Part Time', '2025-08-10', 'EMP016', '10016'),
    ('Hlengiwe', 'Mabaso', 'waiter6@rems.test', r_w, 'Waiter', 'FOH', 'Full Time', '2025-09-01', 'EMP017', '10017'),
    ('Isaac', 'Newton', 'cleaner1@rems.test', r_e, 'Entry Level', 'BOH', 'Full Time', '2025-09-05', 'EMP018', '10018'),
    ('Jabu', 'Mahlangu', 'cleaner2@rems.test', r_e, 'Entry Level', 'BOH', 'Full Time', '2025-09-10', 'EMP019', '10019'),
    ('Karin', 'Meyer', 'trainee1@rems.test', r_e, 'Entry Level', 'BOH', 'Part Time', '2025-09-15', 'EMP020', '10020');
END $$;

-- 3. Update Test Credentials Registry
TRUNCATE TABLE test_credentials;
INSERT INTO test_credentials (label, email, password, level)
SELECT first_name || ' (' || role || ')', email, 'password123', roles.authority_level
FROM employees JOIN roles ON employees.role_id = roles.id WHERE roles.authority_level >= 7 ORDER BY roles.authority_level DESC;

-- 4. Safety: Ensure no security policies block testing
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_timesheets DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_credentials DISABLE ROW LEVEL SECURITY;
