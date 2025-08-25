# Changelog

All notable shenanigans in this project will be documented here.

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

## Unreleased
- Added a README so future-me isn't confused.
- Wrote this changelog because memory is hard.

## 0.1.0
- Initial commit. It worked on my machine.
