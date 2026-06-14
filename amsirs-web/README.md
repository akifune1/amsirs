# AMSIRS: Attendance Monitoring and Incident Reporting Security System

AMSIRS is a comprehensive school security platform built for Cavite National High School. It handles student portal access, campus status, and high-level administrative functions.

## Key Features & Security 🛡️

### Advanced Session Control System
AMSIRS enforces rigorous cybersecurity policies across all users (Students, Staff, and Admins):
- **Single Active Session Policy**: To prevent credential sharing and unauthorized access, logging into a new device automatically kicks out any active session on previous devices.
- **Device Fingerprinting**: Captures and logs Browser, OS, and IP address for all active sessions.
- **Edge-Level Validation**: Uses Next.js Middleware (`proxy.ts`) to validate sessions globally within 10ms without sacrificing app performance.
- **Super Admin Oversight**: Super Admins have access to a dedicated `/active-sessions` dashboard where they can monitor active staff devices and manually revoke compromised or stagnant sessions with a single click.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
