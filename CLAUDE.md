# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 viewer component for MulmoCast presentations. Provides both a standalone app and a library for embedding MulmoCast content.

## Commands

```bash
yarn dev        # Start Vite dev server (app mode)
yarn build      # Build app and library
yarn build:app  # Build standalone app (vue-tsc + vite)
yarn build:lib  # Build library for distribution
yarn lint       # Run ESLint on src/ (with --fix)
yarn format     # Format with Prettier
```

## Architecture

- Vue 3 + Vite + TypeScript
- Dual build: app (vite.app.ts) and library (vite.lib.ts)
- `src/components/` - Vue components
- `src/views/` - Page views
- `src/lib/` - Library exports
- `src/router.ts` - Vue Router configuration
- `src/i18n.ts` - Internationalization
- Uses Vue Composition API
