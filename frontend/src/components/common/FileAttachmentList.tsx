import React, { useState, useEffect } from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import fileService, { FileAttachment } from '@/services/fileService';
import FilePreview from './FilePreview';
import FileUpload from './FileUpload';
import { toast } from 'react-hot-toast';

interface FileAttachmentListProps {
  entityType: string;
  entityId: string;
  onAttachmentChange?: (attachments: FileAttachment[]) => void;
  allowUpload?: boolean;
  maxFiles?: number;
  className?: string;
}

const FileAttachmentList: React.FC<FileAttachmentListProps> = ({
  entityType,
  entityId,
  onAttachmentChange,
  allowUpload = true,
  maxFiles = 5,
  className = '',
}) => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attachments when component mounts or entity changes
  useEffect(() => {
    if (entityType && entityId) {
      fetchAttachments();
    }
  }, [entityType, entityId]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fileService.getAttachments(entityType, entityId);
      if (response.success && response.data) {
        setAttachments(response.data);
        onAttachmentChange?.(response.data);
      } else {
        setError(response.message || 'Failed to fetch attachments');
      }
    } catch (err) {
      setError('Failed to fetch attachments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploaded = async (file: any) => {
    try {
      // Attach the file to the entity
      const response = await fileService.attachFile(
        file.id,
        entityType,
        entityId
      );
      
      if (response.success) {
        // Refresh the attachments list
        await fetchAttachments();
        toast.success('File attached successfully');
      } else {
        toast.error(response.message || 'Failed to attach file');
      }
    } catch (err) {
      toast.error('Failed to attach file');
    }
  };

  const handleFilesUploaded = async (files: any[]) => {
    try {
      // Attach all files to the entity
      const attachPromises = files.map(file =>
        fileService.attachFile(file.id, entityType, entityId)
      );
      
      const results = await Promise.all(attachPromises);
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // Refresh the attachments list
        await fetchAttachments();
        toast.success(`${files.length} files attached successfully`);
      } else {
        toast.error('Some files could not be attached');
      }
    } catch (err) {
      toast.error('Failed to attach files');
    }
  };

  const handleRemoveAttachment = async (fileId: string) => {
    try {
      // Detach the file from the entity
      const response = await fileService.detachFile(fileId, entityType, entityId);
      
      if (response.success) {
        // Refresh the attachments list
        await fetchAttachments();
        toast.success('File removed successfully');
      } else {
        toast.error(response.message || 'Failed to remove file');
      }
    } catch (err) {
      toast.error('Failed to remove file');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File upload section */}
      {allowUpload && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Attach Files
          </h3>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onFilesUploaded={handleFilesUploaded}
            multiple={maxFiles > 1}
            maxFiles={maxFiles}
            className="w-full"
          />
        </div>
      )}

      {/* Attachments list */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <PaperClipIcon className="h-4 w-4 mr-1" />
          Attachments ({attachments.length})
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="loading-spinner w-6 h-6"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 py-2">
            {error}
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-sm text-gray-500 py-2 border border-dashed border-gray-300 rounded-md text-center">
            No attachments
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <FilePreview
                key={attachment.id}
                file={attachment}
                onRemove={allowUpload ? handleRemoveAttachment : undefined}
                showActions={allowUpload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileAttachmentList;