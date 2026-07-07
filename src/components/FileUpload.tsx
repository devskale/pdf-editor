import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isDragOver: boolean;
  onDragOver: (isDragOver: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isDragOver,
  onDragOver
}) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(true);
  }, [onDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);
  }, [onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === 'application/pdf');

    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  }, [onFileUpload, onDragOver]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-5 shadow-lg shadow-blue-600/25">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              PDF Annotator
            </h1>
            <span className="text-xs font-medium text-slate-500 bg-slate-200/70 rounded-full px-2 py-0.5">
              v{__APP_VERSION__}
            </span>
          </div>
          <p className="text-slate-500">
            Upload a PDF to start adding annotations
          </p>
        </div>

        <div
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl px-8 py-12 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors ${
              isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <p className="text-base font-semibold text-slate-700">
              {isDragOver ? 'Drop your PDF here' : 'Drag & drop your PDF'}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">or click to browse</p>
          </div>

          <span className="mt-1 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm">
            Choose File
          </span>
        </div>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Supports PDF files
        </p>
      </div>
    </div>
  );
};
