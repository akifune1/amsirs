# AMSIRS — Campus Integrated System

**Attendance Monitoring, Student Incident Reporting, and Student Support**

> *"Security is the result of architectural intent, not a happy accident."*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 📖 Overview

AMSIRS is an integrated campus security and student management system built for **Cavite National High School**. It unifies three critical institutional workflows into a single, secure platform:

- **Attendance Monitoring** — Biometric facial recognition entry/exit scanning with live campus population tracking.
- **Student Incident Reporting** — AES-256 encrypted incident logging with multi-student involvement and evidence upload.
- **Student Support** — A counselor-facing dashboard for flagging at-risk students, managing interventions, and tracking counseling history.

AMSIRS rejects the vulnerability of "auto-approved" accounts. It enforces a **Manual Vetting Workflow** where no user can self-elevate privileges or bypass institutional review — security is baked into the registration flow itself.

---

## 🗂️ Project Structure

```
amsirs/
└── amsirs-web/              # Next.js 16.2 web application
    ├── proxy.ts                 # Central middleware — auth, session control, rate limiting, routing
    ├── app/
    │   ├── access-gate/         # Facial recognition entry scanner
    │   ├── exit-gate/           # Facial recognition exit scanner
    │   ├── access-logs/         # Full biometric access log history
    │   ├── campus-status/       # Real-time campus population monitor
    │   ├── incident-dashboard/  # Staff view of all incident reports
    │   ├── incident-reporting/  # Encrypted incident submission form
    │   ├── student-support/     # Counselor dashboard & interventions
    │   ├── admin-dashboard/     # Root admin control panel & analytics
    │   ├── active-sessions/     # Super Admin session monitoring & revocation
    │   ├── student-portal/      # Student self-service portal
    │   ├── notifications/       # In-app notification center
    │   ├── auth/                # Logout server action
    │   ├── login/               # Authentication entry point
    │   ├── register/            # Student registration
    │   ├── pending-approval/    # Holding state for unapproved students
    │   ├── unauthorized/        # Access-denied page
    │   ├── gate/                # Shared gate actions
    │   ├── components/          # Shared UI components (Sidebar, MobileNav, etc.)
    │   ├── hooks/               # Custom React hooks (useNotifications)
    │   ├── utils/               # Utility functions (cn, notification helpers)
    │   └── api/
    │       └── student-support/ # REST API endpoints for support module
    ├── lib/
    │   ├── encryption.ts        # AES-256-GCM encrypt/decrypt utilities
    │   ├── rateLimit.ts         # In-memory rate limiter for API & login routes
    │   ├── supabase.ts          # Supabase client configuration
    │   └── face/
    │       ├── loadModels.ts    # face-api.js model loader
    │       ├── compareFaces.ts  # Descriptor comparison & match scoring
    │       ├── detectFace.ts    # Face detection wrapper
    │       └── liveness.ts      # Mouth-open liveness check logic
    └── public/
        └── models/              # Bundled face-api.js AI model weights
```

---

## 🛠️ Tech Stack

| Layer             | Technology                               |
| ----------------- | ---------------------------------------- |
| Framework         | Next.js 16.2 (App Router)                |
| UI Library        | React 19.2                               |
| Auth & Database   | Supabase SSR (Server-Side Auth + RLS)    |
| Styling           | Tailwind CSS 4.3                         |
| Icons             | Lucide React                             |
| Type Safety       | TypeScript 5.9                           |
| Face AI           | face-api.js (TinyFaceDetector + FaceLandmarks + FaceRecognition) |
| Encryption        | Node.js `crypto` — AES-256-GCM           |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18.0** or higher
- A [Supabase](https://supabase.com/) project with Authentication and a Postgres database

### 1. Clone & Install

```bash
git clone https://github.com/akifune1/amsirs.git
cd amsirs/amsirs-web
npm install
```

> **Note:** This project uses React 19 and Next.js 16. Some older packages may emit peer dependency warnings. Use `--legacy-peer-deps` if needed:
> ```bash
> npm install <package-name> --legacy-peer-deps
> ```

### 2. Environment Variables

Create a `.env.local` file inside `amsirs-web/` with the following:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AES-256-GCM encryption key for incident descriptions (required)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=your_base64_encoded_32_byte_key
```

### 3. Database Initialization

Run the following SQL in your **Supabase SQL Editor** to establish the Tiered Isolation architecture:

```sql
-- Tier 1: Root Administrators
CREATE TABLE public.system_admins (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tier 2: Institutional Staff (Guards & Guidance Counselors)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  internal_id BIGINT GENERATED ALWAYS AS IDENTITY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'guard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tier 3: Student Body
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id),
  student_id TEXT UNIQUE DEFAULT ('AMS-' || nextval('student_internal_id_seq')::TEXT),
  lrn TEXT NOT NULL,
  lrn_hash TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  section TEXT NOT NULL,
  gender TEXT,
  birthday TEXT,
  address TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  face_photo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Face biometric embeddings (linked to students)
CREATE TABLE public.face_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  descriptor JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Campus entry/exit log
CREATE TABLE public.access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  action TEXT CHECK (action IN ('ENTRY', 'EXIT')),
  match_percentage INTEGER,
  face_distance FLOAT8,
  snapshot_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Incident reports (descriptions stored AES-256 encrypted)
CREATE TABLE public.incident_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  location TEXT NOT NULL,
  severity TEXT,
  description TEXT NOT NULL, -- AES-256-GCM ciphertext
  status TEXT DEFAULT 'Pending',
  reported_by UUID REFERENCES auth.users(id),
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Links students to incident reports (many-to-many)
CREATE TABLE public.incident_involvements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incident_reports(id),
  student_id UUID REFERENCES public.students(id),
  role TEXT DEFAULT 'Offender',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI-matched incident suggestions
CREATE TABLE public.incident_ai_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incident_reports(id),
  student_id UUID REFERENCES public.students(id),
  match_percentage NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student support interventions (counseling sessions)
CREATE TABLE public.support_interventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id),
  counselor_id UUID NOT NULL REFERENCES auth.users(id),
  intervention_type TEXT NOT NULL,
  notes TEXT,
  follow_up_date DATE,
  case_status TEXT DEFAULT 'ongoing',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student risk flags (calculated by the system)
CREATE TABLE public.student_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  is_flagged BOOLEAN DEFAULT false,
  review_status TEXT DEFAULT 'Pending',
  flag_reason TEXT,
  low_severity_count INTEGER DEFAULT 0,
  medium_severity_count INTEGER DEFAULT 0,
  high_severity_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

-- In-app notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Active session tracking (concurrent session control)
CREATE TABLE public.active_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Admin audit trail
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc', now()))
);
```

Also create a Supabase Storage bucket named **`access-snapshots`** for facial scan photos.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Identity & Access Management (IAM)

AMSIRS uses an intelligent **Traffic Controller** middleware (`proxy.ts`) that checks relational database tables in sequence after authentication. No role is self-declared by the user — access is determined entirely by server-side lookups.

| User Role                | Database Source                       | Landing Page          | Key Restrictions                                     |
| ------------------------ | ------------------------------------- | --------------------- | ---------------------------------------------------- |
| Super Admin              | `system_admins` (role: `super_admin`) | `/admin-dashboard`    | Full access to all routes                            |
| IT Admin                 | `system_admins` (role: `it_admin`)    | `/admin-dashboard`    | No access to gates, incidents, support, or sessions  |
| School Admin             | `system_admins` (role: `school_admin`)| `/admin-dashboard`    | No access to admin dashboard, gates, or sessions     |
| Guard                    | `user_profiles` (role: `guard`)       | `/incident-dashboard` | No access to admin dashboard, support, or sessions   |
| Guidance Counselor       | `user_profiles` (role: `guidance`)    | `/student-support`    | No access to admin dashboard, reporting, or sessions |
| Approved Student         | `students` (`is_approved: true`)      | `/student-portal`     | Can only access student portal & incident reporting  |
| Pending Student          | `students` (`is_approved: false`)     | `/pending-approval`   | Locked to pending page until approved                |

> Staff accounts are created exclusively by Admins through the admin dashboard. Students self-register but cannot access the system until an admin sets `is_approved = true`.

---

## 🖥️ Features & Pages

### 🔬 Facial Recognition Access Gates (`/access-gate`, `/exit-gate`)

The entry and exit gates are fully automated biometric scanners powered by `face-api.js`:

- **AI Models Used:** TinyFaceDetector (speed-optimized), FaceLandmark68 (precision alignment), FaceRecognition (128-point descriptor)
- **Liveness Detection:** A two-step mouth-open challenge prevents photo spoofing. The system waits for a closed mouth, then prompts the student to open it before accepting the scan.
- **Proactive Privacy Architecture:** Bypasses standard Next.js unmount delays by severing raw DOM video streams instantly upon navigation, guaranteeing the camera hardware shuts down the millisecond the guard navigates away.
- **Identity Verification Profile:** Upon a successful scan, the dashboard locks in a persistent data card displaying the student's database photo, name, match confidence, grade, and timestamp for effortless visual cross-referencing by the guard.
- **Neutral Snapshot:** The face photo is captured at the neutral (closed-mouth) step, so the stored image is always clean, not mid-gesture.
- **Matching Logic:** The live facial descriptor is compared against all stored embeddings using Euclidean distance. A match threshold of `< 0.75` is required for access to be granted.
- **Engine Optimization:** The system pre-processes massive mathematical array conversions (Float32Array) before iterative scans and uses main-thread micro-yielding (`setTimeout`) to prevent the heavy WebGL engine from freezing the browser UI during scanning.
- **Duplicate Scan Prevention:** A 15-second cooldown is enforced per student to prevent re-scans.
- **Logging:** Every successful scan is recorded in `access_logs` with the student ID, action type, match percentage, face distance score, and the captured snapshot.

### 📋 Access Logs (`/access-logs`)

A chronological table of all campus entry and exit events. Each row displays:
- Biometric snapshot thumbnail (from Supabase Storage)
- Student name and ID
- Action badge (ENTRY / EXIT)
- Match accuracy percentage
- Timestamp

### 🏫 Campus Status Monitor (`/campus-status`)

A real-time dashboard showing which students are currently **inside** the campus. It determines campus presence by reading each student's latest access log action — students whose last recorded action is `ENTRY` are considered on-campus. Displays student name, ID, grade, section, match accuracy, and entry time.

### 🚨 Incident Reporting (`/incident-reporting`)

A secure form for authorized staff to file incident reports:

- **Dynamic student fields** — add or remove multiple involved students per report
- **Multiple locations** — incidents can span several campus areas
- **Severity classification** — Low, Medium, or High
- **Photographic evidence upload** — JPEG/PNG attachment
- **AES-256-GCM encryption** — The incident description is encrypted server-side using Node.js `crypto` before being stored in the database. The IV and authentication tag are embedded in the stored ciphertext for future decryption.

### 📊 Incident Dashboard (`/incident-dashboard`)

A protected staff view of all filed incident reports. Fetches `incident_reports` joined with `incident_involvements` and `students` via Supabase nested queries. Stats cards show total reports, high-severity count, and system status. Data is always fresh (`revalidate = 0`).

### 🧠 Student Support System (`/student-support`)

A counselor-facing case management dashboard:

- **Dashboard Stats:** Active cases, high-risk students, pending follow-ups, resolved cases
- **Flagged Students Table:** Lists at-risk students with risk level badges, absence counts, incident counts, and counseling status
- **Case Details View:** Deep-dive into a student's full profile including attendance stats, recent incident history, and counseling session history
- **Intervention Modal:** Create counseling session records with intervention type (Initial Counseling, Follow-up, Crisis Intervention, Academic Support, Behavioral Intervention, Parent Conference, or Referral), session notes, follow-up date, and case status

**Risk Levels:**
| Level  | Criteria                                                    |
| ------ | ----------------------------------------------------------- |
| High   | Multiple recent absences + incident involvement             |
| Medium | Either attendance concerns or incident history              |
| Low    | No significant concerns                                     |

**Intervention Types Supported:**
`Initial Counseling` · `Follow-up Session` · `Crisis Intervention` · `Academic Support` · `Behavioral Intervention` · `Parent Conference` · `Referral to External Services`

**Case Statuses:**
`Active` · `Pending Review` · `Resolved` · `Escalated`

### 🛡️ Admin Dashboard (`/admin-dashboard`) — Root Only

Exclusive to `system_admins`. Provides full inline-editable control over staff and students with a highly optimized, data-dense UI.

- **High-Density Layouts:** Competitive-tier compact tables with specific column width constraints ensure massive amounts of data fit cleanly on screen without truncating or stretching.
- **Smart Modals & Visual Diffs:** All destructive actions (e.g., Reset Password) require explicit confirmation via custom safety modals. Inline row edits trigger a visual difference modal (showing red strikethroughs for old values vs. green for new) before committing to the database.
- **Staff management** — View, edit name and role (guard/guidance), or create new staff accounts
- **Student management** — Edit student name, grade level, section, and toggle approval status (`Approved` / `Pending`)
- **Bulk Student Approval** — Select and approve multiple pending students at once
- **Analytics Tab** — Visual charts powered by Chart.js for system-wide statistics
- **CSV Export** — Export student and staff data tables as CSV files via PapaParse
- **Password Reset** — Securely reset any user's password from the admin panel

All changes are saved via Next.js Server Actions.

### 🔐 Active Sessions (`/active-sessions`) — Root Only

Exclusive to `super_admin`s. A dedicated UI to monitor and enforce the strict single-session policy.
- **Live Device Tracking:** Displays the exact browser, OS, and IP address for all active staff and admin sessions.
- **One-Click Revocation:** Admins can instantly terminate any suspicious or stale session. The targeted staff member will be forcefully logged out on their very next interaction with the system.

### 👤 Student Portal (`/student-portal`)

A self-service view for approved students to review their own incident involvement history. Students can also file new incident reports via the `/incident-reporting` form, which is accessible to both staff and students.

---

## 🔒 Security Architecture

### Tiered Isolation Model

Access control is enforced via three completely separate database tables (`system_admins`, `user_profiles`, `students`) and Supabase Row Level Security (RLS). Each tier has no visibility into the other.

### AES-256-GCM Encryption

Incident descriptions are encrypted at the server layer before being written to the database. The encrypted payload format is:

```
<IV (hex)>:<AuthTag (hex)>:<Ciphertext (hex)>
```

The authentication tag ensures ciphertext integrity — tampered data cannot be decrypted. The key is a base64-encoded 32-byte value stored exclusively in environment variables.

### Concurrent Session Control

AMSIRS enforces a strict **Single Active Session** policy across the board (Students, Staff, Admins). 
- **Auto-Kickout:** Logging into a new device automatically invalidates any previously active sessions.
- **Edge-Level Validation:** The Next.js middleware intercepts all requests to protected routes. It verifies the session state natively in under 10ms, instantly dropping requests and clearing cookies if a session has been revoked or superseded.

### Server-Side Authentication

All protected pages use `@supabase/ssr` with `createServerClient` and cookie-based session tokens. Auth checks happen at the server component level before any data is fetched or rendered, preventing unauthorized data exposure.

### Rate Limiting

The central middleware (`proxy.ts`) enforces an in-memory rate limiter on all `/api/` routes and the `/login` page. Currently configured at **10 requests per 10 seconds** per IP address. Exceeding the limit returns a `429 Too Many Requests` response for API calls, or redirects to the login page with an error message for browser requests.

### No Self-Elevation

Users cannot change their own role or approval status. Role assignment is controlled by admin server actions only. Students remain in `pending-approval` state until explicitly approved by an administrator.

### Data Privacy Act (RA 10173) Compliance

Because the system captures biometrics (facial geometry) and Personally Identifiable Information (PII) like disciplinary history, it enforces strict consent requirements:
- **Mandatory Consent Checkboxes:** Registration and Incident Reporting forms strictly block submission unless the explicit Data Privacy consent checkbox is ticked.
- **Visual Disclaimers:** Biometric entry gates display persistent legal consent disclaimers informing users that stepping into the camera's view grants consent to process their data.
- **Counselor Confidentiality:** Staff resolving cases in the Student Support module are prompted with strict confidentiality reminders before committing case notes to the database.

---

## 🔌 API Reference

The student support module exposes REST endpoints under `/api/student-support/`:

| Method | Endpoint                                      | Description                          |
| ------ | --------------------------------------------- | ------------------------------------ |
| GET    | `/api/student-support/flagged`                | Fetch flagged students list          |
| GET    | `/api/student-support/history/[studentId]`    | Get full support history for student |
| POST   | `/api/student-support/interventions`          | Create a new intervention record     |
| PATCH  | `/api/student-support/interventions/[id]`     | Update an existing intervention      |

See [`app/api/student-support/API_DOCUMENTATION.md`](amsirs-web/app/api/student-support/API_DOCUMENTATION.md) for full request/response schemas.

---

## 📦 Available Scripts

From inside `amsirs-web/`:

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start the development server        |
| `npm run build` | Create a production build           |
| `npm start`     | Serve the production build          |
| `npm run lint`  | Run ESLint on the codebase          |

---

## 🗃️ Key Dependencies

| Package                  | Version   | Purpose                                      |
| ------------------------ | --------- | -------------------------------------------- |
| `next`                   | 16.2.6    | Full-stack React framework (App Router)      |
| `react`                  | 19.2.4    | UI component library                         |
| `@supabase/ssr`          | ^0.10.3   | Supabase server-side auth + cookie handling  |
| `@supabase/supabase-js`  | ^2.105.4  | Supabase client SDK                          |
| `face-api.js`            | ^0.22.2   | Client-side face detection & recognition     |
| `framer-motion`          | ^12.40.0  | Page animations and transitions              |
| `chart.js`               | ^4.5.1    | Analytics charts in admin dashboard          |
| `react-chartjs-2`        | ^5.3.1    | React wrapper for Chart.js                   |
| `react-hot-toast`        | ^2.6.0    | Toast notification system                    |
| `papaparse`              | ^5.5.3    | CSV parsing for data export                  |
| `date-fns`               | ^4.4.0    | Date formatting utilities                    |
| `lucide-react`           | ^1.14.0   | Icon library                                 |
| `@radix-ui/react-popover`| ^1.1.16   | Popover UI primitive                         |
| `tailwindcss`            | ^4.3.0    | Utility-first CSS framework                  |
| `typescript`             | ^5.9.0    | Static type checking                         |
| `@playwright/test`       | ^1.60.0   | End-to-end testing framework (dev)           |

---

## 📄 License

This project is intended for academic and institutional use at **Cavite National High School**.