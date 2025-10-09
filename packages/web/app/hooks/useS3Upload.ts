/**
 * Hook for S3 file uploads with progress tracking.
 * Story 3.1: Photo and video uploads.
 */

import { useState, useCallback } from 'react';
import { getUploadUrl, uploadToS3 } from '~/lib/api/candidates';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  fileUrl: string | null;
}

export interface UseS3UploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File, type: 'photo' | 'video') => Promise<string | null>;
  reset: () => void;
}

/**
 * Hook to handle S3 file uploads.
 *
 * @returns Upload state and functions
 *
 * @example
 * const { uploadState, uploadFile, reset } = useS3Upload();
 *
 * async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
 *   const file = e.target.files?.[0];
 *   if (!file) return;
 *
 *   const url = await uploadFile(file, 'photo');
 *   if (url) {
 *     console.log('Uploaded to:', url);
 *   }
 * }
 */
export function useS3Upload(): UseS3UploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    fileUrl: null,
  });

  const uploadFile = useCallback(async (
    file: File,
    type: 'photo' | 'video'
  ): Promise<string | null> => {
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        fileUrl: null,
      });

      // Get presigned URL
      const presignedData = await getUploadUrl(file.name, file.type, type);

      // Upload to S3 with progress tracking
      const fileUrl = await uploadToS3(file, presignedData, (progress) => {
        setUploadState((prev) => ({ ...prev, progress }));
      });

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        fileUrl,
      });

      return fileUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        fileUrl: null,
      });

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      fileUrl: null,
    });
  }, []);

  return {
    uploadState,
    uploadFile,
    reset,
  };
}
