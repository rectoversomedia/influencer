'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesSelected: (files: File[]) => void;
  label?: string;
  hint?: string;
}

export function FileUpload({
  accept = 'image/*',
  multiple = false,
  maxSize = 10,
  onFilesSelected,
  label = 'Upload files',
  hint,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    setError(null);
    const validFiles: File[] = [];

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSize}MB limit`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFiles((prev) =>
        multiple ? [...prev, ...validFiles] : validFiles
      );
      onFilesSelected(multiple ? [...files, ...validFiles] : validFiles);
    }
  }, [files, maxSize, multiple, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 hover:border-slate-400'
          }
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {accept.includes('image') ? 'PNG, JPG, GIF up to' : 'File up to'} {maxSize}MB
        </p>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {hint && !error && (
        <p className="mt-1 text-sm text-slate-500">{hint}</p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-3">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-8 w-8 text-indigo-500" />
                ) : (
                  <File className="h-8 w-8 text-slate-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
