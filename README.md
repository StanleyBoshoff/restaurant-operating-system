# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 4: Advanced Intelligence & Enforcement)**

The system has matured into a legally authoritative **Management Command Center** with automated statutory enforcement.

Current focus:
- 🕒 **BCEA Payroll Engine**: Automated 5-hour rule (meal intervals), Sunday 1.5x, and Public Holiday 2.0x multipliers driven by monthly thresholds.
- 📅 **Time & Attendance Hub**: Monthly summary matrix with **Real-Time Autosave**, **Live Clock Terminal sync**, and verification tracking.
- 🛡️ **Security Matrix (10 Levels)**: Inverted hierarchy (Lvl 10 = Master Tech) with full management of all 10 authority levels.
- 🔒 **Leave Enforcement**: Automated blocking of terminal clock-ins during approved leave and read-only protection for terminal records.
- 📈 **Advanced Reporting Suite**: 20+ auditable reports, including **Tardiness Analysis**, **Shift Variance**, and **Labor Cost vs Budget**.
- 💵 **Payroll Export Engine**: One-click data generation for **Pastel Payroll**, **Sage**, and **Xero**.
- 👤 **Comprehensive Profiles**: Digital employee files expanded to match all manual HR forms (Medical, Banking, Spouse, Dependants).

---

# 🛠️ Core Modules

## 1. Time & Attendance (BCEA Automated)
Total synchronization between the tablet terminal and payroll records.
- **Monthly Summary Matrix**: High-level view of monthly Regular Hrs, Overtime, total shifts, and compliance flags per employee.
- **Background Autosave**: Zero-work-loss interaction; data syncs to the cloud instantly as you move between fields.
- **Integrity Protection**: Two-stage "Save Draft vs. Commit" workflow. Once committed, records are locked for management.
- **Premium Calculation**: Smart logic for Sunday 1.5x and Public Holiday 2.0x rates, adhering to monthly overtime thresholds.

## 2. Security & Authority Matrix
A professional, high-density permissions grid for enterprise-grade control.
- **10-Level Hierarchy**: Inverted logic where higher numbers represent higher authority (Lvl 10 = Master Technician).
- **Customizable Toggles**: Enable/Disable system abilities (40+) for each level.
- **Granular Visibility**: Features are physically removed from the UI if a user's level is not authorized, ensuring a clean workspace.

## 3. Labour & Statutory Reporting
Audit-ready data generation for owners, HR, and legal counsel.
- **Labour Analytics**: Tardiness Analysis, Early Departure logs, and Total Hours Worked summaries grouped by department.
- **Variance Tracking**: Scheduled vs. Actual hour comparison and Labor Cost vs. Budget variance.
- **CCMA Bundle**: AWOL audits, 36-month sick cycle exhaustion reports, and Public Holiday lieu ledgers.

## 4. Workforce Operations
- **Connected Calendar**: Unified store availability matrix with continuous leave bars and lane-based vertical slotting.
- **Digital Checklists**: Opening/Closing protocols with mandatory safety items and manager sign-off.
- **Labor Budgeting**: Define monthly hour and cost limits per department to track financial performance.

## 5. Employee Records & Compliance
- **Full Digital Files**: Expanded profiles with collapsable sections for Personal, Address, Family, Medical, and Banking details.
- **Nationality Logic**: Automated prompts for Passport and Expiry details for foreign employees.
- **Dependants Tracking**: Integrated management of employee family details for medical and FR leave context.

---

# 🏗️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL), UUID-based relational model.
- **Calculations**: Custom BCEA Statutory Engine.

---

# 🗄️ Database Deployment

The system uses a blueprint-compliant PostgreSQL schema. For new installations, use:

`supabase_schema.sql` (Located in project root)

> [!IMPORTANT]
> Ensure the `uuid-ossp` extension is enabled in Supabase. The system now uses automated triggers for `shift_date` synchronization and contains an **Idempotent Column Integrity** block for safe updates to existing installations.

---

# 💡 Vision

Restaurise replaces paper files with a legally "Store-Proof" platform. It is designed to work reliably in a busy kitchen while ensuring the restaurant is 100% protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Uploading to GitHub
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "feat: implement Time & Attendance hub, Payroll Export engine, and expanded employee profiles"`
3. **Connect & Push**:
   ```bash
   git push -u origin main
   ```
