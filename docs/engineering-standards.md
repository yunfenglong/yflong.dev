# Engineering Standards

## Source of Truth
- Put reusable domain data in `config/`.
- Define contracts in `types/` and consume contracts from pages/components.
- Avoid hardcoded profile, project, or contact strings inside UI components.

## Routing and Metadata
- Every public page should provide route-specific metadata (`title`, `description`, canonical URL).
- Keep crawlability up to date by extending `app/sitemap.ts` and `app/robots.ts` when adding routes.

## Component Design
- Keep components focused on rendering.
- Move non-trivial stateful behavior to hooks.
- Extract repeatable logic out of route components into reusable modules.

## Terminal Command Extensions
- Add command in `commandCatalog` for discoverability (`help` output).
- Add command handler in `commandHandlers`.
- Keep handlers deterministic and side-effect-limited.
- Return actionable route hints for recruiter-facing commands (`projects`, `contact`).

## Content and Case Studies
- Use case-study format for projects:
  - problem
  - architecture
  - outcomes
  - stack
  - links
- Prefer measurable and verifiable outcomes when possible.

## Delivery Checklist
- `pnpm lint` passes
- `pnpm build` passes
- Mobile and desktop route navigation verified
- No broken internal links from nav/footer/home CTA
