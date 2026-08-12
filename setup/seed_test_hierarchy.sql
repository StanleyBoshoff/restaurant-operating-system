-- 1. Create Roles for All 11 Levels
INSERT INTO roles (role_name, classification, authority_level, is_reporting_position, permissions) VALUES
('System Administrator', 'System', 11, TRUE, '{"can_access_settings": true, "can_view_higher_hierarchy": true}'),
('Owner', 'Management', 10, TRUE, '{}'),
('HR Manager', 'Management', 9, TRUE, '{}'),
('General Manager', 'Management', 8, TRUE, '{}'),
('Head Chef', 'Management', 7, TRUE, '{}'),
('Floor Manager', 'FOH', 6, TRUE, '{}'),
('Sous Chef', 'BOH', 5, TRUE, '{}'),
('Senior Waiter', 'FOH', 4, FALSE, '{}'),
('Waiter', 'FOH', 3, FALSE, '{}'),
('Entry Level', 'BOH', 2, FALSE, '{}'),
('Trainee', 'Other', 1, FALSE, '{}')
ON CONFLICT (role_name) DO UPDATE SET
    authority_level = EXCLUDED.authority_level,
    permissions = EXCLUDED.permissions;

-- 2. Ensure authority_levels table is reset for testing (Empty Canvas)
DELETE FROM authority_levels;
INSERT INTO authority_levels (level, permissions)
SELECT level, '{}'::JSONB FROM generate_series(1, 10) AS level;

-- 3. Clear and Insert Test Employees for Levels 1-10
DELETE FROM employees WHERE email LIKE '%@rems.test';

INSERT INTO employees (first_name, last_name, email, role, clock_code, employee_number, role_id)
VALUES
('Sarah', 'Owner', 'level10@rems.test', 'Owner', '10010', 'EMP110', (SELECT id FROM roles WHERE role_name = 'Owner')),
('John', 'HR', 'level9@rems.test', 'HR Manager', '10009', 'EMP109', (SELECT id FROM roles WHERE role_name = 'HR Manager')),
('Thabo', 'GM', 'level8@rems.test', 'General Manager', '10008', 'EMP108', (SELECT id FROM roles WHERE role_name = 'General Manager')),
('Chef', 'Lead', 'level7@rems.test', 'Head Chef', '10007', 'EMP107', (SELECT id FROM roles WHERE role_name = 'Head Chef')),
('Floor', 'Mgr', 'level6@rems.test', 'Floor Manager', '10006', 'EMP106', (SELECT id FROM roles WHERE role_name = 'Floor Manager')),
('Sous', 'Chef', 'level5@rems.test', 'Sous Chef', '10005', 'EMP105', (SELECT id FROM roles WHERE role_name = 'Sous Chef')),
('Senior', 'Wait', 'level4@rems.test', 'Senior Waiter', '10004', 'EMP104', (SELECT id FROM roles WHERE role_name = 'Senior Waiter')),
('Waiter', 'User', 'level3@rems.test', 'Waiter', '10003', 'EMP103', (SELECT id FROM roles WHERE role_name = 'Waiter')),
('Entry', 'User', 'level2@rems.test', 'Entry Level', '10002', 'EMP102', (SELECT id FROM roles WHERE role_name = 'Entry Level')),
('Trainee', 'User', 'level1@rems.test', 'Trainee', '10001', 'EMP101', (SELECT id FROM roles WHERE role_name = 'Trainee'));

-- 4. Re-promote Stanley to Level 11
UPDATE employees
SET role_id = (SELECT id FROM roles WHERE role_name = 'System Administrator'),
    role = 'System Administrator',
    auth_id = (SELECT id FROM auth.users WHERE email = 'stanleyboshoff@gmail.com' LIMIT 1)
WHERE email = 'stanleyboshoff@gmail.com';
