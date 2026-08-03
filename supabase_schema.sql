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
    authority_level INTEGER DEFAULT 6,
    permissions JSONB DEFAULT '{
        "can_access_settings": false,
        "can_view_salary": false,
        "can_manage_disciplinary": false,
        "can_approve_leave": false,
        "can_view_all_staff": false
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role_id UUID REFERENCES roles(id),
    role TEXT,
    reports_to_id UUID REFERENCES employees(id),
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
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    employee_id UUID REFERENCES employees(id),
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
END $$;
