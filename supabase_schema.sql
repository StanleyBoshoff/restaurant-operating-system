-- Restaurise REMS - Master Supabase Schema (Stable Edition)
-- Generated: 2026-08-03
-- This file is IDEMPOTENT (safe to run multiple times without data loss).

-- ==========================================
-- 0. EXTENSIONS & SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CORE FOUNDATION
-- ==========================================

-- Roles / Job Titles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    classification TEXT,
    authority_level INTEGER DEFAULT 1, -- 10: Admin, 9: Boss, ..., 1: Entry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authority Levels & Master Permission Matrix
CREATE TABLE IF NOT EXISTS authority_levels (
    level INTEGER PRIMARY KEY, -- 1 to 10
    permissions JSONB DEFAULT '{
        "can_access_settings": false,
        "can_view_salary": false,
        "can_manage_disciplinary": false,
        "can_approve_leave": false,
        "can_view_all_staff": false,
        "can_edit_personnel": false,
        "can_delete_personnel": false,
        "can_view_financial_reports": false,
        "can_export_data": false,
        "can_edit_attendance_register": false,
        "can_edit_committed_timesheets": false,
        "can_edit_terminal_records": false
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Payroll Settings
CREATE TABLE IF NOT EXISTS company_payroll_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auto_deduct_lunch BOOLEAN DEFAULT TRUE,
    lunch_duration_mins INTEGER DEFAULT 60,
    break_threshold_hrs INTEGER DEFAULT 5,
    sunday_multiplier DECIMAL(3,2) DEFAULT 1.5,
    holiday_multiplier DECIMAL(3,2) DEFAULT 2.0,
    auto_clock_out_hrs INTEGER DEFAULT 12,
    shift_end_cutoff_time TIME DEFAULT '23:59:59',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    role TEXT,
    reports_to_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    branch TEXT,
    department TEXT,
    employment_type TEXT,
    employment_status TEXT DEFAULT 'Active',
    nationality TEXT,
    phone_number TEXT,
    email TEXT UNIQUE,
    start_date DATE,
    end_date DATE,
    manager_name TEXT,
    probation_status TEXT DEFAULT 'Not Started',
    salary_wage TEXT,
    emergency_contact_name TEXT,
    emergency_contact_number TEXT,
    sa_id_number TEXT,
    leave_opening_balance_annual DECIMAL(5,2) DEFAULT 0,
    leave_opening_balance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. WORKFORCE OPERATIONS
-- ==========================================

-- Time & Attendance
CREATE TABLE IF NOT EXISTS employee_timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    branch_id TEXT,
    shift_date DATE,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_committed BOOLEAN DEFAULT FALSE,
    record_source TEXT DEFAULT 'Manual', -- 'Terminal', 'Manual'
    auto_clocked_out BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_emp_day_shift UNIQUE (employee_id, shift_date)
);

-- Employee Schedules (Planned Shifts)
CREATE TABLE IF NOT EXISTS employee_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    scheduled_in TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_out TIMESTAMP WITH TIME ZONE NOT NULL,
    department TEXT,
    branch TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_emp_day_schedule UNIQUE (employee_id, shift_date)
);

-- Department Budgets (Labor Cost Control)
CREATE TABLE IF NOT EXISTS department_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department TEXT NOT NULL,
    branch TEXT,
    month_year DATE NOT NULL, -- First day of the month
    budgeted_hours DECIMAL(10,2) DEFAULT 0,
    budgeted_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_dept_branch_month UNIQUE (department, branch, month_year)
);

-- Indices & Triggers for Integrity
CREATE OR REPLACE FUNCTION sync_shift_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.shift_date := (NEW.clock_in AT TIME ZONE 'UTC')::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_shift_date ON employee_timesheets;
CREATE TRIGGER trg_sync_shift_date
BEFORE INSERT OR UPDATE OF clock_in ON employee_timesheets
FOR EACH ROW EXECUTE FUNCTION sync_shift_date();

-- Statutory Leave
CREATE TABLE IF NOT EXISTS employee_leave (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days_requested INTEGER,
    total_statutory_days_deducted DECIMAL(5,2),
    status TEXT DEFAULT 'Pending',
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'Medium',
    assigned_to_id UUID REFERENCES employees(id),
    assigned_to_dept TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. COMPLIANCE & HR
-- ==========================================

-- Document Vault
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    expiry_date DATE,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disciplinary (Legal Shield)
CREATE TABLE IF NOT EXISTS employee_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    warning_level TEXT NOT NULL,
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    issued_by TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Learning (Knowledge Base)
CREATE TABLE IF NOT EXISTS disciplinary_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    raw_facts JSONB,
    final_draft TEXT,
    warning_level TEXT,
    incident_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. OPERATIONAL LOGS
-- ==========================================

-- Checklist Core
CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS checklist_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID REFERENCES checklists(id),
    submitted_by_name TEXT,
    submission_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS forms_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type TEXT NOT NULL,
    submitted_by UUID REFERENCES employees(id),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. KNOWLEDGE & COMMUNICATION
-- ==========================================

-- Broadcast Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    target_audience TEXT DEFAULT 'All Staff',
    author TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training
CREATE TABLE IF NOT EXISTS training_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'Elective',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Not Started', -- In Progress, Completed
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES employees(id),
    rating DECIMAL(3,1), -- e.g., 8.5
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    category TEXT, -- Documents, Disciplinary, Leave, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. COLUMN INTEGRITY (SAFE ALTERATIONS)
-- ==========================================

DO $$
BEGIN
    -- ROLES: Add authority_level if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='authority_level') THEN
        ALTER TABLE roles ADD COLUMN authority_level INTEGER DEFAULT 6;
    END IF;

    -- ROLES: Add permissions if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='permissions') THEN
        ALTER TABLE roles ADD COLUMN permissions JSONB DEFAULT '{"can_access_settings": false, "can_view_salary": false, "can_manage_disciplinary": false, "can_approve_leave": false, "can_view_all_staff": false}';
    END IF;

    -- ROLES: Add is_reporting_position if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='is_reporting_position') THEN
        ALTER TABLE roles ADD COLUMN is_reporting_position BOOLEAN DEFAULT FALSE;
    END IF;

    -- Seed/Update managerial roles
    UPDATE roles SET is_reporting_position = TRUE WHERE role_name ILIKE '%Manager%' OR role_name ILIKE '%Chef%' OR role_name ILIKE '%HR%' OR role_name ILIKE '%Head%';

    -- EMPLOYEES: Add role_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='role_id') THEN
        ALTER TABLE employees ADD COLUMN role_id UUID REFERENCES roles(id);
    END IF;

    -- EMPLOYEES: Add reports_to_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='reports_to_id') THEN
        ALTER TABLE employees ADD COLUMN reports_to_id UUID REFERENCES employees(id);
    END IF;

    -- EMPLOYEES: Add preferred_name if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='preferred_name') THEN
        ALTER TABLE employees ADD COLUMN preferred_name TEXT;
    END IF;

    -- EMPLOYEES: Add bank_details_updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='bank_details_updated_at') THEN
        ALTER TABLE employees ADD COLUMN bank_details_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- NEW FIELDS FROM MANUAL FORMS
    -- Personal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='date_of_birth') THEN ALTER TABLE employees ADD COLUMN date_of_birth DATE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='passport_number') THEN ALTER TABLE employees ADD COLUMN passport_number TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='passport_expiry_date') THEN ALTER TABLE employees ADD COLUMN passport_expiry_date DATE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='marital_status') THEN ALTER TABLE employees ADD COLUMN marital_status TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='spouse_name') THEN ALTER TABLE employees ADD COLUMN spouse_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='spouse_nationality') THEN ALTER TABLE employees ADD COLUMN spouse_nationality TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='spouse_passport_number') THEN ALTER TABLE employees ADD COLUMN spouse_passport_number TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='dependants') THEN ALTER TABLE employees ADD COLUMN dependants JSONB DEFAULT '[]'; END IF;

    -- Address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address_street_no') THEN ALTER TABLE employees ADD COLUMN address_street_no TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address_street_name') THEN ALTER TABLE employees ADD COLUMN address_street_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address_area') THEN ALTER TABLE employees ADD COLUMN address_area TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address_code') THEN ALTER TABLE employees ADD COLUMN address_code TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address_line_1') THEN ALTER TABLE employees ADD COLUMN address_line_1 TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address_line_2') THEN ALTER TABLE employees ADD COLUMN address_line_2 TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='city') THEN ALTER TABLE employees ADD COLUMN city TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='postal_code') THEN ALTER TABLE employees ADD COLUMN postal_code TEXT; END IF;

    -- Emergency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_relationship') THEN ALTER TABLE employees ADD COLUMN emergency_contact_relationship TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_address') THEN ALTER TABLE employees ADD COLUMN emergency_contact_address TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_phone_work') THEN ALTER TABLE employees ADD COLUMN emergency_contact_phone_work TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_phone_home') THEN ALTER TABLE employees ADD COLUMN emergency_contact_phone_home TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_2_name') THEN ALTER TABLE employees ADD COLUMN emergency_contact_2_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_2_relationship') THEN ALTER TABLE employees ADD COLUMN emergency_contact_2_relationship TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_2_address') THEN ALTER TABLE employees ADD COLUMN emergency_contact_2_address TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_2_phone_work') THEN ALTER TABLE employees ADD COLUMN emergency_contact_2_phone_work TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='emergency_contact_2_phone_home') THEN ALTER TABLE employees ADD COLUMN emergency_contact_2_phone_home TEXT; END IF;

    -- Medical
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='medical_aid_number') THEN ALTER TABLE employees ADD COLUMN medical_aid_number TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='medical_aid_policy_number') THEN ALTER TABLE employees ADD COLUMN medical_aid_policy_number TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='blood_group') THEN ALTER TABLE employees ADD COLUMN blood_group TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='doctor_name') THEN ALTER TABLE employees ADD COLUMN doctor_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='doctor_phone') THEN ALTER TABLE employees ADD COLUMN doctor_phone TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='medical_conditions') THEN ALTER TABLE employees ADD COLUMN medical_conditions TEXT; END IF;

    -- BANKING & TAX
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='bank_account_holder') THEN ALTER TABLE employees ADD COLUMN bank_account_holder TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='bank_name') THEN ALTER TABLE employees ADD COLUMN bank_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='bank_account_number') THEN ALTER TABLE employees ADD COLUMN bank_account_number TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='bank_branch_code') THEN ALTER TABLE employees ADD COLUMN bank_branch_code TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='bank_account_type') THEN ALTER TABLE employees ADD COLUMN bank_account_type TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='tax_number') THEN ALTER TABLE employees ADD COLUMN tax_number TEXT; END IF;

    -- TIMESHEETS: Approval Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_timesheets' AND column_name='is_approved') THEN ALTER TABLE employee_timesheets ADD COLUMN is_approved BOOLEAN DEFAULT FALSE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_timesheets' AND column_name='approved_by') THEN ALTER TABLE employee_timesheets ADD COLUMN approved_by UUID REFERENCES employees(id); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_timesheets' AND column_name='approved_at') THEN ALTER TABLE employee_timesheets ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE; END IF;

    -- PAYROLL SETTINGS: New Overtime Logic
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_payroll_settings' AND column_name='monthly_overtime_threshold_hrs') THEN ALTER TABLE company_payroll_settings ADD COLUMN monthly_overtime_threshold_hrs DECIMAL(10,2) DEFAULT 195.0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_payroll_settings' AND column_name='enable_monthly_overtime') THEN ALTER TABLE company_payroll_settings ADD COLUMN enable_monthly_overtime BOOLEAN DEFAULT TRUE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_payroll_settings' AND column_name='enable_sunday_premium') THEN ALTER TABLE company_payroll_settings ADD COLUMN enable_sunday_premium BOOLEAN DEFAULT TRUE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='company_payroll_settings' AND column_name='enable_holiday_premium') THEN ALTER TABLE company_payroll_settings ADD COLUMN enable_holiday_premium BOOLEAN DEFAULT TRUE; END IF;
END $$;

-- Employee Payroll Adjustments (Tips, Tronc, Allowances, Deductions)
CREATE TABLE IF NOT EXISTS employee_payroll_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    adjustment_type TEXT NOT NULL, -- 'CC Tip', 'Tronc', 'Travel', 'Uniform', 'Meal', 'Deduction', 'Garnishment'
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. SECURITY & VISIBILITY (DEVELOPMENT)
-- ==========================================

-- Seed All 10 Authority Levels with default empty permissions
INSERT INTO authority_levels (level, permissions)
VALUES
    (10, '{}'), (9, '{}'), (8, '{}'), (7, '{}'), (6, '{}'),
    (5, '{}'), (4, '{}'), (3, '{}'), (2, '{}'), (1, '{}')
ON CONFLICT (level) DO NOTHING;

-- Disable RLS for all core tables to ensure frontend visibility during development.
ALTER TABLE IF EXISTS employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_timesheets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_leave DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_warnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklist_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS training_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS training_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS authority_levels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_payroll_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forms_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS department_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_payroll_adjustments DISABLE ROW LEVEL SECURITY;


