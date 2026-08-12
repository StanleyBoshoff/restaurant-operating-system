# Walkthrough: Professional Authentication & Authority Control

I have implemented a full-scale authentication system for Restaurise, featuring a corporate login screen, automated employee onboarding, and a permission-locked sidebar.

## Key Accomplishments

### 1. Professional Login Interface
- Created a high-density, professional login screen using **Slate & Yellow-600** branding.
- Features secure session handling and error state feedback.
- [Login.jsx](file:///C:/Users/stanl/Desktop/rems/frontend/src/components/Login.jsx)

### 2. Global Auth & Security Engine
- Implemented `AuthContext` to manage sessions and fetch employee authority levels globally.
- Wired the `Sidebar` to physically remove modules if the user lacks sufficient permission levels.
- [AuthContext.jsx](file:///C:/Users/stanl/Desktop/rems/frontend/src/context/AuthContext.jsx)
- [permissionService.js](file:///C:/Users/stanl/Desktop/rems/frontend/src/utils/permissionService.js)

### 3. Automated Onboarding (BETA)
- Updated the "Add Employee" form to trigger a Supabase Auth invitation email immediately upon saving a new record.
- [AddEmployeeForm.jsx](file:///C:/Users/stanl/Desktop/rems/frontend/src/components/AddEmployeeForm.jsx)

---

## 🛠️ Your Action Required (Setup Guide)

To activate the system for your account, please follow these steps:

### Step A: Enable Email Templates
1. Go to your **Supabase Dashboard** -> **Authentication** -> **Email Templates**.
2. Select the **Invite User** template.
3. Paste the contents of [invite_email_template.html](file:///C:/Users/stanl/Desktop/rems/setup/invite_email_template.html) into the HTML body.

### Step B: Setup Superadmin Account
1. Open the **SQL Editor** in Supabase.
2. Run the script found in [setup_superadmin.sql](file:///C:/Users/stanl/Desktop/rems/setup/setup_superadmin.sql).
3. In the Supabase Dashboard, go to **Authentication** -> **Users** -> **Invite User** and enter `stanleyboshoff@gmail.com`.

### Step C: Password Link
Once you receive the email from Step B, click the link to set your password. You will then be able to log in to the "Command Center" with Level 10 permissions.

---

## 🧪 Testing the 10 Levels of Authority
To test different levels, you can edit an employee's role in the system:
1. Log in as Superadmin.
2. Go to **Settings** -> **Positions**.
3. Edit a role (e.g., "Waiter") and change the **Authority Level** (1-9).
4. The sidebar and accessible modules for any staff member with that role will automatically update.
