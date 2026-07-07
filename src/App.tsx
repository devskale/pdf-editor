import React, { useEffect, useState } from 'react';
import { usePDFEditor } from './hooks/usePDFEditor';
import { FileUpload } from './components/FileUpload';
import { Toolbar } from './components/Toolbar';
import { PDFViewer } from './components/PDFViewer';
import { PropertyPanel } from './components/PropertyPanel';
import { Annotation } from './types';

function App() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  
  const {
    pdfState,
    loadPDF,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    setCurrentPage,
    setScale,
    undo,
    redo,
    copyAnnotation,
    savePDF
  } = usePDFEditor();

  // Esc cancels "add text" mode.
  useEffect(() => {
    if (!isAddingText) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddingText(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAddingText]);

  // Delete/Backspace removes the selected annotation (ignored while typing or
  // placing a new text box).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (isAddingText || !pdfState.selectedAnnotation) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      deleteAnnotation(pdfState.selectedAnnotation);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAddingText, pdfState.selectedAnnotation, deleteAnnotation]);

  const handleFileUpload = async (file: File) => {
    try {
      await loadPDF(file);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert('Failed to load PDF. Please try again.');
    }
  };

  const handleAddTextbox = () => {
    setIsAddingText(true);
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (isAddingText) {
      addAnnotation(x, y);
      setIsAddingText(false);
    } else {
      selectAnnotation(null);
    }
  };

  const handleAnnotationClick = (annotation: Annotation, event: React.MouseEvent) => {
    event.stopPropagation();
    selectAnnotation(annotation.id);
  };

  const selectedAnnotation = pdfState.selectedAnnotation 
    ? pdfState.annotations.find(ann => ann.id === pdfState.selectedAnnotation)
    : null;

  if (!pdfState.document) {
    return (
      <FileUpload
        onFileUpload={handleFileUpload}
        isDragOver={isDragOver}
        onDragOver={setIsDragOver}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Toolbar
        currentPage={pdfState.currentPage}
        totalPages={pdfState.totalPages}
        scale={pdfState.scale}
        canUndo={pdfState.history.past.length > 0}
        canRedo={pdfState.history.future.length > 0}
        onPageChange={setCurrentPage}
        onScaleChange={setScale}
        onUndo={undo}
        onRedo={redo}
        onSave={savePDF}
        onAddTextbox={handleAddTextbox}
        selectedAnnotationId={pdfState.selectedAnnotation}
        onCopyAnnotation={copyAnnotation}
        onFileUpload={handleFileUpload}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <PDFViewer
          document={pdfState.document}
          currentPage={pdfState.currentPage}
          scale={pdfState.scale}
          annotations={pdfState.annotations}
          selectedAnnotation={pdfState.selectedAnnotation}
          onAnnotationClick={handleAnnotationClick}
          onAnnotationUpdate={updateAnnotation}
          onAnnotationDelete={deleteAnnotation}
          onCanvasClick={handleCanvasClick}
        />
        
        <PropertyPanel
          annotation={selectedAnnotation}
          onUpdate={(updates) => selectedAnnotation && updateAnnotation(selectedAnnotation.id, updates)}
        />
      </div>
    </div>
  );
}

export default App;