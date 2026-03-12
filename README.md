# DrivingLesson.Me — Driving School Booking App

> **Live site:** [bookdrivinglesson.me](https://bookdrivinglesson.me)  
> Expert, personal driving lessons in **Chula Vista & South Bay San Diego**.  
> Partnered with **Budget Driving School LLC** — Licensed & Insured.

---

## Overview

A full-stack booking and student-management web application for a local driving school. Students can browse lesson packages, book sessions via an interactive calendar, read a CA DMV permit study guide, and track their progress through a dedicated student portal. Instructors manage bookings, leads, and student records through a secure admin dashboard.

### Key Features

| Feature | Description |
|---|---|
| 🗓️ **Booking Calendar** | Real-time availability, package selection & EmailJS confirmation |
| 🎓 **Student Portal** | Lesson history, progress tracking, resource library |
| 🛡️ **Admin Dashboard** | Supabase-backed CRM: leads, bookings, student notes |
| 📋 **CA Permit Guide** | Full DMV permit test study guide with interactive sections |
| 📦 **Lesson Plans** | Detailed curriculum breakdown for each package tier |
| 🔍 **Local SEO** | Schema.org structured data, sitemap, meta tags for South Bay |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 7 |
| **Routing** | React Router DOM v7 |
| **Database / Auth** | Supabase (PostgreSQL + Row-Level Security) |
| **Email** | EmailJS (booking confirmations) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS with CSS custom properties (no Tailwind) |

---

## Project Structure

```
book-driving-lesson-app/
├── public/              # Static assets, favicon, sitemap.xml, robots.txt
├── src/
│   ├── components/      # Page & section components
│   │   ├── shared/      # Reusable sub-components (ResourceCard, etc.)
│   │   ├── AdminDashboard.tsx   # Protected admin CRM
│   │   ├── BookingCalendar.tsx  # Main booking flow
│   │   ├── StudentPortal.tsx    # Student-facing dashboard
│   │   ├── PermitGuide.tsx      # CA DMV study guide
│   │   └── PlanPage.tsx         # Lesson packages detail
│   ├── data/            # Static JSON curriculum data
│   ├── lib/             # Supabase client initialisation
│   ├── styles/          # CSS organised by base / components / pages
│   └── utils/           # Booking helper utilities
├── index.html           # SEO meta tags & structured data
├── vite.config.ts
└── tsconfig*.json
```

### Routes

| Path | Component | Description |
|---|---|---|
| `/` | Home | Hero, problem/guide/plan/success sections, booking |
| `/plan` | PlanPage | Detailed lesson package breakdown |
| `/permit-guide` | PermitGuide | CA DMV permit study guide |
| `/about` | About | Instructor bios |
| `/portal` | StudentPortal | Student login & dashboard |
| `/admin-school` | AdminDashboard | Protected instructor CRM |

---

## Local Development Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A [Supabase](https://supabase.com) project (free tier is fine for local dev)

### 1 — Clone & Install

```bash
git clone https://github.com/rapolan/book-driving-lesson.git
cd book-driving-lesson
npm install
```

### 2 — Environment Variables

Create a `.env.local` file in the project root with the following keys (never commit this file):

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project under  
**Project Settings → API → Project URL & anon/public key**.

> **Note:** `VITE_EMAILJS_*` keys are loaded at runtime from the booking component. For full email functionality during local dev, configure your own [EmailJS](https://emailjs.com) service.

### 3 — Run Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4 — Other Scripts

```bash
npm run build    # Production build (tsc + vite build)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## Deployment

The app is deployed via **Netlify** (static site from `dist/` output).

```bash
npm run build    # Generates /dist
```

Netlify picks up the build automatically on push to `main`.

---

## Database (Supabase)

The following tables are used:

| Table | Purpose |
|---|---|
| `bookings` | Lesson appointment records |
| `leads` | Inquiry / contact form submissions |
| `students` | Student profile & progress data |
| `availability` | Instructor availability slots |

Row-Level Security (RLS) is enabled. Instructor access is gated by Supabase Auth.

---

## License

This project is the proprietary work of **DrivingLesson.Me** / Rob & Nat.  
Not licensed for redistribution. Shared here for peer review purposes only.
