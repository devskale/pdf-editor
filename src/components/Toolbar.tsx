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
  FileText,
  Upload
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
  onFileUpload: (file: File) => void;
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
  onCopyAnnotation,
  onFileUpload
}) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* first group: logo, upload, add text, copy, undo/redo */}
        <div className="flex items-center space-x-4">
            <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-800">PDF Editor</span>
            </div>
            <a
              href="https://skale.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-slate-400 ml-7 -mt-1 hover:underline"
            >
              by skale.dev
            </a>
            </div>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <div className="relative group">
            <button
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg transition-colors group-hover:bg-blue-700"
              title="Upload new PDF"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          
          <div className="h-6 w-px bg-slate-300" />
          
          <button
            onClick={onAddTextbox}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Type className="w-4 h-4" />
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
        </div>

        {/* second group: page navigation, zoom, save */}
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