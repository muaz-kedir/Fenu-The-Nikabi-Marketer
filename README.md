# Fenu-The-Nikabi-Marketer

A premium dark-themed portfolio website for a social media marketing specialist, built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Local development

1. Install dependencies:
   npm install
2. (Optional) Create a `.env` file from `.env.example` and set `DATABASE_URL` to enable PostgreSQL-backed content editing and storage. The contact inbox also works without PostgreSQL using local file storage.
3. Start the frontend and API together:
   npm run dev
4. Open the local URL shown by Vite, typically http://localhost:5173

The Vite server mounts the local API itself, so no separate API process or proxy configuration is needed. Without PostgreSQL, the public portfolio uses seed content and contact messages are saved locally in the ignored `.local-data/contact-messages.json` file; the admin inbox remains available, but other content editing and media features require PostgreSQL. `npm run dev:server` is available only if you specifically need to run the API as a separate process.
Open `/admin/login` and sign in with `admin@example.com` / `admin123` by default. Change `LOCAL_ADMIN_EMAIL` and `LOCAL_ADMIN_PASSWORD` in `.env` before using this outside a local development environment.

## Local PostgreSQL setup

1. Create a PostgreSQL database, for example `fenu_portfolio`.
2. Run the SQL in `database/schema.sql` against that database.
3. Set `DATABASE_URL` in `.env` to the connection string for that database, then restart Vite. With PostgreSQL configured, contact messages are stored in the database instead of the local file.

## Production build

npm run build

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

## Customising content

Update the portfolio details in `src/data/portfolio.ts` to change name, bio, services, projects, testimonials, and social links.
