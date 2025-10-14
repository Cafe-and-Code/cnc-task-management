import React, { useState } from 'react';
import { 
  DocumentIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import fileService, { FileAttachment } from '@/services/fileService';
import { toast } from 'react-hot-toast';

interface FilePreviewProps {
  file: FileAttachment;
  onRemove?: (fileId: string) => void;
  showActions?: boolean;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  showActions = true,
  className = '',
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = () => {
    const iconType = fileService.getFileIcon(file.contentType);
    
    switch (iconType) {
      case 'image':
        return <PhotoIcon className="h-6 w-6 text-green-500" />;
      case 'pdf':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
      case 'word':
        return <DocumentIcon className="h-6 w-6 text-blue-500" />;
      case 'excel':
        return <DocumentIcon className="h-6 w-6 text-green-600" />;
      case 'powerpoint':
        return <DocumentIcon className="h-6 w-6 text-orange-500" />;
      case 'text':
        return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
      case 'archive':
        return <DocumentIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded "${file.originalFileName}"`);
    } catch (error) {
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    if (fileService.isImage(file.contentType)) {
      setIsPreviewOpen(true);
    } else if (fileService.isPdf(file.contentType)) {
      // Open PDF in new tab
      window.open(fileService.getPreviewUrl(file.id), '_blank');
    } else {
      toast.error('Preview not available for this file type');
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(file.id);
    }
  };

  return (
    <>
      <div className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center min-w-0 flex-1">
          {getFileIcon()}
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.originalFileName}
            </p>
            <p className="text-xs text-gray-500">
              {fileService.formatFileSize(file.size)} • Uploaded by {file.uploadedBy}
            </p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center ml-4 space-x-1">
            {/* Preview button for images */}
            {fileService.isImage(file.contentType) && (
              <button
                type="button"
                onClick={handlePreview}
                className="p-1 rounded-full hover:bg-gray-100"
                title="Preview"
              >
                <EyeIcon className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
              title="Download"
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-gray-500" />
            </button>
            
            {/* Remove button */}
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-full hover:bg-gray-100"
                title="Remove"
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Image preview modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsPreviewOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {file.originalFileName}
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={fileService.getPreviewUrl(file.id)}
                        alt={file.originalFileName}
                        className="max-w-full max-h-96 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;