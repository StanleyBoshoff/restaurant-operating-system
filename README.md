# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 5: Real-Time Security & Enterprise Scale)**

The system has matured into a legally authoritative **Management Command Center** with automated statutory enforcement and real-time security synchronization.

Current focus:
- 🛡️ **Security Matrix (11 Levels)**: Granular, 11-level hierarchy where Level 11 (System Administrator) is a hidden master account, and Level 10 down to 1 are fully customizable via the UI.
- ⚡ **Real-Time Sync (The Pulse)**: Instant application-wide permission updates. Changing a "tick" in the master matrix immediately reflects in all active browser sessions without logout or refresh.
- 🕒 **BCEA Payroll Engine**: Automated 5-hour rule (meal intervals), Sunday 1.5x, and Public Holiday 2.0x multipliers driven by monthly thresholds.
- 📅 **Time & Attendance Hub**: Monthly summary matrix with **Real-Time Autosave**, **Live Clock Terminal sync**, and verification tracking.
- 📈 **Advanced Reporting Suite**: 20+ auditable reports, including **Tardiness Analysis**, **Shift Variance**, and **Labor Cost vs Budget**.
- 💵 **Payroll Export Engine**: One-click data generation for **Pastel Payroll**, **Sage**, and **Xero**.
- 👤 **Pure Database Architecture**: 100% production-ready logic with no hardcoded bypasses. All profiles, permissions, and auth sessions are driven strictly by Supabase.

---

# 🛠️ Core Modules

## 1. Security & Authority Matrix (Pure Data-Driven)
A professional, high-density permissions grid for enterprise-grade control.
- **11-Level Hierarchy**: Inverted logic where higher numbers represent higher authority.
- **Hidden System Admin (Lvl 11)**: A master account protected from UI-based changes to ensure system stability.
- **Live Reactivity**: Permissions are physically removed from the UI the moment they are unticked in the database.
- **Granular Directory Visibility**: Specify exactly which levels of staff a user is allowed to view (e.g., Owner can see everyone, Waiter can see nobody).

## 2. Time & Attendance (BCEA Automated)
Total synchronization between the tablet terminal and payroll records.
- **Monthly Summary Matrix**: High-level view of monthly Regular Hrs, Overtime, total shifts, and compliance flags.
- **PIN-Based Terminal**: Dedicated 5-digit high-density clocking terminal with seconds-accurate tracking.
- **Background Autosave**: Zero-work-loss interaction; data syncs to the cloud instantly.
- **Premium Calculation**: Smart logic for Sunday 1.5x and Public Holiday 2.0x rates.

## 3. Labour & Statutory Reporting
Audit-ready data generation for owners, HR, and legal counsel.
- **Labour Analytics**: Tardiness Analysis, Early Departure logs, and Total Hours Worked summaries.
- **Variance Tracking**: Scheduled vs. Actual hour comparison and Labor Cost vs. Budget variance.
- **CCMA Bundle**: AWOL audits, 36-month sick cycle exhaustion reports, and Public Holiday lieu ledgers.

## 4. Workforce Operations
- **Connected Calendar**: Unified store availability matrix with continuous leave bars.
- **Digital Checklists**: Opening/Closing protocols with mandatory safety items and manager sign-off.
- **Labor Budgeting**: Define monthly hour and cost limits per department.

---

# 🏗️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL), Realtime Broadcast Channels.
- **Infrastructure**: Row Level Security (RLS), Postgres Triggers for cross-table permission syncing.

---

# 🗄️ Database Deployment

The system uses a blueprint-compliant PostgreSQL schema. For new installations, use:

1. `supabase_schema.sql` (Core Tables)
2. `setup/activate_sync_trigger.sql` (Permission Sync Pipe)

> [!IMPORTANT]
> Ensure **Realtime** is enabled on the `authority_levels` table in Supabase to support the instant permission "Pulse" functionality.

---

# 💡 Vision

Restaurise replaces paper files with a legally "Store-Proof" platform. It is designed to work reliably in a busy kitchen while ensuring the restaurant is 100% protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Uploading to GitHub
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "feat: implement 11-level hierarchy, real-time matrix sync, and production auth cleanup"`
3. **Push to Remote**:
   ```bash
   git push origin main
   ```
