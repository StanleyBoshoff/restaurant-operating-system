# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 3: Workforce Operations)**

The system has transitioned from a data collection tool to a functional **Management Command Center** with real-time operational insights.

Current focus:
- 🕒 **Time & Attendance Engine**: Functional Live Clocking Terminal and Weekly Attendance Matrix.
- 📋 **Operational Checklists**: Digital store-readiness protocols (Opening/Closing) with manager sign-off.
- 💰 **Financial Reconciliation**: Daily Cash-Up and Petty Cash tracking logs.
- 📈 **Strategic Analytics**: Real-time dashboard stats for labour cost, on-duty staff, and compliance risks.
- ⚖️ **Legal Shield Disciplinary Engine**: 60% Complete (Expert Registry & Probing active).
- 📅 **Statutory Leave Management**: 80% Complete (BCEA calculations active).

---

# 🛠️ Core Modules

## 1. Disciplinary Management (Legal Shield)
The "Legal Shield" is our most advanced feature, acting as an on-demand HR Director.
- **100% Local Engine**: Works offline with zero dependency on cloud AI for drafting.
- **Annexure "B" Integration**: Fully mapped to 147 official restaurant industry charges.
- **Expert Probing**: Context-aware investigation build a solid legal case.
- **Central Registry**: Store-wide command center for monitoring all active warnings.

## 2. Workforce Operations
Real-time tracking of staff and store readiness.
- **Live Clock Terminal**: Tablet-friendly interface for staff clock-in/out and break recording.
- **Weekly Matrix**: Manager-level grid for reviewing hours, overtime, and punctuality.
- **Digital Checklists**: Opening and Closing protocols with mandatory safety items (Gas, Security, Cleanup).

## 3. Financial & Admin Forms
Moving store administration from paper to the cloud.
- **Cash-Up Log**: Daily reconciliation of POS sales, Card EFT, and Payouts with real-time discrepancy alerts.
- **Incident Registry**: Formal record-keeping for safety, security, or guest events for insurance/CCMA audits.

## 4. Training & Communication
- **Curriculum Management**: Assign and track mandatory SOP training (BCEA, HACCP, Food Safety).
- **Broadcast Feed**: Targeted internal store communications with read-receipt tracking.

## 5. Employee Directory & Profiles
- **UUID Architecture**: Professional, enterprise-grade database structure for multi-branch scalability.
- **Compliance Tracking**: Real-time alerts for expiring work permits, passports, and missing mandatory documents.

---

# 🏗️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL), UUID-based relational model.
- **Analytics**: Custom-built `reportingService` for operational business intelligence.

---

# 📂 Project Structure

```
frontend/src/
  ├── components/
  │   ├── disciplinary/   # Legal Shield command center
  │   ├── leave/          # Statutory leave & calendar
  │   ├── timesheets/     # Live clock & weekly matrix
  │   ├── checklists/     # Opening/Closing protocols
  │   ├── forms/          # Cash-Up & Incident logs
  │   ├── training/       # Curriculum & assessments
  │   ├── communication/  # Broadcast & receipts
  │   └── reports/        # Analytics & business intelligence
  ├── utils/
  │   ├── reportingService.js    # The Intelligence Brain
  │   ├── timesheetService.js    # Attendance logic
  │   ├── disciplinaryEngine.js  # Legal expert logic
  │   └── leaveEngine.js         # BCEA calculation logic
  └── supabaseClient.js  # Database connectivity
```

---

# 🗄️ Database Deployment

The system is powered by a blueprint-compliant PostgreSQL schema. For new client installations or environment resets, use the provided master script:

`supabase_schema.sql` (Located in project root)

> [!IMPORTANT]
> The database uses **UUIDs** for all identifiers. When deploying, ensure the `uuid-ossp` extension is enabled in Supabase.

---

# 💡 Vision

Restaurise replaces paper files and guesswork with a legally authoritative platform. It is designed to be **"Store-Proof"**—working reliably in the high-pressure environment of a busy kitchen while ensuring the restaurant is protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Uploading to GitHub
1. **Stage Changes**: `git add .`
2. **Commit**: `git commit -m "feat: implement Phase 3 Operations and Phase 4 Analytics with UUID architecture"`
3. **Connect & Push**:
   ```bash
   git push -u origin main
   ```
