# yflong.dev

Terminal-style portfolio and status dashboard built with Next.js.

## Project Structure

- `app/`: route entrypoints and layout.
- `components/`: presentation components grouped by concern (`layout`, `status`, `terminal`).
- `hooks/`: reusable behavior hooks (`terminal` domain hooks and shared hooks).
- `config/`: static domain data (`terminal`, `status`).
- `lib/terminal/commands.ts`: terminal command engine and command registry.
- `types/`: shared TypeScript types.
- `utils/`: small external/service utilities.

## Engineering Notes

This codebase is refactored with SOLID-oriented boundaries:

- Single Responsibility: command execution, UI rendering, and side effects are split across dedicated modules.
- Open/Closed: terminal commands use a registry map, so new commands can be added without changing dispatcher flow.
- Dependency Inversion: terminal domain logic depends on a small runtime interface instead of React internals.

## Scripts

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```
