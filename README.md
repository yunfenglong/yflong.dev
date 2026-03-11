# yflong.dev

Portfolio site for Yunfeng Long built with Next.js, TypeScript, and Tailwind CSS.

## Overview

This project combines:

- Terminal-style homepage interaction
- Structured project case studies (`/project`)
- Recruiter-friendly contact route (`/contact`)
- Content routes for blog and changelog journal (`/blog`, `/journal`)
- Status dashboard for service reliability storytelling (`/status`)

## Technical Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4 + custom design tokens
- Motion: Framer Motion
- Icons: Lucide React

## Architecture

Core design principles used in this codebase:

- Single Responsibility:
  - `components/` for presentation
  - `hooks/` for local UI/state behavior
  - `lib/` for domain logic (terminal command execution, blog parsing)
  - `config/` for typed static domain content
  - `types/` for shared contracts
- Open/Closed:
  - Terminal command registry can be extended by adding handler definitions.
- Data-driven UI:
  - Profile, contact, and project case studies are centralized in typed config.

## Route Map

- `/` Home + terminal
- `/project` Case-study project portfolio
- `/contact` Contact channels and availability
- `/blog` and `/blog/[slug]` Engineering posts
- `/journal` Changelog-driven journal
- `/status` Service status dashboard
- `/privacy` Privacy notice
- `/vault` CTF vault route

## Project Structure

- `app/`: route entrypoints, metadata routes (`sitemap`, `robots`), and root layout
- `components/`: UI composition (`layout`, `terminal`, `status`, `blog`)
- `config/`: typed static data (`profile`, `terminal`, `status`, `site`)
- `hooks/`: reusable state logic for terminal behavior
- `lib/`: domain utilities (`terminal` command engine, blog content pipeline)
- `types/`: TypeScript domain interfaces
- `content/blog`: markdown blog content
- `docs/`: project planning and improvement docs

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality Gates

```bash
pnpm lint
pnpm build
```

Use both commands before deploying to keep the project in a production-safe state.
