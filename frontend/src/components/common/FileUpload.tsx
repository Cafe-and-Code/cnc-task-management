import React, { useState, useRef, ChangeEvent } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import fileService, { FileUploadResponse } from '@/services/fileService';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onFileUploaded?: (file: FileUploadResponse) => void;
  onFilesUploaded?: (files: FileUploadResponse[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFilesUploaded,
  accept = '*/*',
  multiple = false,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Validate file count
    if (multiple) {
      if (files.length > maxFiles) {
        toast.error(`You can only upload a maximum of ${maxFiles} files`);
        return;
      }
    } else {
      if (files.length > 1) {
        toast.error('You can only upload one file');
        return;
      }
    }

    // Validate file size
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is ${fileService.formatFileSize(maxSize)}`);
        return;
      }
    }

    // Upload files
    if (multiple) {
      uploadMultipleFiles(files);
    } else {
      uploadSingleFile(files[0]);
    }
  };

  const uploadSingleFile = async (file: File) => {
    const uploadingFileId = Date.now().toString();
    
    // Add to uploading files
    setUploadingFiles(prev => [...prev, {
      file,
      progress: 0,
      id: uploadingFileId
    }]);

    try {
      const response = await fileService.uploadFile(file, (progress) => {
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFileId ? { ...f, progress } : f)
        );
      });
      
      // Remove from uploading files
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFileId));
      
      if (response.success && response.data) {
        toast.success(`File "${file.name}" uploaded successfully`);
        onFileUploaded?.(response.data);
      } else {
        toast.error(response.message || 'Failed to upload file');
      }
    } catch (error) {
      // Remove from uploading files
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFileId));
      toast.error('Failed to upload file');
    }
  };

  const uploadMultipleFiles = async (files: File[]) => {
    const uploadingFileIds = files.map(() => Date.now().toString() + Math.random());
    
    // Add to uploading files
    setUploadingFiles(prev => [
      ...prev,
      ...files.map((file, index) => ({
        file,
        progress: 0,
        id: uploadingFileIds[index]
      }))
    ]);

    try {
      const response = await fileService.uploadMultipleFiles(files, (progress) => {
        setUploadingFiles(prev => 
          prev.map(f => {
            const index = files.findIndex(file => file.name === f.file.name);
            if (index !== -1) {
              return { ...f, progress };
            }
            return f;
          })
        );
      });
      
      // Remove from uploading files
      setUploadingFiles(prev => 
        prev.filter(f => !uploadingFileIds.includes(f.id))
      );
      
      if (response.success && response.data) {
        toast.success(`${files.length} files uploaded successfully`);
        onFilesUploaded?.(response.data);
      } else {
        toast.error(response.message || 'Failed to upload files');
      }
    } catch (error) {
      // Remove from uploading files
      setUploadingFiles(prev => 
        prev.filter(f => !uploadingFileIds.includes(f.id))
      );
      toast.error('Failed to upload files');
    }
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
      />

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          {disabled ? 'File upload disabled' : 'Drop files here or click to upload'}
        </p>
        <p className="text-xs text-gray-500">
          {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max size: {fileService.formatFileSize(maxSize)}
        </p>
      </div>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">Uploading files...</p>
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="flex items-center p-2 bg-gray-50 rounded-md">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadingFile.file.name}
                </p>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-2 flex items-center">
                <button
                  type="button"
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;