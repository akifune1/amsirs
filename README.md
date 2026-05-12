# amsirs
Attendance Monitoring, Student Incident Reporting, Student Support (AMSIRS)



# 🛡️ Campus Integrated System (CIS)

> *"Security is the result of architectural intent, not a happy accident."*

A high-security, minimalist campus management portal designed for **Mapúa University – Makati**. CIS focuses on student welfare and incident reporting through a **Cybersecurity-first** lens, utilizing tiered data isolation and manual identity provisioning.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 📖 System Philosophy

Unlike standard management systems, **CIS** rejects the vulnerability of "auto-approved" accounts. It implements a **Manual Vetting Workflow**:

1. **Students** register but land in a restricted *Pending Approval* state.
2. **Administrators** verify credentials via a separate *Root Control* tier.
3. **Access** is granted only after manual administrative confirmation.

This architecture ensures that no user can self-elevate privileges or bypass institutional review — security is baked into the registration flow itself.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI Library | React 19.2 |
| Auth & Database | Supabase SSR (Server-Side Auth + RLS) |
| Styling | Tailwind CSS 4.3 |
| Icons | Lucide React |
| Type Safety | TypeScript 5.9 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18.0** or higher
- A [Supabase](https://supabase.com/) project (for Authentication and Database)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/amsirs-web.git

# Navigate to the project directory
cd amsirs-web

# Install dependencies
npm install
```

> **Note:** Since this project uses React 19 and Next.js 16, some older packages may throw peer dependency warnings. Use `--legacy-peer-deps` or `--force` if needed:
> ```bash
> npm install <package-name> --legacy-peer-deps
> ```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Initialization

Run the following SQL in your **Supabase SQL Editor** to establish the Tiered Isolation architecture:

```sql
-- Tier 1: Root Administrators
CREATE TABLE public.system_admins (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  admin_level INTEGER DEFAULT 99
);

-- Tier 2: Institutional Staff
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('guard', 'guidance'))
);

-- Tier 3: Student Body
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES auth.users(id),
  student_id TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  is_approved BOOLEAN DEFAULT FALSE
);
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Identity & Access Management (IAM)

CIS uses an intelligent **Traffic Controller** logic during login to route users based on their relational data:

| User Role | Database Source | Landing Zone |
|---|---|---|
| Root Admin | `system_admins` | `/admin-dashboard` |
| Staff (Guard / Guidance) | `user_profiles` | `/incident-dashboard` |
| Approved Student | `students` (`is_approved: true`) | `/incident-reporting` |
| Pending Student | `students` (`is_approved: false`) | `/pending-approval` |

No role self-selects. Access is determined entirely by server-side data lookups after authentication.

---

## 📄 License

This project is intended for academic and institutional use at Mapúa University – Makati.

---

# Facial Recognition module
npm install face-api.js

npm install @supabase/supabase-js

tiny_face_detector_model

face_landmark_68_model

face_recognition_model
