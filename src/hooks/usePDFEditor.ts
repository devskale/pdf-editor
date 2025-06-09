import { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { Annotation, PDFState } from '../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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
      // Create a fresh copy of the ArrayBuffer to prevent detachment issues
      const freshArrayBuffer = fileRef.current.slice(0);
      const pdfDoc = await PDFDocument.load(freshArrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      // Helper function to convert hex color to RGB
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgb(r, g, b);
      };

      // Add annotations to PDF
      for (const annotation of pdfState.annotations) {
        const page = pages[annotation.page - 1];
        if (page) {
          const { width: pageWidth, height: pageHeight } = page.getSize();
          
          // Convert screen coordinates to PDF coordinates
          // PDF coordinates start from bottom-left, screen coordinates from top-left
          const pdfX = annotation.x / pdfState.scale;
          const pdfY = pageHeight - (annotation.y / pdfState.scale) - (annotation.height / pdfState.scale);
          
          // Always draw background rectangle (unless transparent)
          if (annotation.backgroundColor && annotation.backgroundColor !== 'transparent') {
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: annotation.width / pdfState.scale,
              height: annotation.height / pdfState.scale,
              color: hexToRgb(annotation.backgroundColor),
            });
          }
          
          // Draw text if it exists
          if (annotation.text.trim()) {
            // Split text into lines and draw each line
            const lines = annotation.text.split('\n');
            const lineHeight = annotation.fontSize * 1.2;
            const totalTextHeight = lines.length * lineHeight;
            const boxHeight = annotation.height / pdfState.scale;
            
            // Calculate vertical offset based on vertical alignment
            let verticalOffset = 0;
            switch (annotation.verticalAlign) {
              case 'top':
                verticalOffset = boxHeight - 20; // Start from top with padding
                break;
              case 'middle':
                verticalOffset = boxHeight / 2 + totalTextHeight / 2 - lineHeight;
                break;
              case 'bottom':
                verticalOffset = totalTextHeight - 5; // Start from bottom with padding
                break;
            }
            
            lines.forEach((line, index) => {
              if (line.trim()) {
                let textX = pdfX + 5; // Small padding from left edge
                
                // Handle horizontal text alignment
                if (annotation.textAlign === 'center') {
                  textX = pdfX + (annotation.width / pdfState.scale) / 2;
                } else if (annotation.textAlign === 'right') {
                  textX = pdfX + (annotation.width / pdfState.scale) - 5;
                }
                
                page.drawText(line, {
                  x: textX,
                  y: pdfY + verticalOffset - (index * lineHeight),
                  size: annotation.fontSize,
                  color: hexToRgb(annotation.color),
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
  }, [pdfState.annotations, pdfState.scale]);

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