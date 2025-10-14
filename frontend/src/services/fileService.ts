import api from './apiService';
import { ApiResponse } from '@/types';

export interface FileUploadResponse {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  entityType: string;
  entityId: string;
}

const fileService = {
  // Upload a file
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<FileUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post('/files/upload', formData, config);
    return response.data;
  },

  // Upload multiple files
  uploadMultipleFiles: async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResponse[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post('/files/upload-multiple', formData, config);
    return response.data;
  },

  // Get file by ID
  getFileById: async (id: string): Promise<ApiResponse<FileUploadResponse>> => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  // Download file
  downloadFile: async (id: string): Promise<Blob> => {
    const response = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  // Get file attachments for an entity
  getAttachments: async (
    entityType: string,
    entityId: string
  ): Promise<ApiResponse<FileAttachment[]>> => {
    const response = await api.get(`/files/attachments/${entityType}/${entityId}`);
    return response.data;
  },

  // Attach file to an entity
  attachFile: async (
    fileId: string,
    entityType: string,
    entityId: string
  ): Promise<ApiResponse<FileAttachment>> => {
    const response = await api.post(`/files/attach`, {
      fileId,
      entityType,
      entityId,
    });
    return response.data;
  },

  // Detach file from an entity
  detachFile: async (
    fileId: string,
    entityType: string,
    entityId: string
  ): Promise<ApiResponse> => {
    const response = await api.delete(`/files/detach/${fileId}/${entityType}/${entityId}`);
    return response.data;
  },

  // Get file preview URL
  getPreviewUrl: (id: string): string => {
    return `${api.defaults.baseURL}/files/${id}/preview`;
  },

  // Get file download URL
  getDownloadUrl: (id: string): string => {
    return `${api.defaults.baseURL}/files/${id}/download`;
  },

  // Check if file is an image
  isImage: (contentType: string): boolean => {
    return contentType.startsWith('image/');
  },

  // Check if file is a PDF
  isPdf: (contentType: string): boolean => {
    return contentType === 'application/pdf';
  },

  // Check if file is a document
  isDocument: (contentType: string): boolean => {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ].includes(contentType);
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on content type
  getFileIcon: (contentType: string): string => {
    if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType === 'application/pdf') {
      return 'pdf';
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return 'word';
    } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
      return 'excel';
    } else if (contentType.includes('powerpoint') || contentType.includes('presentation')) {
      return 'powerpoint';
    } else if (contentType.includes('text')) {
      return 'text';
    } else if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('tar')) {
      return 'archive';
    } else {
      return 'file';
    }
  },
};

export default fileService;