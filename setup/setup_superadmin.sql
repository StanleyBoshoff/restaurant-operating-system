-- 1. Ensure the Level 10 Role exists in the custom matrix
INSERT INTO roles (role_name, classification, authority_level, is_reporting_position, permissions)
VALUES (
    'Master Technician',
    'Admin',
    10,
    TRUE,
    '{"can_access_settings": true, "can_view_salary": true, "can_manage_disciplinary": true, "can_approve_leave": true, "can_view_all_staff": true, "can_edit_personnel": true, "can_delete_personnel": true, "can_view_financial_reports": true, "can_export_data": true, "can_edit_attendance_register": true, "can_edit_committed_timesheets": true, "can_edit_terminal_records": true}'
)
ON CONFLICT (role_name) DO UPDATE SET
    authority_level = 10,
    permissions = EXCLUDED.permissions;

-- 2. Link Stanley's profile to the Level 10 role
-- Note: Replace the UUID below if your employee ID for Stanley is different
UPDATE employees
SET role_id = (SELECT id FROM roles WHERE role_name = 'Master Technician'),
    email = 'stanleyboshoff@gmail.com'
WHERE employee_number = 'EMP001' OR email = 'stanleyboshoff@gmail.com';

-- 3. (RUN THIS AFTER YOU LOGIN)
-- Once you have logged in for the first time, you will need to find your auth_id
-- from the auth.users table and update the employee record:
-- UPDATE employees SET auth_id = 'YOUR_NEW_AUTH_ID' WHERE email = 'stanleyboshoff@gmail.com';
