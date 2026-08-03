# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 4: Advanced Intelligence & Enforcement)**

The system has matured into a legally authoritative **Management Command Center** with automated statutory enforcement.

Current focus:
- 🕒 **BCEA Payroll Engine**: Automated 5-hour rule (meal intervals), Sunday 1.5x/Double rates, and Public Holiday multipliers.
- 📅 **Integrated Attendance Register**: High-density 21st-20th cycle grid with **Real-Time Autosave** and **Live Clock Terminal sync**.
- 🛡️ **Security Matrix (10 Levels)**: Inverted hierarchy (Lvl 10 = Master Tech) with granular control over 40+ system abilities.
- 🔒 **Leave Enforcement**: Automated blocking of terminal clock-ins during approved leave and read-only protection for terminal records.
- 📈 **CCMA Legal Defense Bundle**: Audit-ready evidence reports (AWOL Audits, Sick Cycle tracking, Operational Density).
- ⚖️ **Legal Shield Disciplinary Engine**: 60% Complete (Expert Registry & Probing active).

---

# 🛠️ Core Modules

## 1. Time & Attendance (BCEA Automated)
Total synchronization between the tablet terminal and payroll records.
- **Smart Monthly Register**: Automatically generates the 21st-20th cycle with weekly aggregates and statutory leave indicators.
- **Background Autosave**: Zero-work-loss interaction; data syncs to the cloud instantly as you move between fields.
- **Integrity Protection**: Two-stage "Save Draft vs. Commit" workflow. Once committed, records are locked for management.
- **Terminal Guard**: High-fidelity records from the tablet are protected from unauthorized manager edits.

## 2. Security & Authority Matrix
A professional, high-density permissions grid for enterprise-grade control.
- **10-Level Hierarchy**: Inverted logic where higher numbers represent higher authority (Lvl 10 = Master Technician).
- **Master Technician (Lvl 10)**: Reserved for setup and bypass-level system maintenance.
- **Granular Visibility**: Features are physically removed from the UI if a user's level is not authorized, ensuring a clean workspace.

## 3. Advanced Statutory Reporting
Audit-ready data generation for owners, HR, and legal counsel.
- **Legal Defense Bundle**: Proof-of-refusal, AWOL audits, and 36-month sick cycle exhaustion reports.
- **Financial Analytics**: Real-time Rand-value Leave Liability reporting and individual Master Statutory Packs.

## 4. Workforce Operations
- **Connected Calendar**: Unified store availability matrix with continuous leave bars and lane-based vertical slotting.
- **Digital Checklists**: Opening/Closing protocols with mandatory safety items and manager sign-off.

## 5. Disciplinary Management (Legal Shield)
- **Annexure "B" Integration**: Fully mapped to 147 official restaurant industry charges.
- **Expert Probing**: Context-aware investigation to build solid procedural evidence.

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
> Ensure the `uuid-ossp` extension is enabled in Supabase. The system now uses automated triggers for `shift_date` synchronization.

---

# 💡 Vision

Restaurise replaces paper files with a legally "Store-Proof" platform. It is designed to work reliably in a busy kitchen while ensuring the restaurant is 100% protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Uploading to GitHub
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "feat: implement advanced payroll engine, autosave attendance, and 10-level security matrix"`
3. **Connect & Push**:
   ```bash
   git push -u origin main
   ```
