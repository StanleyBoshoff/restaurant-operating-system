# Restaurise - Restaurant Operating System (ROS)

A professional-grade, industry-specific Employee Management System (EMS) designed for the South African restaurant and hospitality sector. Built to ensure CCMA compliance, operational efficiency, and a paperless workspace.

---

# 🚀 Project Status

🟢 **Active Development (Phase 2)**

Current focus: 
- ⚖️ **Legal Shield Disciplinary Engine**: A local-first, expert system for drafting bulletproof warnings.
- 📅 **Statutory Leave Management**: Full South African BCEA compliance engine.
- 📂 **Cloud Document Vault**: Secure tracking of certified IDs, passports, and employment contracts.

---

# 🛠️ Core Modules

## 1. Disciplinary Management (Golden Ticket)
The "Legal Shield" is our most advanced feature, acting as an on-demand HR Director.
- **100% Local Engine**: Works offline with zero dependency on cloud AI for drafting.
- **Annexure "B" Integration**: Fully mapped to 147 official restaurant industry charges.
- **Expert Probing**: Context-aware investigation. If a manager types "broke the fryer," the system dynamically asks about SOP training, repair costs, and intent to build a solid legal case.
- **Store-Proof Workflow**: 
    - Authorized issuer dropdown (GM, Chef, etc.).
    - Late scan upload for physical signed copies.
    - Automated WhatsApp consultation notices to staff.
- **Central Registry**: Store-wide command center for monitoring all active warnings.

## 2. Leave Management
Full statutory tracking tailored for South African labor laws.
- **BCEA Compliance**: Real-time calculation of Annual (1.75 days/mo), Sick (3-year cycle), and Family Responsibility leave.
- **Team Availability Hub**: A centralized 30-day calendar showing staff leave and South African public holidays.
- **Approval Workflow**: Integrated request queue for management review.

## 3. Employee Directory & Profiles
The single source of truth for every staff member.
- **Compliance Tracking**: Real-time alerts for missing documents or upcoming passport/permit expiries.
- **Unified Workspace**: Tabs for Details, Documents, Warnings, Timesheets, and Performance.

---

# 🏗️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL), Supabase Storage.
- **Legal Engine**: Local Logic + Narrative Generator (Hardcoded with South African Disciplinary Standards).
- **Security**: Row Level Security (RLS) for sensitive personnel data.

---

# 📂 Project Structure

```
frontend/src/
  ├── components/
  │   ├── disciplinary/   # Store-wide incident command center
  │   ├── leave/          # Statutory leave & team calendar
  │   ├── profile/        # Employee-level detailed tabs
  │   └── common/         # Reusable UI (SummaryCards, Badges)
  ├── utils/
  │   ├── disciplinaryEngine.js  # The "Brain" (Logic & Probes)
  │   ├── leaveEngine.js         # BCEA calculation logic
  │   └── notificationService.js # Dispatch simulation (WhatsApp/Email)
  └── supabaseClient.js  # Database connectivity
```

---

# 💡 Vision

Restaurise replaces paper files and guesswork with a legally authoritative platform. It is designed to be **"Store-Proof"**—working reliably in the high-pressure environment of a busy kitchen while ensuring the restaurant is protected at the CCMA.

---

# ☁️ Deployment (GitHub)

### Prerequisites
- Install [Git](https://git-scm.com/)
- A GitHub account

### Uploading to GitHub
1. **Initialize Git**: `git init`
2. **Add Files**: `git add .`
3. **Commit**: `git commit -m "feat: implement professional disciplinary engine and BCEA leave module"`
4. **Create Repository**: Go to GitHub.com and create a new repository called `ros-restaurant-system`.
5. **Connect & Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ros-restaurant-system.git
   git branch -M main
   git push -u origin main
   ```
