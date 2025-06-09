import React from 'react';
import { 
  Download, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Type,
  ChevronLeft,
  ChevronRight, 
  Copy,
  FileText
} from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  canUndo: boolean;
  canRedo: boolean;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onAddTextbox: () => void;
  selectedAnnotationId: string | null;
  onCopyAnnotation: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPage,
  totalPages,
  scale,
  canUndo,
  canRedo,
  onPageChange,
  onScaleChange,
  onUndo,
  onRedo,
  onSave,
  onAddTextbox,
  selectedAnnotationId, 
  onCopyAnnotation
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-800">PDF Editor</span>
          </div>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <button
            onClick={onAddTextbox}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Type className="w-4 h-4" />
            <span className="text-sm font-medium">Add Text</span>
          </button>

          {selectedAnnotationId && (
            <button
              onClick={onCopyAnnotation}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
              title="Copy Selected Textbox"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-slate-600 min-w-0">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onScaleChange(scale - 0.25)}
              disabled={scale <= 0.5}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-slate-600 min-w-0">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={() => onScaleChange(scale + 0.25)}
              disabled={scale >= 3}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <button
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};