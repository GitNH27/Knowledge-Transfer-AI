# Knowledge-Transfer-AI

[![license](https://img.shields.io/github/license/GitNH27/Knowledge-Transfer-AI.svg)]()
[![repo size](https://img.shields.io/github/repo-size/GitNH27/Knowledge-Transfer-AI.svg)]()

A web application (frontend) for generating and delivering bite-sized, role-tailored learning content using AI. The project includes a React + Tailwind UI and components for onboarding, lecture management, and an AI-driven "learn" experience.

Table of contents
- [What this project does](#what-this-project-does)
- [Why this is useful](#why-this-is-useful)
- [Key features](#key-features)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick start (frontend)](#quick-start-frontend)
  - [Build for production](#build-for-production)
  - [Environment variables](#environment-variables)
- [How to use (developer examples)](#how-to-use-developer-examples)
- [Where to get help](#where-to-get-help)
- [License & acknowledgements](#license--acknowledgements)

What this project does
----------------------
Knowledge-Transfer-AI is focused on short, practical learning flows for onboarding and role-based training supported by AI-generated explanations and notes. The visible code in this repository includes a modern React frontend (Material Tailwind template) with pages for onboarding, uploading content, browsing lectures, and an interactive learning page that surfaces AI explanations and key notes.

Why this is useful
------------------
- Rapidly prototype AI-enhanced learning experiences for teams and users
- Role- and industry-aware onboarding flows to tailor content
- Modern frontend stack (React + Tailwind + Material components) for fast UI development
- Clear separation of the UI from API/back-end so you can connect any AI backend or mock service

Key features
------------
- Role selection and onboarding flows to tailor lecture topics
- Lecture listing with progress and management UI
- "Learn" page that shows key notes and AI explanations for each lecture
- Reusable UI widgets and layouts built on Material Tailwind components
- Example integration points (api service imports) for connecting to a backend/AI service

Repository layout
-----------------
Important paths (relative links):
- `frontend/react-app/` — React application, components, pages, and UI assets. See `frontend/react-app/README.md` for details.
  - `frontend/react-app/src/pages/` — core pages (onboarding, lectures, learn, etc.)
  - `frontend/react-app/package.json` — frontend scripts & dependencies
- `README.md` — this file
- `LICENSE` — repository license (see this file for terms)
- `CONTRIBUTING.md` or `docs/CONTRIBUTING.md` — contribution guidelines (if present)

Getting started
---------------

Prerequisites
- Node.js (LTS recommended — Node 16+ or Node 18+ is typical for modern Vite/React projects)
- npm, yarn, or pnpm
- A working API/backend that the frontend can call (the frontend expects an API endpoint; if you don't have one, run a mock server)

Quick start (frontend)
1. Clone the repository
   git clone https://github.com/GitNH27/Knowledge-Transfer-AI.git
   cd Knowledge-Transfer-AI/frontend/react-app

2. Install dependencies
   npm install
   # or
   yarn
   # or
   pnpm install

3. Add environment variables (see next section)

4. Start the development server
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev

5. Open your browser at the address printed in the terminal (usually http://localhost:5173 or similar)

Build for production
- Build the static assets:
  npm run build
- Serve a production preview (if supported):
  npm run preview

Environment variables
---------------------
The React app lives under `frontend/react-app` and uses Vite-style environment variables. Create a `.env` (do not commit secrets) with entries appropriate for your environment. Example minimal variables (adjust names to match your backend implementation):

Vite example (.env.local)
VITE_API_URL=https://api.example.com
# If you rely on other services (AI provider keys), put them in a secure backend instead of the frontend.

Notes:
- Do not commit API keys or secrets to this repository.
- For any AI provider keys, prefer to keep them on a server-side component and expose only necessary endpoints to the frontend.

How to use (developer examples)
-------------------------------
- Navigate to the onboarding page to select industry and role to generate tailored lecture topics.
- Browse the lectures page to view, edit, or remove lectures.
- Use the "Learn" page to view AI-generated key notes and explanations for a lecture.

If you need to debug or extend API interactions:
- Check `frontend/react-app/src/services/api` (imported as `@/services/api`) — this is the logical place to add or update REST / GraphQL calls to your backend.

Where to get help
-----------------
- Issues: open an issue in this repository (preferred for bugs & feature requests)
- For questions specific to the frontend template, see `frontend/react-app/README.md`
- If this project is part of a larger organization, consult your internal docs or team leads for deployment and backend details

License & acknowledgements
--------------------------
This repository is covered by the terms in the `LICENSE` file in the project root — see `LICENSE` for full details.

Acknowledgements:
- UI/templates adapted from the Material Tailwind React template and Creative Tim resources (see `frontend/react-app/README.md` for original credits).
- Thanks to open-source contributors and component authors used by this project.

---

What I did and next steps
- I reviewed the repository structure and key frontend pages (onboarding, lectures, learn) and inspected the React app under `frontend/react-app`.
- I created this README to get developers productive quickly by explaining project purpose, where the code lives, and how to run the frontend locally.
- Next, you may want me to:
  - Add a short CONTRIBUTING.md stub linking to preferred CLA/code style and PR checklist
  - Generate a short diagram or architecture section if a backend or AI-provider integration exists
  - Add CI / GitHub Actions badges if you share build details

If you'd like, I can add a CONTRIBUTING.md, health/CI badges, or a short architecture section that documents expected backend endpoints (I can infer minimal endpoints from the frontend imports if you want me to scan for api usage).
