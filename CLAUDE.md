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

## Local Verification (with MulmoCast-Slides)

1. Build this repo: `npm run build`
2. Register link (first time only): `yarn link`
3. In MulmoCast-Slides: `yarn link mulmocast-viewer`
4. In MulmoCast-Slides: `yarn build:vue` (regenerates `lib/vue/`)
5. In MulmoCast-Slides: `yarn preview`

**Note:** `yarn preview` in MulmoCast-Slides serves pre-built files from `lib/vue/`, NOT a Vite dev server. You must run `yarn build:vue` after every viewer change for it to take effect.

To unlink: `yarn unlink mulmocast-viewer && yarn install --force` in MulmoCast-Slides.

## Known Issues

- `vite-plugin-dts` requires `entities@^4.5.0` but Vue pulls in `entities@7`. Pinning `entities@4` in devDependencies resolves the `build:lib` error.

## CI

GitHub Actions (`.github/workflows/pull_request.yaml`): runs on PR to main and push to main. Matrix: ubuntu/macos/windows x Node 22/24. Steps: install, format, lint, build.
