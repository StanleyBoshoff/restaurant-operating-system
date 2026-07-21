# Restaurise - Restaurant Operating System (ROS)

A responsive, enterprise-grade cloud administrative console optimized for restaurant management operations, human resources tracking, labor compliance checklists, and real-time operational incident reporting.

## 🏗️ Project Architecture Layout

The application platform leverages a modular, station-isolated micro-frontend architecture layout structure:

- `src/App.jsx` - Global layout shell managing navigation states, mobile responsive toggles, and localized persistent tracking.
- `src/components/Sidebar.jsx` - Dual-state left-hand navigation hub (collapses from wide menu into a compact icon-only utility rail).
- `src/components/Dashboard.jsx` - Management Command Center main viewport display dashboard console.
- `src/components/EmployeeDirectory.jsx` - Personnel database table handling global employee data arrays, search parameters, and localized role queries.
- `src/components/AddEmployeeForm.jsx` - Floating frosted-glass overlay modal popup handling database write entry operations.
- `src/components/EmployeeProfile.jsx` - Master personnel view managing active workspace sub-tabs and context navigation hooks.
- `src/components/profile/TabDetails.jsx` - Isolated module handling secure employee profile inline data modifications.
- `src/components/profile/TabDocuments.jsx` - Isolated digital vault view staging file storage items.
- `src/components/profile/TabWarnings.jsx` - Isolated system layout rendering compliance records and disciplinary histories.
- `src/components/DocumentTracker.jsx` - Isolated digital vault console module handling file cloud bucket retrieval streams.

## 🎨 Visual Identity Settings

- **Structural Foundations**: Deep neutral slates and clean greys (`bg-slate-900`, `bg-slate-950`, `bg-slate-50`)
- **Operational Highlights**: High-end corporate luxury metallic gold-brass hues (`text-yellow-600`, `bg-yellow-600`)

## ⚙️ Core Operational Workflows

- **State Module Switchboard**: `App.jsx` actively monitors user selection states using `currentModule`. Clicking navigation button slots inside `Sidebar.jsx` triggers backward callbacks that clear the pass and drop the correct station onto the layout instantly using conditional short-circuits (`&&`).
- **Dual-State Responsiveness**: Features a smart, fluid layout. Desktop viewports toggle seamlessly between wide and narrow stance footprints. Mobile viewports collapse the sidebar completely off-screen (`-translate-x-full`) and render an interactive top navigation bar with a responsive Hamburger Button trigger.
- **Live Cloud Data Streaming (CRUD-Read)**: Connects directly via background pipelines to remote Supabase PostgreSQL servers. Leverages asynchronous `async/await` runners paired with automatic `useEffect` lifecycle hooks to fetch database arrays and render live staff rows cleanly across spreadsheet column frameworks.
- **Cloud Transaction Ingestion (CRUD-Write)**: Uses a secure, overlay form modal to capture system inputs. It isolates local input states (`formData`), filters optional data columns, and pipes form data records up to the server using the `supabase.from().insert()` transaction framework.
- **Dynamic Data Validation Inputs**: Completed. Upgraded text-line data input entries into a strict database-mapped `<select>` dropdown menu filter loop, preventing layout typos and ensuring personnel profiles align perfectly with company-defined position structures.
- **Targeted Record Erasure (CRUD-Delete)**: Fully operational. Table rows inside `EmployeeDirectory.jsx` feature localized record deletion buttons that pass distinct UUID identifiers to an asynchronous `handleDeleteEmployee` function loop wrapper. The pipeline executes targeted `.delete().eq()` surgical queries to drop specific records from the PostgreSQL shelf live.
- **Active Session Preservation (Persistence)**: Completed. Replaced standard ephemeral component state with browser-native `localStorage` initialization queues inside `App.jsx` and `EmployeeProfile.jsx`. Tapping navigational channels triggers reactive synchronization blocks that write active tracking metrics to the device's persistent cache disk, ensuring browser refreshes retain active workspace layout frames and sub-tab states.
- **Surgical Profile Modification (CRUD-Update)**: Fully operational. Upgraded `AddEmployeeForm.jsx` into a versatile dual-state panel that intercepts incoming state components. On submission, the function checks the active state context to execute targeted database updates via the `supabase.from().update().eq()` transaction protocol cleanly.
- **Dynamic Icon Rail Mapping**: Completed. Replaced temporary placeholder bullet primitives inside `Sidebar.jsx` with full object-destructured `lucide-react` icon components passed down via navigation array props.
- **Real-Time Roster Filtering**: Completed. Wired localized text-tracking state inputs (`searchTerm`) into `EmployeeDirectory.jsx`. Re-routed data mapping channels through a localized `.filter()` array queue to intercept database cache arrays, enabling instantaneous client-side query matches on worker names and roles.
- **Isolated Profile Tab Staging Workspace**: Fully operational. Built separate, modular tab panes (`TabDetails`, `TabDocuments`, `TabWarnings`) within `EmployeeProfile.jsx` to separate view logic and simplify future features.
- **Secure Inline Core Modifiers**: Fully operational. Connected `TabDetails.jsx` directly to the Supabase database engine, transforming static listings into editable forms. It validates positions using the `dbRoles` array data structure to prevent data mismatch errors during profile edits.
- **Private File Vault & Binary Compliance Track**: Fully operational. Implemented binary file uploads to private Supabase Storage buckets linked directly to an `employee_documents` relational tracking table. Features automated expiry warning flags (`EXPIRED` / `RENEWAL REQUIRED`) to track compliance timelines. File viewing leverages secure, temporary Signed URLs mapped directly into native HTML anchor tags to completely bypass browser pop-up blockers and ad-blockers.
- **Targeted Vault Record Deletion**: Fully operational. Relational document records inside `TabDocuments.jsx`
- **Private File Vault & Deletion Architecture**: Fully operational. Relational document records inside `TabDocuments.jsx` feature localized file listings paired with an explicit, dark-masked deletion warning confirmation modal. The pipeline securely handles backend asset eviction and table line drops with zero UI text bloat.
- **Secure Incident Documentation Pipeline**: Fully operational. Upgraded `TabWarnings.jsx` to intercept binary image attachments seamlessly during disciplinary creation. The transaction pipeline streams screenshots up to a private Supabase Storage bucket (`employee-files`), captures the storage path reference inside PostgreSQL database matrices, and safely serves secure, temporary 60-second Signed URLs directly to managers to protect employee data privacy.
