-- Restaurise REMS - Master Supabase Schema (UUID Edition)
-- Generated: 2026-08-01
-- This file provides a clean-slate deployment script.

-- ==========================================
-- 0. CLEANUP & EXTENSIONS
-- ==========================================

-- !!! WARNING: DROPPING TABLES WILL DELETE ALL DATA !!!
-- We must drop the old tables to convert BIGINT columns to UUID.
DROP TABLE IF EXISTS announcement_reads CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS forms_submissions CASCADE;
DROP TABLE IF EXISTS checklist_submissions CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS disciplinary_knowledge CASCADE;
DROP TABLE IF EXISTS employee_warnings CASCADE;
DROP TABLE IF EXISTS employee_documents CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS employee_leave CASCADE;
DROP TABLE IF EXISTS employee_timesheets CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CORE FOUNDATION
-- ==========================================

-- Roles / Job Titles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    classification TEXT, -- e.g., FOH, BOH, Management
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT REFERENCES roles(role_name),
    branch TEXT,
    department TEXT,
    employment_type TEXT, -- Full Time, Part Time, Casual, Contract
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
CREATE TABLE employee_timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    branch_id TEXT,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Active', -- Active, On Break, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statutory Leave
CREATE TABLE employee_leave (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL, -- Annual, Sick, Family Responsibility, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days_requested INTEGER,
    total_statutory_days_deducted DECIMAL(5,2),
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Kitchen, Front of House, Cleaning
    priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
    assigned_to_id UUID REFERENCES employees(id),
    assigned_to_dept TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- Daily, Weekly
    status TEXT DEFAULT 'Open', -- Open, In Progress, Completed, Overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. COMPLIANCE & HR
-- ==========================================

-- Document Vault
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- Passport, ID, Work Permit, Contract
    file_url TEXT NOT NULL,
    expiry_date DATE,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disciplinary (Legal Shield)
CREATE TABLE employee_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    warning_level TEXT NOT NULL, -- Verbal, Written, Final, Dismissal
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    issued_by TEXT,
    file_url TEXT, -- Signed copy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Learning (Knowledge Base)
CREATE TABLE disciplinary_knowledge (
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
CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Opening, Closing, Cleaning
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    sort_order INTEGER
);

-- Form Submissions (Incident, CashUp, TempLog, Maintenance)
CREATE TABLE forms_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type TEXT NOT NULL,
    submitted_by UUID REFERENCES employees(id),
    data JSONB, -- Dynamic fields based on form_type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. KNOWLEDGE & COMMUNICATION
-- ==========================================

-- Broadcast Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    target_audience TEXT DEFAULT 'All Staff',
    author TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training
CREATE TABLE training_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'Elective', -- Mandatory, Elective
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. SYSTEM
-- ==========================================

CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
