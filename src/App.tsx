import React, { useState } from 'react';
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

      {isAddingText && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm text-slate-600">Click anywhere on the PDF to add a text box</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;