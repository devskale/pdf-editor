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
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">PDF Annotator</h1>
          <p className="text-slate-600">Upload a PDF to start adding annotations</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
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
          
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragOver ? 'text-blue-500' : 'text-slate-400'
          }`} />
          
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {isDragOver ? 'Drop your PDF here' : 'Upload PDF Document'}
          </h3>
          
          <p className="text-sm text-slate-500 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
            Choose File
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500 text-center">
          Supported format: PDF files only
        </div>
      </div>
    </div>
  );
};