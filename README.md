# Restaurise - Restaurant Operating System (ROS)

A responsive, enterprise-grade cloud administrative console optimized for restaurant management operations, human resources tracking, compliance checklists, and incident reporting.

## 🏗️ Project Architecture Layout

The application platform levarages a modular, station-isolated micro-frontend architecture layout structure:

- `App.jsx` - The Master Command Center
- `src/components/Sidebar.jsx` - Left-hand administrative system navigation hub drawer control module.
- `src/components/dashboard.jsx` - Central status command center interface viewport console display workspace.
- `src/components/Sidebar.jsx` - Left-hand administrative system navigation hub drawer control module.

## 🎨 Visual Identity Settings

- **Foundations**: Cool slate grays (`bg-slate-900`, `bg-slate-50`)
- **Highlights**: Deep corporate luxury gold-brass tones (`text-yello-600`)

## ⚙️ Core Operational Workflows

- **State Module Switchboard**: `App.jsx` manages the active workspace tracking using `currentModule` state memory variables. Clicking menu buttons inside `Sidebar.jsx` fires callback triggers that instantly swap the central display floor plan.

- **State Module Switchboard**: Fully operational. The system successfully monitors active tabs and uses conditional micro-frontend selectors (`&&`) to clear the old workspace and slide the correct panel onto the floor plan instantly.

- **Live Cloud Data Streaming**: Fully operational. The system successfully leverages an `async/await` pipeline inside `EmployeeDirectory.jsx` paired with automatic `useEffect` hooks to pull, verify, and render live corporate personnel data rows from the remote PostgreSQL schema table.
