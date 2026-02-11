# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 viewer component for MulmoCast presentations. Published to npm as `mulmocast-viewer`. Provides both a standalone app and a library for embedding MulmoCast content.

## Commands

```bash
yarn dev          # Start Vite dev server (app mode)
yarn build        # Build app and library
yarn build:app    # Build standalone app (vue-tsc + vite)
yarn build:lib    # Build library for distribution
yarn preview      # Preview built app
yarn lint         # Run ESLint on src/ (with --fix)
yarn format       # Format with Prettier
yarn format:check # Check formatting without fixing
```

No test suite exists yet.

## Architecture

- Vue 3 + Vite + TypeScript + Tailwind CSS v4
- Dual build: app (`vite.app.ts`) and library (`vite.lib.ts`)
- `src/components/` - Vue components
- `src/views/` - Page views
- `src/lib/` - Library types (`ViewerData`, `BundleItem`)
- `src/index.ts` - Library entry point (exports `MulmoViewer`, `SelectLanguage`, `MulmoViewerHeader`, `BeatGridView`, `BeatListView`)
- `src/router.ts` - Vue Router configuration
- `src/i18n.ts` - Internationalization (vue-i18n)
- Uses Vue Composition API

## CI

GitHub Actions (`.github/workflows/pull_request.yaml`): runs on PR to main and push to main. Matrix: ubuntu/macos/windows x Node 22/24. Steps: install, format, lint, build.
