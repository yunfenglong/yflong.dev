# Portfolio Improvement Plan

## Goal
Increase recruiter conversion while keeping the terminal-first identity and engineering depth.

## Software Engineering Standardization

### Architecture and Data Modeling
- Introduce typed domain models for profile/contact/projects.
- Move user-facing business content into `config/` rather than hardcoding in components.
- Keep pages thin and presentational.

### SEO and Discoverability
- Improve root metadata:
  - Open Graph
  - Twitter card
  - robots policy
- Add `Person` JSON-LD structured data in root layout.
- Extend sitemap to include newly added routes.

### Consistency and Maintainability
- Keep route sections using shared design tokens (`swift-*` classes).
- Standardize language and profile information from a single source of truth.
- Add project-level documentation updates in README.

## Next Increment Ideas
- Add automated test coverage for utility modules (`lib/blog`, `lib/terminal`).
- Add CI workflow to run lint and build on pull requests.
- Add Lighthouse check in CI for performance budgets.
- Add analytics events for CTA click-through tracking.
