import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { Annotation } from '../types';
import { TextAnnotation } from './TextAnnotation';

interface PDFViewerProps {
  document: PDFDocumentProxy;
  currentPage: number;
  scale: number;
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onAnnotationClick: (annotation: Annotation, event: React.MouseEvent) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  onCanvasClick: (x: number, y: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  document,
  currentPage,
  scale,
  annotations,
  selectedAnnotation,
  onAnnotationClick,
  onAnnotationUpdate,
  onAnnotationDelete,
  onCanvasClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const isRenderingRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const renderPage = async () => {
      if (!document || !canvasRef.current) return;

      // Cancel any existing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (isRenderingRef.current) {
        return; // Prevent multiple render calls
      }
      isRenderingRef.current = true;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        isRenderingRef.current = false;
        return;
      }
      const page = await document.getPage(currentPage);

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear the canvas context to ensure it's in a clean state
      context.clearRect(0, 0, canvas.width, canvas.height);

      setCanvasSize({ width: viewport.width, height: viewport.height });

      // Annotation geometry is stored unscaled (PDF points); visual scaling is
      // applied by TextAnnotation via the `scale` prop.

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      try {
        // Start rendering the page on the canvas
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (error) {
        // Ignore cancellation errors and re-throw others
        if (error.name !== 'RenderingCancelledException') {
          throw error;
        }
      } finally {
        renderTaskRef.current = null;
        isRenderingRef.current = false;
      }
    };

    renderPage();

    // Cleanup function to cancel render task on unmount
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [document, currentPage, scale]); // Only re-render when document, page, or scale changes

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Convert screen pixels to unscaled PDF points so stored coordinates
    // stay zoom-independent (consistent with drag/resize and savePDF).
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    onCanvasClick(x, y);
  };

  const currentPageAnnotations = annotations.filter(ann => ann.page === currentPage);

  return (
    <div className="flex-1 bg-slate-100 overflow-auto">
      <div className="flex items-center justify-center min-h-full p-8">
        <div 
          key={`${currentPage}-${scale}`}
          ref={containerRef}
          className="relative bg-white shadow-xl rounded-lg overflow-hidden"
          style={{ 
            width: canvasSize.width || 'auto',
            height: canvasSize.height || 'auto'
          }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="block cursor-crosshair"
          />
          
          {currentPageAnnotations.map((annotation) => (
            <TextAnnotation
              key={annotation.id}
              annotation={annotation}
              isSelected={selectedAnnotation === annotation.id}
              scale={scale} // Pass the scale prop
              onClick={(e) => onAnnotationClick(annotation, e)}
              onUpdate={(updates) => onAnnotationUpdate(annotation.id, updates)}
              onDelete={() => onAnnotationDelete(annotation.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};