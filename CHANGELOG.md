# Changelog

All notable shenanigans in this project will be documented here.

## 1.2.0 - 2026-03-08

### ✨ Added
- Added a new `/alg` Algorithms page with SEO metadata, canonical URL, and a learning-focused hero section.
- Added an interactive `AlgorithmVisualizer` with category filtering, step controls (play/pause/prev/next/reset), playback speed options, progress tracking, and pseudocode/state explanations.
- Added algorithm data and simulation logic in `config/algorithms.ts` for Bubble Sort, Selection Sort, Insertion Sort, and Binary Search.
- Added shared algorithm domain types in `types/algorithm.ts` for strongly typed definitions and replay steps.
- Added mobile device rotation hint animation styles (`mobile-device-rotate`, `.mobile-rotate-device`) for the algorithm page experience.

### 🔧 Changed
- Updated site navigation to include an internal `algorithm` link to `/alg`.
- Added `/alg` to sitemap generation so the new page is discoverable by crawlers.
- Increased the navigation brand text size for improved visual balance.

## 1.1.1 - 2026-03-08

### ✨ Added
- Introduced a native blog system with a dedicated `/blog` listing page and statically generated `/blog/[slug]` article pages.
- Added markdown-based blog content pipeline (`content/blog/*.md`) with frontmatter parsing, reading-time metadata, and HTML rendering.

### 🔧 Changed
- Added an internal `/journal` page that renders `CHANGELOG.md` directly.
- Updated site navigation so both new content sections (`/blog` and `/journal`) are first-party internal routes.
- Added `/journal` to sitemap output.
- Updated status dashboard data to reflect the blog/journal first-party rollout and current operational state.
- Fixed markdown heading rendering so section titles like `###` display correctly.
- Includes current uncommitted local updates as part of this patch release.

## 1.1.0 - 2026-03-07

### ✨ Added
- Added a new `/vault` CTF experience with terminal-integrated challenge commands and dedicated challenge config.
- Added standalone `/privacy` and custom `not-found` pages.
- Added shared `SiteFooter` and `SiteNavigation` layout components for consistent page structure.
- Added dedicated terminal hooks (`use-terminal-controller`, `use-terminal-badges`) and a focused `DesktopTerminal` component.

### 🔧 Changed
- Refined terminal behavior and command handling in `NativeTerminal` and `lib/terminal/commands`.
- Updated page layouts across home, status, vault, privacy, and not-found routes to use a unified shell.
- Refreshed status dashboard visuals and card components (`IncidentCard`, `OverallStatus`, `ServiceStatus`, `SystemMetrics`).
- Consolidated global styling into `app/globals.css` and removed legacy `styles/globals.css`.
- Updated terminal configuration and supporting docs (`config/terminal.ts`, `README.md`).

### 🧹 Removed
- Removed unused visual layers and helpers (`BackgroundLight`, `CyberGrid`, shader effects, theme provider).
- Removed unused UI primitives and hooks under `components/ui` and legacy hooks/utilities.
- Simplified dependency footprint in `package.json` and lockfile after component cleanup.

## 1.0.0 - 2025-08-25

### 🎉 Major Features
- **Terminal-Style Main Page**: Complete redesign with a native terminal interface featuring command history, tab completion, and file system navigation
- **Status Dashboard**: New `/status` page with real-time service monitoring, incident tracking, and system metrics
- **Mobile-First Design**: Enhanced mobile rendering with responsive navigation and optimized layouts

### ✨ New Components
- `NativeTerminal`: Interactive command-line interface with system information display
- `CyberGrid`: Stylized background component for visual enhancement
- `BackgroundLight`: Dynamic animated gradient lights with mobile optimization
- `StatusDashboard`: Comprehensive service status monitoring
- `IncidentCard`: Display and manage service incidents
- `OverallStatus`: System health overview
- `ServiceStatus`: Individual service monitoring
- `SystemMetrics`: Real-time system performance metrics

### 🔧 Technical Improvements
- Added terminal-specific fonts and glass morphism effects
- Implemented `framer-motion` animations throughout the application
- Created TypeScript interfaces for `TerminalLine`, `FileSystemItem`, and `BootMessage`
- Enhanced network utilities with IP address detection
- Added configuration files for terminal and status page data
- Improved CSS with keyframe animations (`pulse-light`, `shimmer-light`)
- Fixed mobile rendering issues and added responsive design patterns

### 🐛 Bug Fixes
- Fixed typo in blog URL (corrected from `https://blog.yflong.devblog.yflong.dev` to `blog.yflong.dev`)
- Corrected startup date display in terminal configuration
- Resolved iOS rendering logic issues

### 📦 Dependencies
- Added `framer-motion` for smooth animations
- Integrated various Radix UI components for enhanced UX
- Added `three.js` and React Three Fiber for 3D capabilities
- Included `recharts` for data visualization in status dashboard

### 🎨 Design Updates
- Implemented terminal aesthetic with monospace fonts
- Added cyberpunk-inspired visual elements
- Enhanced mobile user experience with optimized layouts
- Introduced dynamic background effects and animations

## 0.1.0
- Initial commit. It worked on my machine.
