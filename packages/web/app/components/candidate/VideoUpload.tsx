/**
 * VideoUpload Component
 * Story 3.1: Pitch video upload with S3 or YouTube URL.
 */

import { useState, useRef } from 'react';

import { useS3Upload } from '~/hooks/useS3Upload';

interface VideoUploadProps {
  onUploadComplete: (url: string, type: 's3' | 'youtube') => void;
  currentVideoUrl?: string;
  currentVideoType?: 's3' | 'youtube';
  disabled?: boolean;
}

export function VideoUpload({
  onUploadComplete,
  currentVideoUrl,
  currentVideoType,
  disabled = false,
}: VideoUploadProps) {
  const { uploadState, uploadFile, reset } = useS3Upload();
  const [uploadMethod, setUploadMethod] = useState<'s3' | 'youtube'>(
    currentVideoType || 's3'
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    currentVideoType === 'youtube' ? currentVideoUrl || '' : ''
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      alert('Arquivo deve ser MP4, MOV ou AVI');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Arquivo deve ser menor que 50MB');
      return;
    }

    // Upload to S3
    const url = await uploadFile(file, 'video');
    if (url) {
      setVideoUrl(url);
      onUploadComplete(url, 's3');
    }
  };

  const handleYoutubeSubmit = () => {
    // Validate YouTube URL
    const youtubePatterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
    ];

    const isValid = youtubePatterns.some((pattern) => pattern.test(youtubeUrl));

    if (!isValid) {
      alert(
        'URL do YouTube inválida. Use formato: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID'
      );
      return;
    }

    setVideoUrl(youtubeUrl);
    onUploadComplete(youtubeUrl, 'youtube');
  };

  const handleRemove = () => {
    setVideoUrl(null);
    setYoutubeUrl('');
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload method selector */}
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="s3"
            checked={uploadMethod === 's3'}
            onChange={() => setUploadMethod('s3')}
            disabled={disabled}
            className="mr-2"
          />
          Upload de arquivo
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="youtube"
            checked={uploadMethod === 'youtube'}
            onChange={() => setUploadMethod('youtube')}
            disabled={disabled}
            className="mr-2"
          />
          URL do YouTube
        </label>
      </div>

      {/* S3 Upload */}
      {uploadMethod === 's3' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo"
              onChange={handleFileChange}
              disabled={disabled || uploadState.isUploading}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className={`
                inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
                ${
                  disabled || uploadState.isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                }
              `}
            >
              {uploadState.isUploading
                ? 'Enviando...'
                : videoUrl && uploadMethod === 's3'
                ? 'Alterar Vídeo'
                : 'Escolher Vídeo'}
            </label>

            {videoUrl && uploadMethod === 's3' && !uploadState.isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
              >
                Remover
              </button>
            )}
          </div>

          {/* Progress bar */}
          {uploadState.isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          )}

          {/* Error message */}
          {uploadState.error && (
            <p className="text-sm text-red-600">{uploadState.error}</p>
          )}

          {/* Help text */}
          <p className="text-sm text-gray-500">MP4, MOV ou AVI, máximo 50MB</p>
        </div>
      )}

      {/* YouTube URL Input */}
      {uploadMethod === 'youtube' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={disabled}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={handleYoutubeSubmit}
              disabled={disabled || !youtubeUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar URL
            </button>
          </div>

          {videoUrl && uploadMethod === 'youtube' && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <span className="text-sm text-green-800">✓ URL do YouTube salva</span>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Cole a URL completa do vídeo no YouTube
          </p>
        </div>
      )}

      {/* Video preview */}
      {videoUrl && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-2">Vídeo atual:</p>
          <p className="text-sm text-gray-600 break-all">{videoUrl}</p>
        </div>
      )}
    </div>
  );
}
