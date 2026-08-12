-- Restaurise REMS - 20 Employee Professional Mock Dataset (Resilient Edition)
-- South African Restaurant Context (FOH, BOH, Management)
-- This script is IDEMPOTENT (safe to run multiple times).

-- 1. Ensure Roles Exist with full permissions for higher levels
INSERT INTO roles (role_name, classification, authority_level, is_reporting_position, permissions) VALUES
('Master Technician', 'Admin', 10, TRUE, '{"can_access_settings": true, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_edit_personnel": true, "can_delete_personnel": true, "can_view_financial_reports": true, "can_export_data": true, "can_edit_attendance_register": true, "can_edit_committed_timesheets": true, "can_edit_terminal_records": true, "can_view_reports": true, "can_view_timesheets": true, "can_view_leave_tracker": true, "can_manage_checklists": true, "can_submit_forms": true, "can_manage_training": true, "can_access_safety": true, "can_access_communication": true}'),
('Owner', 'Management', 9, TRUE, '{"can_access_settings": true, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_view_reports": true, "can_view_timesheets": true}'),
('HR Manager', 'Management', 8, TRUE, '{"can_access_settings": false, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_view_reports": true}'),
('General Manager', 'Management', 7, TRUE, '{"can_access_settings": false, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_view_reports": true}'),
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

-- 2. Insert 20 Employees with unique emails and 5-digit clock codes
DO $$
DECLARE
    role_mt UUID; role_owner UUID; role_hr UUID; role_gm UUID; role_hc UUID; role_fm UUID; role_sc UUID; role_sw UUID; role_w UUID; role_e UUID;
BEGIN
    SELECT id INTO role_mt FROM roles WHERE role_name = 'Master Technician';
    SELECT id INTO role_owner FROM roles WHERE role_name = 'Owner';
    SELECT id INTO role_hr FROM roles WHERE role_name = 'HR Manager';
    SELECT id INTO role_gm FROM roles WHERE role_name = 'General Manager';
    SELECT id INTO role_hc FROM roles WHERE role_name = 'Head Chef';
    SELECT id INTO role_fm FROM roles WHERE role_name = 'Floor Manager';
    SELECT id INTO role_sc FROM roles WHERE role_name = 'Sous Chef';
    SELECT id INTO role_sw FROM roles WHERE role_name = 'Senior Waiter';
    SELECT id INTO role_w FROM roles WHERE role_name = 'Waiter';
    SELECT id INTO role_e FROM roles WHERE role_name = 'Entry Level';

    -- 1. Superadmin: Stanley
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('Stanley', 'Boshoff', 'stanleyboshoff@gmail.com', role_mt, 'Master Technician', 'Admin', 'Full Time', '2025-01-01', 'EMP001', '10010', '8501015000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET
        email = EXCLUDED.email, role_id = EXCLUDED.role_id, role = EXCLUDED.role, clock_code = EXCLUDED.clock_code, sa_id_number = EXCLUDED.sa_id_number;

    -- 2. Level 9: Owner
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('Owner', 'User', 'level9@rems.test', role_owner, 'Owner', 'Management', 'Full Time', '2025-01-01', 'EMP009', '10009', '8001015000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 3. Level 8: HR
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('HR', 'Manager', 'level8@rems.test', role_hr, 'HR Manager', 'Management', 'Full Time', '2025-01-01', 'EMP008', '10008', '8101015000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 4. Level 7: GM (Thabo)
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('Thabo', 'Mokoena', 'level7@rems.test', role_gm, 'General Manager', 'Management', 'Full Time', '2025-02-15', 'EMP007', '10007', '8201155000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 5. Level 6: Head Chef
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, passport_number, nationality)
    VALUES ('Chef', 'Thabo', 'level6@rems.test', role_hc, 'Head Chef', 'BOH', 'Full Time', '2025-02-15', 'EMP006', '10006', 'P1234567', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 6. Level 5: Floor Manager
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('Sarah', 'Smit', 'level5@rems.test', role_fm, 'Floor Manager', 'Management', 'Full Time', '2025-03-01', 'EMP005', '10005', '8303015000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 7. Level 4: Sous Chef
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, passport_number, nationality)
    VALUES ('Andre', 'van Wyk', 'level4@rems.test', role_sc, 'Sous Chef', 'BOH', 'Full Time', '2025-04-01', 'EMP004', '10004', 'P2234567', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 8. Level 3: Senior Waiter
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('John', 'Doe', 'level3@rems.test', role_sw, 'Senior Waiter', 'FOH', 'Full Time', '2025-05-10', 'EMP003', '10003', '8405105000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

    -- 9. Level 2: Waiter
    INSERT INTO employees (first_name, last_name, email, role_id, role, department, employment_type, start_date, employee_number, clock_code, sa_id_number, nationality)
    VALUES ('Lerato', 'Khumalo', 'level2@rems.test', role_w, 'Waiter', 'FOH', 'Part Time', '2025-06-20', 'EMP002', '10002', '8606205000081', 'South African')
    ON CONFLICT (employee_number) DO UPDATE SET email = EXCLUDED.email;

END $$;
