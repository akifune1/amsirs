# AMSIRS Project TODOs

These are the remaining tasks and missing components identified for the Campus Integrated System:

## 1. Attendance Monitoring Dashboard (`app/attendance-monitoring`)
* **Status:** 🔴 Not Started (Directory is empty)
* **Description:** Create a central hub/dashboard for guards and administrative staff. 
* **Key Features:**
  * Quick links to launch the **Entry Gate Scanner** (`/access-gate`) and **Exit Gate Scanner** (`/exit-gate`).
  * Live summary of today's access stats (Total Entries vs Total Exits).
  * Direct links to the real-time **Campus Status Monitor** (`/campus-status`) and full **Access Logs** (`/access-logs`).
  * Should use the established design system (`sys-card`, `sys-title`, `stat-card`).

## 2. Mock Data & Database Seeding
* **Status:** 🟡 Needs Verification
* **Description:** The system relies heavily on relational data (students, embeddings, incidents, counselors). We need a consistent way to seed the local or staging Supabase database for development.
* **Key Features:**
  * Create a script (e.g., `seed.ts`) to inject mock students, `user_profiles` (with `guard` and `guidance` roles), and sample `face_embeddings`.
  * Ensure dummy `support_interventions` are generated to test the Counselor dashboard.

## 3. Facial Recognition Gates UX Improvements
* **Status:** 🟡 Pending Polish
* **Description:** The `/access-gate` and `/exit-gate` functionality works well but could use UI polish.
* **Key Features:**
  * Add a visual countdown/cooldown indicator when a student is blocked due to the 15-second duplicate scan prevention.
  * More graceful loading states while `face-api.js` models are being loaded in the background.

## 4. Student Portal Expansion
* **Status:** 🟡 Pending Polish
* **Description:** The `app/student-portal` correctly shows identity details and incident logs, but doesn't show attendance stats.
* **Key Features:**
  * Integrate attendance record summary (Total Absences, Lates) directly into the student's personal view matrix.

---
*Note: The root landing page and guard role-based access restrictions for the gates have been successfully implemented.*
