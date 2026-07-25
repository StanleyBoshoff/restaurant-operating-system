# Restaurant Operating System (ROS) Implementation Plan

Analyze the current state of the ROS application and propose the next evolutionary steps to transform it from a simple HR tool into a comprehensive restaurant management platform.

## Current State Analysis

- **Frontend:** React 19 + Tailwind CSS + Lucide Icons.
- **Backend/DB:** Supabase (configured but not fully utilized for Auth/Storage).
- **Core Modules:**
    - `Employees`: Directory, Profile management, Adding employees.
    - `Documents`: Structural placeholder.
    - `Dashboard`: Basic UI.
    - `Compliance`: Placeholder.
- **UI/UX:** Clean, responsive dashboard design with a persistent sidebar and module-based workspace.

## User Review Required

> [!IMPORTANT]
> The app currently lacks authentication. Anyone with the URL can access and modify employee data. **Implementing Supabase Auth should be the highest priority.**

> [!NOTE]
> Since you are using Android Studio, are you planning to port this to a native Android app (using Kotlin/Compose) or continue with a web-first approach (PWA/Capacitor)?

## Proposed Changes

### Phase 1: Security & Document Management
Focus on making the current modules functional and secure.

#### [MODIFY] [supabaseClient.js](file:///C:/Users/Stanley/Desktop/ros/restaurant-operating-system/frontend/src/supabaseClient.js)
- Ensure environment variables are correctly loaded for Auth redirection.

#### [NEW] [Auth.jsx](file:///C:/Users/Stanley/Desktop/ros/restaurant-operating-system/frontend/src/components/Auth.jsx)
- Create a login/signup component using Supabase Auth.

#### [MODIFY] [App.jsx](file:///C:/Users/Stanley/Desktop/ros/restaurant-operating-system/frontend/src/App.jsx)
- Wrap the main application in an `AuthProvider` or session check logic.

#### [MODIFY] [DocumentTracker.jsx](file:///C:/Users/Stanley/Desktop/ros/restaurant-operating-system/frontend/src/components/DocumentTracker.jsx)
- Integrate Supabase Storage to allow actual file uploads for employee documents.

### Phase 2: Mobile & Android Optimization
Leverage your presence in Android Studio to enhance the mobile experience.

#### [NEW] [manifest.json](file:///C:/Users/Stanley/Desktop/ros/restaurant-operating-system/frontend/public/manifest.json)
- Add PWA support to make the app installable on Android devices.

#### [NEW] [Android Wrapper (Optional)]
- If desired, initialize a Capacitor project to build a native `.apk` for distribution to restaurant staff devices.

### Phase 3: Operational Expansion
Move towards a full "Operating System".

#### [NEW] [Orders.jsx](file:///C:/Users/Stanley/Desktop/ros/restaurant-operating-system/frontend/src/components/Orders.jsx)
- Start the implementation of a real-time order tracking system for waitstaff and kitchen.

## Verification Plan

### Manual Verification
- Test Supabase connection and data fetching.
- Verify responsiveness on mobile screen sizes (using browser dev tools).
- Check `localStorage` persistence for the active module.

### Automated Tests
- Plan for basic Vitest setup for component testing.
