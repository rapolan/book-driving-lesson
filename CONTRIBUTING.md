# Peer Review Setup Guide — DrivingLesson.Me

This guide helps you get the project running locally for a peer review.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Git | Any recent version |

---

## Setup

### 1 — Clone the repository

```bash
git clone https://github.com/rapolan/book-driving-lesson.git
cd book-driving-lesson
npm install
```

### 2 — Configure environment variables

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=<ask the project author>
VITE_SUPABASE_ANON_KEY=<ask the project author>
```

> The app will load and display all UI without a Supabase connection, but live booking, the admin dashboard, and student portal require valid credentials.

### 3 — Start the dev server

```bash
npm run dev
# → http://localhost:5173
```

---

## Areas to Review

| Area | Files / Paths |
|---|---|
| **Routing & layout** | `src/App.tsx`, `src/components/Navbar.tsx` |
| **Booking flow** | `src/components/BookingCalendar.tsx`, `src/utils/bookingUtils.ts` |
| **Student portal** | `src/components/StudentPortal.tsx` |
| **Admin CRM** | `src/components/AdminDashboard.tsx` |
| **Supabase client** | `src/lib/supabase.ts` |
| **CSS architecture** | `src/styles/` (base → components → pages hierarchy) |
| **Permit study guide** | `src/components/PermitGuide.tsx` |
| **SEO** | `index.html` (structured data), `public/sitemap.xml` |

---

## Conventions

- **TypeScript** throughout — no `any` types intentionally used
- **CSS custom properties** (`var(--token)`) for all theme values — no inline styles
- **Framer Motion** for all animations — no CSS `transition` on entering/leaving elements
- **Supabase** for all data persistence — no local state saved to `localStorage` except session cache

---

## Questions?

Contact the project author directly for Supabase credentials or any questions about the implementation.
