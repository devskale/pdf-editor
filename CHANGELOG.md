# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.0.0] - 2026-07-07

First tagged release. All 11 review issues resolved and verified — see
[`issues.md`](./issues.md) for details.

### Added
- `issues.md` tracking each issue and how it was verified.
- This changelog.

### Changed
- **Deps → latest:** React 18 → 19, pdfjs-dist 3 → 6, Vite 5 → 8, Tailwind 3 → 4, TypeScript 5 → 6, ESLint 9 → 10, lucide-react 0.3 → 1.
- **Package manager:** npm → pnpm (added `pnpm-lock.yaml`, removed `package-lock.json`).
- **Tailwind v4:** `@tailwindcss/postcss` plugin + `@import "tailwindcss"`; dropped the JS config.
- **Save PDF:** embed the selected font per annotation and compute true left/center/right alignment via `font.widthOfTextAtSize()`; correct top/middle/bottom baseline math.
- **Undo history:** `updateAnnotation` updates live but debounces history commits (400 ms) so rapid edits collapse into one undo step.
- `deleteAnnotation` rewritten as a single state update.
- Annotation ids now use `crypto.randomUUID()` (was `Date.now()`).
- `ne`/`nw` resize handles moved along the top edge so they no longer overlap the delete/move handles.

### Fixed
- **#1** Annotation coordinates are stored as unscaled PDF points, so placement and saving are correct at any zoom level (previously click coords were stored as screen pixels, mis-placing annotations at zoom ≠ 100% and on save).
- **#2** Saved PDF now honors the selected font family and horizontal text alignment (left/center/right).
- **#3** Vertical text alignment in the saved PDF now matches the on-screen layout (top/middle/bottom).
- **#9** Resize handles no longer overlap the delete/move handles.

### Removed
- Per-render `console.log` in `TextAnnotation`.
- Unused `updateAnnotationTemporary` hook method.
- Redundant `history.present` field.
- `dist/` removed from version control (already gitignored).
- `tailwind.config.js` (Tailwind v4 uses CSS-first config).

### Infrastructure
- pdf.js worker is now bundled locally instead of loaded from a CDN (`#8`).

[Unreleased]: https://github.com/devskale/pdf-editor/compare/v1.0.0...HEAD
[v1.0.0]: https://github.com/devskale/pdf-editor/releases/tag/v1.0.0
