// Pure layout + coordinate math for saving text annotations into the PDF.
//
// DOM-free and pdf-lib-free (plain string font keys) so it stays unit-testable
// — savePDF consumes these functions; the formulas mirror the inline versions
// that shipped with v1 (behaviour preserved, see tests).

export const ALLOWED_FONT_SIZES: readonly number[] = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
export const DEFAULT_FONT_SIZE = 14;

/** Visual padding (PDF points), mirrors the on-screen `p-2` box padding. */
export const PAD = 8;
/** Typical ascent/descent ratio for the standard fonts (layout-grade accuracy). */
export const ASCENT = 0.8;
export const DESCENT = 0.2;
export const LINE_HEIGHT = 1.2;

export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type TextAlign = 'left' | 'center' | 'right';

/** Only toolbar-sanitized sizes are honored; anything else falls back to 14. */
export function sanitizeFontSize(size: number): number {
  return ALLOWED_FONT_SIZES.includes(size) ? size : DEFAULT_FONT_SIZE;
}

export function lineHeightFor(fontSize: number): number {
  return fontSize * LINE_HEIGHT;
}

/** Total height of a text block: (n-1) line gaps + one ascent + one descent. */
export function blockHeight(lineCount: number, fontSize: number): number {
  return (lineCount - 1) * lineHeightFor(fontSize) + fontSize * ASCENT + fontSize * DESCENT;
}

/**
 * Baseline (pdf-lib bottom-left origin) of the FIRST text line, depending on
 * vertical alignment within the annotation box.
 */
export function firstBaselineFor(
  verticalAlign: VerticalAlign,
  pdfY: number,
  boxH: number,
  lineCount: number,
  fontSize: number
): number {
  const innerTop = pdfY + boxH - PAD;
  const innerBottom = pdfY + PAD;
  const ascent = fontSize * ASCENT;
  const descent = fontSize * DESCENT;
  const lh = lineHeightFor(fontSize);
  const bh = blockHeight(lineCount, fontSize);

  switch (verticalAlign) {
    case 'middle':
      return (innerTop + innerBottom) / 2 + bh / 2 - ascent;
    case 'bottom':
      return innerBottom + descent + (lineCount - 1) * lh;
    case 'top':
    default:
      return innerTop - ascent;
  }
}

/** X position of one rendered line, honoring horizontal alignment + padding. */
export function textXFor(
  align: TextAlign,
  pdfX: number,
  boxW: number,
  textWidth: number
): number {
  switch (align) {
    case 'center':
      return pdfX + (boxW - textWidth) / 2;
    case 'right':
      return pdfX + boxW - PAD - textWidth;
    case 'left':
    default:
      return pdfX + PAD;
  }
}

/** Annotation coords are top-left origin; pdf-lib expects bottom-left. */
export function annotationYToLibY(pageHeight: number, annotationY: number, boxH: number): number {
  return pageHeight - annotationY - boxH;
}

/** Screen pixels → unscaled PDF points (PDFViewer stores coords unscaled). */
export function screenToPdf(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number },
  scale: number
): { x: number; y: number } {
  return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
}

/** Font-family → pdf-lib standard font VALUE string (hook maps to the enum). */
export const FONT_FAMILY_MAP: Record<string, string> = {
  Helvetica: 'Helvetica',
  Arial: 'Helvetica',
  'Times New Roman': 'TimesRoman',
  Courier: 'Courier',
  'Courier New': 'Courier',
  Georgia: 'TimesRoman',
};

export function fontKeyFor(family: string): string {
  return FONT_FAMILY_MAP[family] ?? 'Helvetica';
}

/** '#rrggbb' → 0..1 rgb triple (pdf-lib rgb() takes normalized channels). */
export function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}
