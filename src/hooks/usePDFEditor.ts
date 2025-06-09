import { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { Annotation, PDFState } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const ALLOWED_FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

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
      present: [],
      future: []
    }
  });

  const fileRef = useRef<ArrayBuffer | null>(null);
  const originalFileNameRef = useRef<string>('document.pdf');

  const updateHistory = useCallback((newAnnotations: Annotation[]) => {
    setPDFState(prev => ({
      ...prev,
      annotations: newAnnotations,
      history: {
        past: [...prev.history.past, prev.annotations],
        present: newAnnotations,
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
          present: [],
          future: []
        }
      }));
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw error;
    }
  }, []);

  const addAnnotation = useCallback((x: number, y: number) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
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

    const newAnnotations = [...pdfState.annotations, newAnnotation];
    updateHistory(newAnnotations);
  }, [pdfState.annotations, pdfState.currentPage, updateHistory]);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    const newAnnotations = pdfState.annotations.map(ann =>
      ann.id === id ? { ...ann, ...updates } : ann
    );
    updateHistory(newAnnotations);
  }, [pdfState.annotations, updateHistory]);

  // Add a method for temporary updates that don't affect history
  const updateAnnotationTemporary = useCallback((id: string, updates: Partial<Annotation>) => {
    setPDFState(prev => ({
      ...prev,
      annotations: prev.annotations.map(ann =>
        ann.id === id ? { ...ann, ...updates } : ann
      )
    }));
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    const newAnnotations = pdfState.annotations.filter(ann => ann.id !== id);
    updateHistory(newAnnotations);
    
    if (pdfState.selectedAnnotation === id) {
      setPDFState(prev => ({ ...prev, selectedAnnotation: null }));
    }
  }, [pdfState.annotations, pdfState.selectedAnnotation, updateHistory]);

  const selectAnnotation = useCallback((id: string | null) => {
    setPDFState(prev => ({ ...prev, selectedAnnotation: id }));
  }, []);

  const copyAnnotation = useCallback(() => {
    if (!pdfState.selectedAnnotation) return;

    const selected = pdfState.annotations.find(
      (ann) => ann.id === pdfState.selectedAnnotation
    );

    if (selected) {
      const newAnnotation: Annotation = {
        ...selected,
        id: Date.now().toString(), // Generate a new unique ID
        // Optionally offset the copy slightly so it's visible
        x: selected.x + 10,
        y: selected.y + 10,
      };

      const newAnnotations = [...pdfState.annotations, newAnnotation];
      updateHistory(newAnnotations);
      selectAnnotation(newAnnotation.id); // Select the newly created copy
    }
  }, [pdfState.annotations, pdfState.selectedAnnotation, updateHistory, selectAnnotation]);

  const setCurrentPage = useCallback((page: number) => {
    setPDFState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setPDFState(prev => ({ ...prev, scale: Math.max(0.5, Math.min(3, scale)) }));
  }, []);

  const undo = useCallback(() => {
    setPDFState(prev => {
      if (prev.history.past.length === 0) return prev;
      
      const previous = prev.history.past[prev.history.past.length - 1];
      const newPast = prev.history.past.slice(0, prev.history.past.length - 1);
      
      return {
        ...prev,
        annotations: previous,
        history: {
          past: newPast,
          present: previous,
          future: [prev.annotations, ...prev.history.future]
        }
      };
    });
  }, []);

  const redo = useCallback(() => {
    setPDFState(prev => {
      if (prev.history.future.length === 0) return prev;
      
      const next = prev.history.future[0];
      const newFuture = prev.history.future.slice(1);
      
      return {
        ...prev,
        annotations: next,
        history: {
          past: [...prev.history.past, prev.annotations],
          present: next,
          future: newFuture
        }
      };
    });
  }, []);

  const savePDF = useCallback(async () => {
    if (!fileRef.current) {
      alert('No PDF loaded to save');
      return;
    }

    try {
      const freshArrayBuffer = fileRef.current.slice(0);
      const pdfDoc = await PDFDocument.load(freshArrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      for (const annotation of pdfState.annotations) {
        const page = pages[annotation.page - 1];
        if (page) {
          const { width: pageWidth, height: pageHeight } = page.getSize();
          
          // Annotation coordinates (x, y) are assumed to be top-left, unscaled (PDF points)
          // PDF coordinates (pdfX, pdfY) for pdf-lib are bottom-left
          const pdfX = annotation.x; // Already unscaled
          const pdfY = pageHeight - annotation.y - annotation.height; // Convert top-left y and height to bottom-left y
          
          const unscaledWidth = annotation.width; // Already unscaled
          const unscaledHeight = annotation.height; // Already unscaled

          if (annotation.backgroundColor && annotation.backgroundColor !== 'transparent') {
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: unscaledWidth,
              height: unscaledHeight,
              color: hexToRgb(annotation.backgroundColor),
            });
          }
          
          if (annotation.text.trim()) {
            const validatedFontSize = ALLOWED_FONT_SIZES.includes(annotation.fontSize)
              ? annotation.fontSize
              : ALLOWED_FONT_SIZES.find(size => size === 14) || ALLOWED_FONT_SIZES[0];

            const lines = annotation.text.split('\n');
            const lineHeight = validatedFontSize * 1.2; 
            const totalTextHeight = lines.length * lineHeight;
            const boxHeight = unscaledHeight; // Use unscaled height for text box calculations
            
            let verticalOffset = 0;
            switch (annotation.verticalAlign) {
              case 'top':
                // Adjust padding if needed, assuming 20 was a scaled value, now it should be unscaled
                verticalOffset = boxHeight - (validatedFontSize * 1.2); // Example: offset by one line height from top
                break;
              case 'middle':
                verticalOffset = (boxHeight / 2) + (totalTextHeight / 2) - lineHeight; // This might need fine-tuning
                break;
              case 'bottom':
                 // Adjust padding if needed
                verticalOffset = totalTextHeight - (validatedFontSize * 0.2); // Example: small padding from bottom
                break;
            }
            
            lines.forEach((line, index) => {
              if (line.trim()) {
                let textX = pdfX + 5; // Small padding from left edge (PDF points)
                
                if (annotation.textAlign === 'center') {
                  // For pdf-lib, text alignment is often handled by adjusting x, not a text property
                  // This requires knowing the text width, which pdf-lib doesn't directly provide before drawing.
                  // A common approach is to use a font's advanceWidthOfText method if available, or approximate.
                  // For simplicity, let's assume text is drawn from its calculated x.
                  // If your font object (not shown here) can calculate text width:
                  // const textWidth = font.widthOfTextAtSize(line, validatedFontSize);
                  // textX = pdfX + (unscaledWidth - textWidth) / 2;
                  // If not, this might need a more complex solution or accept left-alignment for center/right in PDF.
                  // For now, we'll keep the previous logic which might not perfectly center/right align in all PDF viewers.
                  textX = pdfX + unscaledWidth / 2; // This positions the START of the text at the center of the box.
                                                    // True centering requires knowing text width.
                } else if (annotation.textAlign === 'right') {
                  // const textWidth = font.widthOfTextAtSize(line, validatedFontSize);
                  // textX = pdfX + unscaledWidth - textWidth - 5; // 5 for padding
                  textX = pdfX + unscaledWidth - 5; // This positions the START of the text near the right of the box.
                }
                
                page.drawText(line, {
                  x: textX,
                  y: pdfY + verticalOffset - (index * lineHeight), // pdfY is bottom of box, verticalOffset is from bottom of box
                  size: validatedFontSize,
                  color: hexToRgb(annotation.color),
                  // pdf-lib drawText does not have direct textAlign options like 'center' or 'right'.
                  // Alignment must be handled by calculating the 'x' coordinate.
                });
              }
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Generate filename
      const baseName = originalFileNameRef.current.replace('.pdf', '');
      const fileName = `${baseName}_annotated.pdf`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error saving PDF:', error, (error as Error).stack);
      alert('Failed to save PDF. Please try again.');
    }
  }, [pdfState.annotations, pdfState.scale]); // pdfState.scale is no longer used for geometry, but might be for other things. If not, remove.

  return {
    pdfState,
    loadPDF,
    addAnnotation,
    updateAnnotation,
    updateAnnotationTemporary,
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