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
  Upload,
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
  onFileUpload?: (file: File) => void;
}

const iconBtn =
  'inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-600';

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
  onFileUpload,
}) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf' && typeof onFileUpload === 'function') {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur border-b border-slate-200 px-4 h-14 flex items-center justify-between shrink-0">
      {/* Left: brand + primary actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pr-3 mr-1 border-r border-slate-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-sm shadow-blue-600/30">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 text-sm">PDF Annotator</span>
              <span className="text-[10px] text-slate-400">v{__APP_VERSION__}</span>
            </div>
            <a
              href="https://skale.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline"
            >
              by skale.dev
            </a>
          </div>
        </div>

        {/* Upload */}
        <div className="relative group">
          <button
            className={`${iconBtn} ${!onFileUpload ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={onFileUpload ? 'Upload PDF' : 'File upload not available'}
            aria-label="Upload PDF"
            disabled={!onFileUpload}
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={!onFileUpload}
          />
        </div>

        {/* Add text — primary labeled action */}
        <button
          onClick={onAddTextbox}
          title="Add a text box (then click on the page)"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition-colors"
        >
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Add text</span>
        </button>

        {selectedAnnotationId && (
          <button
            onClick={onCopyAnnotation}
            className={iconBtn}
            title="Duplicate selected text box"
            aria-label="Duplicate selected text box"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button onClick={onUndo} disabled={!canUndo} className={iconBtn} title="Undo" aria-label="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={iconBtn} title="Redo" aria-label="Redo">
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Right: navigation + zoom + save */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={iconBtn}
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 min-w-[84px] text-center tabular-nums">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={iconBtn}
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => onScaleChange(scale - 0.25)}
            disabled={scale <= 0.5}
            className={iconBtn}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 min-w-[48px] text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onScaleChange(scale + 0.25)}
            disabled={scale >= 3}
            className={iconBtn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          onClick={onSave}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 transition-colors"
          title="Download annotated PDF"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Save PDF</span>
        </button>
      </div>
    </div>
  );
};
