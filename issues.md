# Issues & Risks — React PDF Annotator

All issues resolved and verified (rodney on system Chrome 149 + pdfjs/pdf-lib node read-back).

## Functional bugs

- [x] **Coordinate unit mismatch.** `PDFViewer.handleCanvasClick` stored screen px instead of unscaled PDF points. **Fixed:** divide by `scale` (`src/components/PDFViewer.tsx`). Verified: clicking the same visual spot at 1× and 2× both store ≈ (150, 200); buggy version jumped to (600, 799) at 2×.
- [x] **Save ignored font family / horizontal alignment.** **Fixed:** `savePDF` now embeds the matching StandardFont (Arial/Georgia→fallback) per annotation and uses `font.widthOfTextAtSize()` to compute true left/center/right x. Verified via pdfjs read-back: annotation text renders as `monospace` (Courier) vs original `sans-serif`; all three alignments measured — left 107.5≈108, center 149.1≈149.6, right 190.7≈191.2.
- [x] **Vertical alignment math was heuristic.** **Fixed:** rewrote baseline math from ascent/descent (0.8/0.2·fontSize). Verified: all three positions measured — top 723.3≈722.8, middle 708.3≈707.8, bottom 693.3≈692.8.

## Code quality

- [x] **Leftover `console.log` in `TextAnnotation.tsx`** ran every render. Removed.
- [x] **`updateAnnotationTemporary` unused.** Removed (its role is now covered by the debounced `updateAnnotation`).
- [x] **`history.present` duplicated `annotations`.** Removed from type and all writes; components only read `past`/`future`.
- [x] **IDs used `Date.now()` (collision risk).** Switched to `crypto.randomUUID()` with a fallback. Verified: two annotations added back-to-back produce two distinct elements.
- [x] **PDF.js worker loaded from CDN.** Now bundled locally (`pdfjs-dist/build/pdf.worker.min.mjs?url`); build emits a local `pdf.worker.min-*.mjs` chunk.
- [x] **`ne`/`nw` resize handles overlapped delete/move handles (margin hack).** Reworked: top handles sit along the top edge inset via explicit `left/right: 24px`; bottom handles at the corners. Verified via screenshot — no overlap.
- [x] **Every PropertyPanel keystroke pushed a history entry.** `updateAnnotation` now updates live but debounces the history commit (400 ms, capturing the pre-burst snapshot). Verified: 3 rapid X edits (200→50→60→70) collapsed into one undo step back to 200.
- [x] **`deleteAnnotation` issued two `setPDFState` calls.** Rewritten as a single update. Verified: select + delete removes the annotation (2→1) and clears selection.
