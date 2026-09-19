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
  const [loadError, setLoadError] = useState<string | null>(null);
  
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
      setLoadError(null);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setLoadError('Failed to load PDF. The file may be corrupt or password-protected. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      await savePDF();
      setLoadError(null);
    } catch (error) {
      console.error('Failed to save PDF:', error);
      setLoadError('Failed to save PDF. Please try again.');
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
    ? (pdfState.annotations.find(ann => ann.id === pdfState.selectedAnnotation) ?? null)
    : null;

  if (!pdfState.document) {
    return (
      <main>
        {loadError && (
          <div role="alert" className="max-w-md mx-auto mt-6 px-4">
            <p className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">{loadError}</p>
          </div>
        )}
        <FileUpload
          onFileUpload={handleFileUpload}
          isDragOver={isDragOver}
          onDragOver={setIsDragOver}
        />
      </main>
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
        onSave={handleSave}
        onAddTextbox={handleAddTextbox}
        selectedAnnotationId={pdfState.selectedAnnotation}
        onCopyAnnotation={copyAnnotation}
        onFileUpload={handleFileUpload}
      />
      {loadError && (
        <div role="alert" className="px-4 py-2">
          <p className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-2">{loadError}</p>
        </div>
      )}
      
      <main className="flex flex-1 overflow-hidden">
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
      </main>
    </div>
  );
}

export default App;