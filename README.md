# Restaurise

## Restaurant Employee Management System (REMS)

A modern cloud-based Employee Management System built specifically for the restaurant and hospitality industry.

Restaurise centralizes employee management, scheduling, workforce administration, compliance, training, documentation and operational workflows into a single platform.

---

# Project Status

🚧 Active Development (Phase 1)

Current focus:

- Core application framework
- Employee Management Module
- Navigation architecture
- Supabase database design
- Modular system foundation

---

# Vision

Create a scalable Restaurant Employee Management System that replaces paper files, spreadsheets and disconnected HR tools with one integrated platform.

The application is designed around **modules**, allowing multiple developers to work independently while maintaining a consistent user experience.

---

# Technology Stack

## Frontend

- React
- Vite
- TailwindCSS

## Backend

- Supabase
- PostgreSQL
- Supabase Storage
- Row Level Security (RLS)

---

# Application Architecture

The application follows a modular workspace architecture.

```
Sidebar
    ↓
Module
    ↓
Overview
    ↓
Tabs
    ↓
Workspace
```

Every major module follows the same layout.

Example:

```
Employees

    Overview

    Details

    Employment

    Documents

    Leave

    Attendance

    Timesheets

    Warnings

    Performance

    Training

    Tasks

    Notes

    Audit Log
```

This architecture keeps navigation consistent throughout the application.

---

# Current Modules

## Dashboard

Management overview containing company-wide statistics and alerts.

Status:

🟡 In Development

---

## Employees (Module 1)

The core of the application.

Handles everything related to individual employees.

### Tabs

- Overview
- Details
- Employment
- Documents
- Leave
- Attendance
- Timesheets
- Warnings
- Performance
- Training
- Tasks
- Notes
- Audit Log

Status:

🟢 Active Development

---

## Planned Modules

The following modules have been approved and the framework is being prepared.

### Scheduling

Manage weekly rosters, availability and shift templates.

### Timesheets

Employee clock-in, overtime, payroll exports and labour reporting.

### Leave

Leave requests, balances and approvals.

### Training

Courses, assessments, certificates and knowledge base.

### Tasks

Assign and track operational tasks.

### Checklists

Opening, closing and operational checklists.

### Forms

Digital forms including incidents, maintenance and inspections.

### Health & Safety

Incident management and workplace safety.

### Communication

Announcements, policies and internal communication.

### Reports

Operational and HR reporting.

### Settings

Company configuration.

- Users
- Roles
- Permissions
- Branches
- Departments
- Positions
- Leave Types
- Warning Types
- Document Categories

---

# Project Structure

```
src/

components/
    Dashboard/
    Employees/
    Scheduling/
    Timesheets/
    Leave/
    Training/
    Tasks/
    Checklists/
    Forms/
    HealthSafety/
    Communication/
    Reports/
    Settings/

shared/

hooks/

services/

utils/
```

Each module is self-contained to support parallel development.

---

# Design Principles

- Employee-first architecture
- Modular development
- Restaurant-specific workflows
- Reusable components
- Scalable database design
- Mobile responsive
- Multi-branch ready
- Cloud native
- AI-ready

---

# Current Development Phase

## Phase 1

✅ Application Shell

✅ Sidebar Navigation

✅ Employee Workspace

✅ Supabase Integration

✅ Responsive Layout

🚧 Employee Module

🚧 Database Expansion

---

# Upcoming Development

- Scheduling
- Timesheets
- Leave Management
- Training
- Tasks
- Forms
- Checklists
- Reports
- Settings

---

# Development Standards

Every new module must include:

- Overview page
- Tab-based navigation
- Shared layout
- Reusable components
- Role-based permissions
- Responsive design
- Supabase integration

---

# Long-Term Goal

Build the leading Restaurant Employee Management System for the hospitality industry.

The system should become the single source of truth for every employee by centralizing:

- Employee records
- Documents
- Compliance
- Scheduling
- Leave
- Attendance
- Performance
- Training
- Operational tasks
- Reporting

into one integrated cloud platform.
