# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 5: Masterclass Studio, Task Archival Hub & Enterprise Scale)**

The system has matured into a legally authoritative **Management Command Center** with automated statutory enforcement, configurable payroll engines, real-time security synchronization, interactive masterclass training modules, and robust task archival inspection suites.

Current focus:
- 📋 **Archived Tasks Hub**: Advanced task audit interface featuring sub-tabs for **All**, **Completed**, **Incomplete**, and **Not done**, with distinct green checkmark badges (`CheckCircle2`) and red cross icon badges (`XCircle`).
- 🔗 **Precise Task-to-Submission Linkage**: Direct relational mapping (`task_id`) ensuring every completed task instance opens its exact unique checklist verification report and protocol inspection log.
- 🪄 **Masterclass Studio (Course Creator)**: Interactive curriculum builder with modal-based Create & Edit workflows, flexible step builders (video lessons, study flashcards, and assessment quizzes).
- 👤 **Per-Profile Training & Certification Tracking**: Training progress and certification status strictly scoped to each employee's unique `employee_id` in Supabase and local storage (`rems_training_progress_${employee.id}`).
- 🎯 **Target Audience Filtering**: Role and department checkboxes (Waiters, Bartenders, Kitchen Staff, etc.) ensuring courses are assigned strictly to relevant personnel.
- 🔀 **Anti-Cheat Quiz Randomizer Engine**: Dynamically shuffles question order and answer option positions (A, B, C, D) on every single test run to prevent cheating and memorization with a strict **90% pass threshold**.
- 📖 **Answer Review Mode**: Trainees can review their completed assessment submissions, inspect correct solutions, and learn from feedback before retaking.
- 🛡️ **Security Matrix (11 Levels)**: Granular, 11-level hierarchy where Level 11 (System Administrator) is a hidden master account, and Level 10 down to 1 are fully customizable via the UI.
- ⚡ **Real-Time Sync (The Pulse)**: Instant application-wide permission updates. Changing a "tick" in the master matrix immediately reflects in all active browser sessions without logout or refresh.
- 🕒 **Configurable Payroll Calendar Cycle**: Full support for store-specific pay cycles (default: **21st to 20th**, or customizable from 1st to 28th). Cross-month cycles automatically synchronize across all timesheets, monthly registers, summaries, and exports.
- ⏱️ **Monthly Overtime Engine (195-Hour Standard)**: Statutory overtime calculated strictly against total monthly hours (default norm of **195.0 hours**). Eliminates improper daily or weekly overtime deductions so that only hours accumulated above 195h in the pay cycle count as overtime.
- 📅 **Dual-Mode Time & Attendance Register**:
  - **Typing-Optimized Auto-Jump**: 4-digit auto-formatting (e.g., `0800` $\rightarrow$ `08:00`) with seamless auto-jumping directly between time fields.
  - **Integrated Clock Pickers**: Interactive clock icon pickers positioned at the beginning of Start Time and at the end of End Time for mouse users, with sequential keyboard `Tab` navigation.
- 📊 **Monthly Attendance Summary**: Real-time workforce summary that dynamically mirrors the active pay cycle date range, accurately displaying Regular Hours (up to 195h), Overtime (above 195h), total shifts, and verification statuses.
- 📈 **Advanced Reporting Suite**: 20+ auditable reports, including **Tardiness Analysis**, **Shift Variance**, **Overtime Tracking**, and **Labor Cost vs. Budget**.
- 💵 **Payroll Export Engine**: One-click data generation for **Pastel Payroll**, **Sage**, and **Xero**, pre-aligned with the store's active payroll cycle.
- 👤 **Pure Database Architecture**: 100% production-ready logic with no hardcoded bypasses. All profiles, permissions, and auth sessions are driven strictly by Supabase with resilient local caching.

---

# 🛠️ Core Modules

## 1. Security & Authority Matrix (Pure Data-Driven)
A professional, high-density permissions grid for enterprise-grade control.
- **11-Level Hierarchy**: Inverted logic where higher numbers represent higher authority.
- **Hidden System Admin (Lvl 11)**: A master account protected from UI-based changes to ensure system stability.
- **Live Reactivity**: Permissions are physically removed from the UI the moment they are unticked in the database.
- **Granular Directory Visibility**: Specify exactly which levels of staff a user is allowed to view (e.g., Owner can see everyone, Waiter can see nobody).

## 2. Time & Attendance Hub (BCEA & Pay Cycle Automated)
Total synchronization between the tablet terminal and payroll records.
- **Configurable Pay Cycles**: Set under **Settings > Payroll Engine**. Accommodates industry-standard 21st-to-20th cycles or calendar-month cycles with automatic cross-month date calculations.
- **Monthly Summary Matrix**: Real-time aggregation of pay cycle Regular Hours, Overtime, auto-exits, and verification progress.
- **Hybrid Input System**: Supports rapid numeric keypad entry with auto-colon formatting and automatic focus jumping, alongside clickable native time pickers for mouse users.
- **Monthly 195h Overtime Protocol**: Overtime triggers only after accumulating standard monthly hours (configurable, 195h default).
- **Automated Meal Intervals**: Automatic 5-hour rule break deduction with customizable threshold and duration.
- **PIN-Based Terminal**: Dedicated 5-digit high-density clocking terminal with seconds-accurate tracking.
- **Background Autosave**: Zero-work-loss interaction; data syncs to the cloud instantly.

## 3. Training & Masterclass Studio
Comprehensive learning and development ecosystem for restaurant staff.
- **Masterclass Studio (Course Creator)**: Tabular management view with modal-based Create & Edit popup workflows.
- **Flexible Curriculum Builder**: Combine video lessons, study flashcards (front/back definition decks), and assessment quizzes into any custom course.
- **Target Audience Role Filtering**: Restrict courses to specific roles (Waiters, Bartenders, Chefs, Kitchen Staff, etc.).
- **Per-Profile Tracking**: Training progress and certifications stored individually per employee profile (`employee_id`).
- **Anti-Cheat Quiz Randomizer Engine**: Automatically shuffles question order and answer option positions (A, B, C, D) on every run.
- **90% Pass Threshold & Review Mode**: Enforces professional standards with percentage scoring, clear pass/fail results, and interactive answer review walkthroughs.

## 4. Tasks & Archived Audit Hub
Complete oversight of operational compliance and historical logs.
- **Archived Tasks Sub-Tabs**: Filter history by **All**, **Completed**, **Incomplete**, and **Not done**.
- **Precise Report Inspection**: Direct task-to-submission relational mapping (`task_id`) ensuring each task instance loads its exact verification report.

## 5. Labour & Statutory Reporting
Audit-ready data generation for owners, HR, and legal counsel.
- **Cycle-Aware Reports**: Reports automatically initialize to the store's active payroll cycle period.
- **Labour Analytics**: Tardiness Analysis, Early Departure logs, and Total Hours Worked summaries.
- **Variance Tracking**: Scheduled vs. Actual hour comparison and Labor Cost vs. Budget variance.
- **CCMA Bundle**: AWOL audits, 36-month sick cycle exhaustion reports, and Public Holiday lieu ledgers.

---

# 🏗️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL), Realtime Broadcast Channels.
- **Infrastructure**: Row Level Security (RLS), Postgres Triggers for cross-table permission syncing.

---

# 🗄️ Database Deployment

The system uses a blueprint-compliant PostgreSQL schema. For new installations or upgrades, use:

1. `supabase_schema.sql` (Master Core Tables & Migrations)
2. `setup/add_payroll_cycle_column.sql` (Payroll Cycle Start Day Migration)
3. `setup/activate_sync_trigger.sql` (Permission Sync Pipe)

> [!IMPORTANT]
> Ensure **Realtime** is enabled on the `authority_levels` table in Supabase to support the instant permission "Pulse" functionality.

---

# 💡 Vision

Restaurise replaces paper files with a legally "Store-Proof" platform. It is designed to work reliably in a busy kitchen while ensuring the restaurant is 100% protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Uploading to GitHub
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "feat: update README with Masterclass Studio, Task Archival Hub, and per-profile training tracking"`
3. **Push to Remote**:
   ```bash
   git push origin main
   ```
