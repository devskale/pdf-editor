import { describe, it, expect } from 'vitest';
import {
  PAD, ALLOWED_FONT_SIZES,
  sanitizeFontSize, lineHeightFor, blockHeight, firstBaselineFor, textXFor,
  annotationYToLibY, screenToPdf, fontKeyFor, hexToRgb01,
} from './pdfLayout';

// Layout math mirrors the inline v1 formulas 1:1 (behaviour preservation).

describe('sanitizeFontSize', () => {
  it('keeps allowed sizes', () => {
    for (const s of ALLOWED_FONT_SIZES) expect(sanitizeFontSize(s)).toBe(s);
  });
  it('falls back to 14 for disallowed sizes', () => {
    expect(sanitizeFontSize(13)).toBe(14);
    expect(sanitizeFontSize(0)).toBe(14);
    expect(sanitizeFontSize(99)).toBe(14);
  });
});

describe('lineHeight / blockHeight', () => {
  it('lineHeight is 1.2×fontSize', () => {
    expect(lineHeightFor(10)).toBeCloseTo(12);
  });
  it('single line = ascent + descent', () => {
    expect(blockHeight(1, 10)).toBeCloseTo(10);
  });
  it('adds one line gap per extra line', () => {
    expect(blockHeight(3, 10)).toBeCloseTo(2 * 12 + 10);
  });
});

describe('firstBaselineFor', () => {
  // box: pdfY=100, height=50 → innerTop=142, innerBottom=108; fontSize 10,
  // ascent 8, descent 2, lineHeight 12, two lines → bh = 12+10 = 22.
  const Y = 100, H = 50, N = 2, F = 10;

  it('top: innerTop − ascent', () => {
    expect(firstBaselineFor('top', Y, H, N, F)).toBeCloseTo(142 - 8);
  });
  it('bottom: innerBottom + descent + (n−1)·lineHeight', () => {
    expect(firstBaselineFor('bottom', Y, H, N, F)).toBeCloseTo(108 + 2 + 12);
  });
  it('middle: centers the block between inner edges', () => {
    const expected = (142 + 108) / 2 + 22 / 2 - 8;
    expect(firstBaselineFor('middle', Y, H, N, F)).toBeCloseTo(expected);
  });
  it('descends one lineHeight per following line', () => {
    const first = firstBaselineFor('top', Y, H, N, F);
    const second = firstBaselineFor('top', Y, H, N, F) - lineHeightFor(F);
    expect(second).toBeCloseTo(first - 12);
  });
});

describe('textXFor', () => {
  const X = 50, W = 200, TW = 60;

  it('left pads by PAD', () => {
    expect(textXFor('left', X, W, TW)).toBe(X + PAD);
  });
  it('center centers the line within the box', () => {
    expect(textXFor('center', X, W, TW)).toBe(X + (W - TW) / 2);
  });
  it('right pads from the box edge', () => {
    expect(textXFor('right', X, W, TW)).toBe(X + W - PAD - TW);
  });
});

describe('coordinate conversion', () => {
  it('annotationYToLibY flips top-left to bottom-left origin', () => {
    // page height 842, box at y=100, h=50 → lib y = 842−100−50
    expect(annotationYToLibY(842, 100, 50)).toBe(692);
  });
  it('screenToPdf divides by scale', () => {
    expect(screenToPdf(110, 220, { left: 10, top: 20 }, 2)).toEqual({ x: 50, y: 100 });
  });
  it('screenToPdf at scale 1 is an offset-only transform', () => {
    expect(screenToPdf(30, 40, { left: 10, top: 20 }, 1)).toEqual({ x: 20, y: 20 });
  });
});

describe('fontKeyFor', () => {
  it('maps alias families to standard fonts', () => {
    expect(fontKeyFor('Arial')).toBe('Helvetica');
    expect(fontKeyFor('Georgia')).toBe('TimesRoman');
    expect(fontKeyFor('Courier New')).toBe('Courier');
  });
  it('falls back to Helvetica for unknown families', () => {
    expect(fontKeyFor('Comic Sans')).toBe('Helvetica');
  });
});

describe('hexToRgb01', () => {
  it('normalizes channels to 0..1', () => {
    expect(hexToRgb01('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb01('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
    expect(hexToRgb01('#ff0000')).toEqual({ r: 1, g: 0, b: 0 });
  });
  it('mid-gray channels round-trip through rgb()', () => {
    const c = hexToRgb01('#808080');
    expect(c.r).toBeCloseTo(128 / 255);
  });
});
