# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 4: Advanced Reporting & Intelligence)**

The system has matured from a data collection tool into a powerful **Management Command Center** and **Legal Defense Platform**.

Current focus:
- 🛡️ **CCMA Legal Defense Bundle**: Specialized high-stakes reporting (AWOL Audits, Refusal Proof, 3-Year Sick Cycle Tracking).
- 🏛️ **Dynamic Hierarchy Engine**: 6-level authority system (Admin to Staff) with granular permissions and departmental isolation.
- 📈 **Full Statutory Reporting Suite**: 17+ automated reports including Leave Liability (Rand-value), TOIL Balances, and Medical Certificate Logs.
- 🕒 **Workforce Operations**: Live Clocking Terminal, Weekly Attendance Matrix, and Digital Store-Readiness Checklists.
- ⚖️ **Legal Shield Disciplinary Engine**: 60% Complete (Expert Registry & Probing active).
- 📅 **Statutory Leave Management**: 90% Complete (Connected Calendar, Individual Master Packs, and BCEA logic active).

---

# 🛠️ Core Modules

## 1. Hierarchy & Access Control (New)
Enterprise-grade security architecture for multi-branch scalability.
- **6-Level Authority**: Defined roles from Admin (Lvl 1) to Staff (Lvl 6).
- **Granular Permissions**: Matrix-based control over sensitive data like salary, disciplinary records, and system settings.
- **Reporting Chain**: Live organizational chart linking staff to direct managers for departmental isolation.

## 2. Advanced Statutory Reporting
Audit-ready data generation for owners, HR, and legal counsel.
- **Legal Defense Bundle**: Specialized templates to protect the business at the CCMA (AWOL Audits, Sick Cycle Progress).
- **Financial Analytics**: Real-time Rand-value Leave Liability reporting and Labour Cost metrics.
- **Individual Master Packs**: One-click generation of a staff member's entire statutory history and balances.
- **Custom Builder**: Bespoke report generation with multi-parameter filtering and CSV export.

## 3. Workforce Operations
Real-time tracking of staff and store readiness.
- **Live Clock Terminal**: Tablet-optimized interface for clock-in/out and break management.
- **Connected Calendar**: Unified store availability matrix with continuous leave bars and lane-based vertical slotting.
- **Digital Checklists**: Opening/Closing protocols with mandatory safety items and manager sign-off.

## 4. Disciplinary Management (Legal Shield)
The "Legal Shield" acting as an on-demand HR Director.
- **Annexure "B" Integration**: Fully mapped to 147 official restaurant industry charges.
- **Expert Probing**: Context-aware investigation to build solid procedural evidence.
- **Central Registry**: Store-wide command center for monitoring all active warnings.

## 5. Employee Directory & Profiles
- **UUID Architecture**: Professional relational model for high-integrity data management.
- **Compliance Tracking**: Real-time alerts for expiring permits, passports, and missing mandatory documents.

---

# 🏗️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL), UUID-based relational model.
- **Analytics**: Custom-built `reportingService` for operational business intelligence.

---

# 🗄️ Database Deployment

The system is powered by a blueprint-compliant PostgreSQL schema. For new installations or environment resets, use the stable idempotent script:

`supabase_schema.sql` (Located in project root)

> [!IMPORTANT]
> The database uses **UUIDs** for all identifiers. Ensure the `uuid-ossp` extension is enabled in Supabase before deployment.

---

# 💡 Vision

Restaurise replaces paper files and guesswork with a legally authoritative platform. It is designed to be **"Store-Proof"**—working reliably in the high-pressure environment of a busy kitchen while ensuring the restaurant is protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Uploading to GitHub
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "feat: implement individual reporting, CCMA defense bundle, and dynamic hierarchy"`
3. **Connect & Push**:
   ```bash
   git push -u origin main
   ```
