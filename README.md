# Fenu-The-Nikabi-Marketer: Dynamic Portfolio CMS

A premium dark-themed portfolio website with a Content Management System (CMS) for a social media marketing specialist. Built with React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and PostgreSQL / Supabase.

---

## Architecture: Single Source of Truth

```
┌────────────────────────────────┐
│        ADMIN DASHBOARD         │
│  Create / Edit / Save / Publish│
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│   POSTGRESQL / SUPABASE DB     │
│  Single Source of Truth (CMS)  │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│    PUBLIC PORTFOLIO WEBSITE    │
│  Live dynamic published data   │
└────────────────────────────────┘
```

Every section on the public website is powered dynamically by the PostgreSQL / Supabase database. Changes saved as **Draft** remain hidden from visitors until published via **Publish Changes**.

---

## Getting Started

### 1. Prerequisites & Environment Setup
Copy `.env.example` to `.env` and verify your database connection:

```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
# Frontend config
VITE_API_BASE_URL=

# PostgreSQL Database Connection String (Local Postgres or Supabase direct URL)
DATABASE_URL=postgresql://ayine_user:ayine_password@localhost:5432/fenu_portfolio
LOCAL_ADMIN_EMAIL=admin@example.com
LOCAL_ADMIN_PASSWORD=admin123
PORT=3001

# Supabase (optional, when using Supabase Cloud)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 2. Database Migrations
Run the schema and seed scripts against your PostgreSQL database:

```bash
psql -d fenu_portfolio -f database/schema.sql
psql -d fenu_portfolio -f database/migrations/002_add_missing_cms_columns.sql
psql -d fenu_portfolio -f database/seed.sql
```

For Supabase Cloud deployments, apply `supabase/migrations/20261111000000_complete_cms_schema_and_rls.sql` in the Supabase SQL editor to enable Row Level Security (RLS) policies and storage bucket setup.

### 3. Run the Development Server
```bash
npm run dev
```

Open:
- **Public Website**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Admin Login**: `http://localhost:5173/admin/login` (Default: `admin@example.com` / `admin123`)

---

## Admin CMS Routes & Features

- **`/admin`** — Dashboard Overview with real-time project, service, testimonial, and message counters.
- **`/admin/landing-page`** — Complete Landing Page Editor with 11 tabs:
  - Hero Section (Greetings, Title, Bio, Profile Photo Upload, Hero Background, Buttons, Draft/Publish).
  - Statistics (Values, Suffixes, Labels, Icons, Reorder, Hide/Show).
  - About Me (Heading, Biography, Story, Portrait Upload, Alt Text, Draft/Publish).
  - Services (CRUD, Icons, Optional Image, Reordering, Hide/Show, Publish/Unpublish).
  - Featured Work (CRUD, Cover Photos, Metrics, Categories, Homepage Feature Toggle, Reorder).
  - Skills & Tools (CRUD, Reorder, Hide/Show).
  - Process Engine (4-step strategic engine management, Reorder, Hide/Show).
  - Testimonials (CRUD, Client Photos, Names, Designations, Quotes, Hide/Show, Publish/Unpublish).
  - Final CTA (Script Greeting, Heading, Highlighted Words, Button Destination).
  - Footer (Copyright Text, Email, Phone, Social Media URLs, WhatsApp Link).
  - Sections & Layout (Section visibility toggles and top-to-bottom sequence reordering).
- **`/admin/about`** — Dedicated About Me profile editor.
- **`/admin/services`** — Dedicated Services manager.
- **`/admin/projects`** — Dedicated Case Studies manager.
- **`/admin/skills`** — Dedicated Skills manager.
- **`/admin/process`** — Dedicated Workflow manager.
- **`/admin/testimonials`** — Dedicated Testimonials manager.
- **`/admin/statistics`** — Dedicated Statistics manager.
- **`/admin/media`** — Complete Media Library with drag-and-drop upload, search, image preview, alt text editing, URL copying, and active content reference warnings before deletion.
- **`/admin/messages`** — Contact Inbox with full message viewing, email reply links, status updates (`new`, `read`, `replied`), and delete confirmation.
- **`/admin/settings`** — Website & SEO Settings (Brand Name, Contact Info, Social Links, Favicon, Logo, SEO Meta Tags).

---

## Production Build

```bash
npm run build
```
Generates a minified, type-checked production bundle in `dist/`.
