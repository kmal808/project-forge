import React from 'react';
import { Upload, X, Image, FileText, File } from 'lucide-react';
import { FileUpload } from '../../types';

interface FileUploaderProps {
  onUpload: (files: FileUpload[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileUploader({ onUpload, accept = '*/*', multiple = true }: FileUploaderProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    
    const uploads: FileUpload[] = newFiles.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      jobId: 'current-job-id', // This would come from context/props in real app
    }));

    onUpload(uploads);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-6 w-6 text-gray-400" />;
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-gray-400" />;
    return <File className="h-6 w-6 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mb-4 h-10 w-10 text-gray-400" />
        <div className="space-y-1 text-center">
          <p className="text-sm text-gray-600">
            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
              <span>Upload files</span>
              <input
                type="file"
                className="sr-only"
                multiple={multiple}
                accept={accept}
                onChange={handleChange}
              />
            </label>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">Any file up to 10MB</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center space-x-4">
                {getFileIcon(file.type)}
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}