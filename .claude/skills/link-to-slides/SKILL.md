---
name: link-to-slides
description: Build mulmocast-viewer and rebuild MulmoCast-Slides Vue app for local verification. Use when testing viewer changes locally with MulmoCast-Slides.
---

# Link to MulmoCast-Slides

Build mulmocast-viewer library and rebuild MulmoCast-Slides' Vue app so that `yarn preview` reflects the latest viewer changes.

## Steps

1. Build mulmocast-viewer:
   ```bash
   npm run build
   ```

2. Set up yarn link (if not already linked):
   ```bash
   yarn link
   ```

3. Link in MulmoCast-Slides and rebuild:
   ```bash
   SLIDES_DIR="${MULMOCAST_SLIDES_DIR:?MULMOCAST_SLIDES_DIR is not set}"
   cd "$SLIDES_DIR" && yarn link mulmocast-viewer && yarn build:vue
   ```

4. Report the result. Remind the user to restart `yarn preview` if it's already running.

## Important

- `yarn preview` in MulmoCast-Slides serves pre-built files from `lib/vue/`. It does NOT hot-reload linked packages.
- Every viewer change requires both `npm run build` (viewer) and `yarn build:vue` (Slides).
