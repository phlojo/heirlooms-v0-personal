# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added - Documentation & Architecture (2025-01-23)

- **ARCHITECTURE.md**: Created comprehensive architectural decisions document
  - URL routing strategy: Hybrid ID + slug pattern for shareable links
  - Media system architecture principles
  - Authentication strategy overview
  - Testing approach documentation
- **Documentation Reorganization**: Restructured all docs into organized categories
  - `docs/guides/` - User and developer guides
  - `docs/operations/` - Operational runbooks and procedures
  - `docs/planning/` - Future feature specifications
  - `docs/archive/` - Historical snapshots with dated filenames
- **README.md**: Completely rewritten to be project-specific
  - Comprehensive project overview and features
  - Full tech stack documentation
  - Getting started guide with prerequisites
  - Development scripts and contributing guidelines
- **Cron Jobs Documentation**: Created operational guide for scheduled tasks

### Added - Testing Infrastructure (2025-01)

- **Comprehensive Testing Setup** (Phases 1-3 Complete)
  - Vitest 2.1.8 for unit and component testing
  - React Testing Library 16.0.1 for component testing
  - Playwright 1.48.2 for E2E browser testing
  - **169 tests written, 112 passing** (66% pass rate, target: 80%+)
- **Test Infrastructure**:
  - Mock implementations for Supabase, Cloudinary, OpenAI
  - 20+ reusable test fixtures
  - Test utilities and helper functions
  - Coverage reporting (80%+ threshold configured)
- **Unit Tests** (Phase 2):
  - Media utilities: 42 tests (100% passing)
  - Artifact server actions: 29 tests
  - Zod validation schemas: 47 tests
- **Component Tests** (Phase 3):
  - ArtifactCard: 26 tests (92% pass rate)
  - CollectionCard: 24 tests (63% pass rate)
- **Test Documentation**:
  - Comprehensive TESTING.md guide (322 lines)
  - AI testing checklist for media analysis features
  - Test patterns and best practices

### Added - Media & Upload Management (2025-01)

- **Media Audit System**:
  - Read-only audit cron job for pending uploads (`/api/cron/audit-media`)
  - Categorizes media: safe to delete, dangerous, already deleted
  - Daily scheduled reports at 2 AM UTC
  - Manual cleanup procedures documented
- **Pending Uploads Tracking**:
  - 24-hour expiration for uploaded but unsaved media
  - Automatic tracking on upload to Cloudinary
  - Cleanup on successful artifact save
  - Audit reporting for abandoned uploads
- **Media System Enhancements**:
  - Strict media order preservation (user insertion order is sacred)
  - URL-based AI metadata mapping (JSONB: `{ url: caption }`)
  - Per-file size validation (500MB videos, 50MB other)
  - Batch upload limit: 1GB total
  - `getPrimaryVisualMediaUrl()` for thumbnail selection
  - `normalizeMediaUrls()` for deduplication while preserving order

### Added - AI Analysis Features (2025-01)

- **Image Captioning**:
  - GPT-4o vision model for automatic image captions
  - Per-image caption generation (7-20 words each)
  - Maximum 5 images processed per artifact
  - Captions stored in JSONB mapping by URL
- **Video Summarization**:
  - Automatic video content summaries
  - Video-specific analysis with GPT-4o
  - Per-video URL-keyed storage
- **Audio Transcription**:
  - OpenAI Whisper integration for audio transcription
  - Optional transcript cleanup for readability
  - Per-audio-file transcription
  - Audio summaries generation
- **AI Analysis UI**:
  - "Run All" orchestrator for batch processing
  - Per-media-item generation buttons
  - Status badges (idle, processing, done, error)
  - Regeneration capability
  - Error handling with retry logic

### Added - Features & UI (2025-01)

- **Artifact Types Management**:
  - Fully dynamic type system (managed via Supabase)
  - Dynamic Lucide icon loading (1000+ icons available)
  - Soft delete with `is_active` flag
  - Display ordering and descriptions
  - Type picker in artifact forms
  - Animated bottom nav icon cycling through types
- **Google OAuth Integration**:
  - Google authentication configured
  - Branding setup documentation
  - Verification process documented
  - Quick start and detailed setup guides
- **Artifact Sticky Navigation** (Nov 2025):
  - Improved sticky nav for artifact view and edit pages
  - Better layout for image viewer components
  - Form layout updates
  - Sift filter improvements for caption/summary buttons

### Changed - iOS Mobile Optimization (2025-01)

- **Touch Event Optimization**:
  - Replaced `onClick` with `onPointerDown` for immediate tap detection
  - Added `touch-action: manipulation` to remove 300ms delay
  - Active state visual feedback (`active:scale-95`)
  - Increased touch targets to 44px minimum
- **Viewport Improvements**:
  - Modern mobile viewport with `viewport-fit=cover`
  - Dynamic viewport height units (`100dvh`) for Safari stability
  - Safe-area-inset support for notches and home indicators
  - Prevented iOS text size adjustment
- **Bottom Navigation Enhancements**:
  - Stable placement during Safari toolbar transitions
  - Proper safe-area-inset-bottom padding
  - Height increased to 80px for better touch targets
  - No layout shifts during navigation
- **Carousel & Scroll Optimization**:
  - `touch-pan-x` for proper horizontal scrolling
  - `overscrollBehaviorX: 'contain'` to prevent page scroll conflicts
  - Smooth momentum scrolling with `-webkit-overflow-scrolling: touch`
  - Clear gesture intent (vertical vs horizontal)
- **Input Focus Prevention**:
  - Minimum 16px font size on inputs to prevent auto-zoom
  - Better mobile form experience

### Changed - Media System Improvements (2025-01)

- **Media Deletion Cleanup**:
  - Automatic AI metadata cleanup when media is deleted
  - Thumbnail auto-reselection when current thumbnail is removed
  - Removes orphaned captions, summaries, and transcripts
  - Works in both detail view and edit form
- **Order Preservation Fixes**:
  - Removed `.sort()` from dirty detection in artifact forms
  - Media arrays maintain user's insertion order
  - No automatic type-based sorting
  - Stable URL-based keys in all media lists

### Fixed - Critical Bugs (2025-01)

- **Duplicate Images Bug** (Nov 2025):
  - Fixed React hydration error (#418) in `artifact-swipe-wrapper.tsx`
  - Moved `localStorage` access from initial render to `useEffect`
  - Prevented server/client HTML mismatch
  - Fixed duplicate image display after creation
- **Thumbnail Validation**:
  - Auto-reselect valid thumbnail when current thumbnail is deleted
  - Falls back to `getPrimaryVisualMediaUrl()` for selection
  - Handles audio-only artifacts with proper placeholder
- **AI Data Cleanup**:
  - Removes orphaned AI metadata when media is deleted
  - Cleans up `image_captions`, `video_summaries`, `audio_transcripts`
  - Prevents JSONB bloat from deleted media
- **Hydration Errors**:
  - Documented prevention guidelines
  - Never access browser APIs during initial render
  - Always use `useEffect` for client-side-only code
  - Server-safe defaults in `useState`

### Technical - Infrastructure (2025-01)

- **Navigation System**:
  - Responsive breakpoint at 1024px (lg)
  - Bottom nav for mobile/tablet (<1024px)
  - Top nav for desktop (≥1024px)
  - Zero DOM presence on desktop (conditionally rendered)
  - Safe-area support for iOS/Android
  - Analytics tracking (`nav_bottom_click` events)
- **Component Architecture**:
  - Server actions for database operations
  - Zod schemas for all validation
  - Client/server component separation
  - Slug generation with collision handling
  - Row-level security (RLS) on all tables

---

## [0.1.0] - Initial Development

### Added - Core Features

- **Bottom Navigation for Mobile/Tablet**: Implemented responsive bottom navigation bar for viewports below 1024px (lg breakpoint)
  - Fixed bottom bar with 5 primary navigation items (Home, Collections, Artifacts, Stories, Profile)
  - Icon + label design with minimum 44px tap targets for accessibility
  - Active route highlighting with exact and nested path matching
  - Safe-area inset support for iOS home indicators and Android gesture navigation
  - Analytics tracking for navigation clicks (`nav_bottom_click` event)
  - Backdrop blur effect with subtle border styling
  - Zero DOM presence on desktop (conditionally rendered, not just hidden)
- **Navigation Documentation**: Added comprehensive navigation system documentation
  - Breakpoint behavior and usage guidelines
  - Instructions for adding new navigation items
  - Safe-area handling details
  - Page-level bottom padding escape hatch

### Changed

- **Top Navigation**: Now hidden on mobile/tablet (<1024px) and visible only on desktop (≥1024px)
- **Layout System**: Updated `AppLayout` component with responsive bottom padding
  - Automatic bottom padding on mobile to prevent content overlap with BottomNav
  - Optional `noBottomPadding` prop for pages with custom footers
  - CSS variable `--bottom-nav-height` for consistent spacing (80px)

### Technical

- Component location: `components/navigation/bottom-nav.tsx`
- Uses `usePathname()` hook for client-side active state detection
- Leverages Tailwind's `lg:` breakpoint for responsive behavior
- Custom hook `useIsMobile()` for conditional rendering based on viewport width

---

## Future Phases (Planned)

### Testing - Phases 4-6
- [ ] Phase 4: Integration tests (100-120 tests) - API routes and workflows
- [ ] Phase 5: E2E tests (50-80 tests) - Complete user flows
- [ ] Phase 6: CI/CD pipeline - GitHub Actions automation

### Features
- [ ] Artifact gallery with horizontal carousel (see `docs/planning/artifact-gallery.md`)
- [ ] Video frame extraction and analysis
- [ ] Batch AI processing
- [ ] Export/import functionality
- [ ] Real-time collaboration
- [ ] Custom domain support

### Architecture
- [ ] Implement hybrid ID + slug URL routing (see `ARCHITECTURE.md`)
- [ ] Collection privacy enhancements
- [ ] User profile URL structure

---

**Current Status**: Active development
**Test Coverage**: 66% (target: 80%+)
**Tests Passing**: 112/169
**Production Status**: Pre-release

[Unreleased]: https://github.com/phlojo/heirlooms-v0/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/phlojo/heirlooms-v0/releases/tag/v0.1.0
