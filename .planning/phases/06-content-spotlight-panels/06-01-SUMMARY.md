---
phase: 06-content-spotlight-panels
plan: 01
subsystem: ui
tags: [panel, ticker, hero-card, rss-feeds, sanitize, dom]

# Dependency graph
requires:
  - phase: 03-happy-variant-scaffold
    provides: Panel base class, happy variant infrastructure
  - phase: 02-content-pipeline
    provides: RSS feed configuration pattern, NewsItem type
provides:
  - BreakthroughsTickerPanel class for horizontal scrolling science ticker
  - HeroSpotlightPanel class for daily hero spotlight card with map integration
  - 4 additional science RSS feeds in HAPPY_FEEDS.science (5 total)
affects: [06-02-PLAN, 06-03-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns: [ticker-doubled-content-infinite-scroll, conditional-map-button-rendering, onLocationRequest-callback-pattern]

key-files:
  created:
    - src/components/BreakthroughsTickerPanel.ts
    - src/components/HeroSpotlightPanel.ts
  modified:
    - src/config/feeds.ts

key-decisions:
  - "Ticker uses doubled HTML content for seamless infinite CSS scroll -- no JS animation needed"
  - "Hero map button only renders when both lat AND lon are defined -- prevents broken map interactions"
  - "onLocationRequest callback pattern allows App.ts to wire map integration without tight coupling"

patterns-established:
  - "Content panels receive data via public setter methods (setItems/setHeroStory) -- wired by App.ts"
  - "Conditional UI elements (map button) gated on explicit undefined checks for both coordinates"

requirements-completed: [SCI-01, SCI-02, HERO-01, HERO-02, HERO-03]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 06 Plan 01: Content Spotlight Panels Summary

**BreakthroughsTickerPanel and HeroSpotlightPanel panel classes with 5 science RSS feeds for scrolling ticker and daily hero card display**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-23T09:35:31Z
- **Completed:** 2026-02-23T09:37:13Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created BreakthroughsTickerPanel with doubled-content infinite scroll and sanitized rendering
- Created HeroSpotlightPanel with image, source, title, time, and conditional map location button
- Expanded HAPPY_FEEDS.science from 1 feed to 5 feeds (ScienceDaily, Nature News, Live Science, New Scientist)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add science RSS feeds and create BreakthroughsTickerPanel** - `851fdeb` (feat)
2. **Task 2: Create HeroSpotlightPanel** - `beb1983` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `src/components/BreakthroughsTickerPanel.ts` - Horizontal scrolling ticker panel for science breakthroughs with doubled content for infinite scroll
- `src/components/HeroSpotlightPanel.ts` - Daily hero spotlight card with photo, title, source, time, and conditional map location button
- `src/config/feeds.ts` - Added 4 new science RSS feeds (ScienceDaily, Nature News, Live Science, New Scientist)

## Decisions Made
- Ticker uses doubled HTML content for seamless infinite CSS scroll -- no JS animation needed, CSS handles everything
- Hero map button only renders when both lat AND lon are defined -- prevents broken map interactions
- onLocationRequest callback pattern allows App.ts to wire map integration without tight coupling

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing type errors in GoodThingsDigestPanel.ts (out of scope, not caused by this plan's changes)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both panels ready for CSS styling (plan 06-02) and App.ts wiring (plan 06-03)
- Panels expose public setItems()/setHeroStory() methods for data injection
- HeroSpotlightPanel exposes onLocationRequest callback for map integration

## Self-Check: PASSED

All files exist. All commits verified.

---
*Phase: 06-content-spotlight-panels*
*Completed: 2026-02-23*
