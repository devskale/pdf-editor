import { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFFont, StandardFonts } from 'pdf-lib';
import { Annotation, PDFState } from '../types';
// Bundle the PDF.js worker locally (no CDN) for v6 compatibility.
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ALLOWED_FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

// Visual padding (PDF points) mirroring the `p-2` padding used on screen so the
// saved layout matches what the user sees.
const PAD = 8;
// Typical ascent/descent ratio for the standard fonts (good enough for layout).
const ASCENT = 0.8;
const DESCENT = 0.2;

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16) / 255,
  g: parseInt(hex.slice(3, 5), 16) / 255,
  b: parseInt(hex.slice(5, 7), 16) / 255,
});

export const usePDFEditor = () => {
  const [pdfState, setPDFState] = useState<PDFState>({
    document: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1,
    annotations: [],
    selectedAnnotation: null,
    history: {
      past: [],
      future: []
    }
  });

  const fileRef = useRef<ArrayBuffer | null>(null);
  const originalFileNameRef = useRef<string>('document.pdf');

  // --- History bookkeeping -------------------------------------------------
  // `updateAnnotation` debounces history commits so that rapid edits (typing in
  // the property panel, dragging) collapse into a single undoable entry. The
  // pre-edit snapshot is captured at the start of an edit burst so undo restores
  // the value from before the burst.
  const preEditSnapshotRef = useRef<Annotation[] | null>(null);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushHistory = useCallback(() => {
    if (historyTimerRef.current === null) return;
    clearTimeout(historyTimerRef.current);
    historyTimerRef.current = null;
    const snapshot = preEditSnapshotRef.current;
    preEditSnapshotRef.current = null;
    if (!snapshot) return;
    setPDFState(prev => ({
      ...prev,
      history: { past: [...prev.history.past, snapshot], future: [] },
    }));
  }, []);

  // Immediate (non-debounced) commit, used by add/delete/copy.
  const commitHistory = useCallback((newAnnotations: Annotation[]) => {
    setPDFState(prev => ({
      ...prev,
      annotations: newAnnotations,
      history: {
        past: [...prev.history.past, prev.annotations],
        future: []
      }
    }));
  }, []);

  const loadPDF = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Store a copy of the ArrayBuffer to prevent detachment issues
      fileRef.current = arrayBuffer.slice(0);
      originalFileNameRef.current = file.name;

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      setPDFState(prev => ({
        ...prev,
        document: pdf,
        totalPages: pdf.numPages,
        currentPage: 1,
        annotations: [],
        selectedAnnotation: null,
        history: {
          past: [],
          future: []
        }
      }));
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw error;
    }
  }, []);

  const addAnnotation = useCallback((x: number, y: number) => {
    flushHistory();
    const newAnnotation: Annotation = {
      id: genId(),
      type: 'textbox',
      x,
      y,
      width: 200,
      height: 60,
      text: 'Type here...',
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      verticalAlign: 'top',
      page: pdfState.currentPage
    };

    commitHistory([...pdfState.annotations, newAnnotation]);
  }, [pdfState.annotations, pdfState.currentPage, flushHistory, commitHistory]);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    // Live update (immediate, so the canvas/inputs reflect changes instantly).
    setPDFState(prev => ({
      ...prev,
      annotations: prev.annotations.map(ann =>
        ann.id === id ? { ...ann, ...updates } : ann
      )
    }));

    // Capture the pre-edit snapshot once per burst (uses the value from before
    // this edit because the functional update above has not flushed yet).
    if (preEditSnapshotRef.current === null) {
      preEditSnapshotRef.current = pdfState.annotations;
    }

    // Debounce the history commit so a burst of edits = one undo entry.
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      historyTimerRef.current = null;
      const snapshot = preEditSnapshotRef.current;
      preEditSnapshotRef.current = null;
      if (!snapshot) return;
      setPDFState(prev => ({
        ...prev,
        history: { past: [...prev.history.past, snapshot], future: [] },
      }));
    }, 400);
  }, [pdfState.annotations]);

  const deleteAnnotation = useCallback((id: string) => {
    flushHistory();
    // Single state update: remove the annotation, clear selection if needed,
    // and record history in one pass.
    setPDFState(prev => {
      const newAnnotations = prev.annotations.filter(ann => ann.id !== id);
      const selected =
        prev.selectedAnnotation === id ? null : prev.selectedAnnotation;
      return {
        ...prev,
        annotations: newAnnotations,
        selectedAnnotation: selected,
        history: {
          past: [...prev.history.past, prev.annotations],
          future: []
        }
      };
    });
  }, [flushHistory]);

  const selectAnnotation = useCallback((id: string | null) => {
    setPDFState(prev => ({ ...prev, selectedAnnotation: id }));
  }, []);

  const copyAnnotation = useCallback(() => {
    if (!pdfState.selectedAnnotation) return;

    const selected = pdfState.annotations.find(
      (ann) => ann.id === pdfState.selectedAnnotation
    );
    if (!selected) return;

    flushHistory();
    const newAnnotation: Annotation = {
      ...selected,
      id: genId(),
      x: selected.x + 10,
      y: selected.y + 10,
    };

    commitHistory([...pdfState.annotations, newAnnotation]);
    selectAnnotation(newAnnotation.id);
  }, [pdfState.annotations, pdfState.selectedAnnotation, flushHistory, commitHistory, selectAnnotation]);

  const setCurrentPage = useCallback((page: number) => {
    setPDFState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setPDFState(prev => ({ ...prev, scale: Math.max(0.5, Math.min(3, scale)) }));
  }, []);

  const undo = useCallback(() => {
    flushHistory();
    setPDFState(prev => {
      if (prev.history.past.length === 0) return prev;

      const previous = prev.history.past[prev.history.past.length - 1];

      return {
        ...prev,
        annotations: previous,
        history: {
          past: prev.history.past.slice(0, prev.history.past.length - 1),
          future: [prev.annotations, ...prev.history.future]
        }
      };
    });
  }, [flushHistory]);

  const redo = useCallback(() => {
    flushHistory();
    setPDFState(prev => {
      if (prev.history.future.length === 0) return prev;

      const next = prev.history.future[0];

      return {
        ...prev,
        annotations: next,
        history: {
          past: [...prev.history.past, prev.annotations],
          future: prev.history.future.slice(1)
        }
      };
    });
  }, [flushHistory]);

  const savePDF = useCallback(async () => {
    if (!fileRef.current) {
      alert('No PDF loaded to save');
      return;
    }

    try {
      // Lazy-load pdf-lib (only needed when saving) to keep it out of the main bundle.
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const FONT_MAP: Record<string, StandardFonts> = {
        Helvetica: StandardFonts.Helvetica,
        Arial: StandardFonts.Helvetica,
        'Times New Roman': StandardFonts.TimesRoman,
        'Courier New': StandardFonts.Courier,
        Georgia: StandardFonts.TimesRoman,
      };
      const colorOf = (hex: string) => {
        const c = hexToRgb(hex);
        return rgb(c.r, c.g, c.b);
      };
      const freshArrayBuffer = fileRef.current.slice(0);
      const pdfDoc = await PDFDocument.load(freshArrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      // Embed each unique font once.
      const fontCache: Partial<Record<StandardFonts, PDFFont>> = {};
      const getFont = async (family: string): Promise<PDFFont> => {
        const std = FONT_MAP[family] ?? StandardFonts.Helvetica;
        if (!fontCache[std]) {
          fontCache[std] = await pdfDoc.embedFont(std);
        }
        return fontCache[std]!;
      };

      for (const annotation of pdfState.annotations) {
        const page = pages[annotation.page - 1];
        if (!page) continue;

        const { height: pageHeight } = page.getSize();

        // Annotation coords are top-left, unscaled PDF points. Convert to
        // pdf-lib's bottom-left origin.
        const pdfX = annotation.x;
        const pdfY = pageHeight - annotation.y - annotation.height;
        const boxW = annotation.width;
        const boxH = annotation.height;

        if (annotation.backgroundColor && annotation.backgroundColor !== 'transparent') {
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: boxW,
            height: boxH,
            color: colorOf(annotation.backgroundColor),
          });
        }

        const text = annotation.text;
        if (!text.trim()) continue;

        const fontSize = ALLOWED_FONT_SIZES.includes(annotation.fontSize)
          ? annotation.fontSize
          : 14;
        const font = await getFont(annotation.fontFamily);
        const color = colorOf(annotation.color);

        const lineHeight = fontSize * 1.2;
        const ascent = fontSize * ASCENT;
        const descent = fontSize * DESCENT;

        const lines = text.split('\n');
        const n = lines.length;
        const blockHeight = (n - 1) * lineHeight + ascent + descent;

        const innerTop = pdfY + boxH - PAD;
        const innerBottom = pdfY + PAD;

        // Baseline of the first (top) line, depending on vertical alignment.
        let firstBaseline: number;
        switch (annotation.verticalAlign) {
          case 'middle':
            firstBaseline = (innerTop + innerBottom) / 2 + blockHeight / 2 - ascent;
            break;
          case 'bottom':
            firstBaseline = innerBottom + descent + (n - 1) * lineHeight;
            break;
          case 'top':
          default:
            firstBaseline = innerTop - ascent;
            break;
        }

        lines.forEach((line, index) => {
          const baseline = firstBaseline - index * lineHeight;

          let textX: number;
          if (line.trim() === '') return;
          const textWidth = font.widthOfTextAtSize(line, fontSize);
          switch (annotation.textAlign) {
            case 'center':
              textX = pdfX + (boxW - textWidth) / 2;
              break;
            case 'right':
              textX = pdfX + boxW - PAD - textWidth;
              break;
            case 'left':
            default:
              textX = pdfX + PAD;
              break;
          }

          page.drawText(line, {
            x: textX,
            y: baseline,
            size: fontSize,
            font,
            color,
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = originalFileNameRef.current.replace(/\.pdf$/i, '');
      const fileName = `${baseName}_annotated.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving PDF:', error, (error as Error).stack);
      alert('Failed to save PDF. Please try again.');
    }
  }, [pdfState.annotations]);

  return {
    pdfState,
    loadPDF,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    copyAnnotation,
    selectAnnotation,
    setCurrentPage,
    setScale,
    undo,
    redo,
    savePDF
  };
};
