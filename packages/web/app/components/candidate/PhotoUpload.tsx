/**
 * PhotoUpload Component
 * Story 3.1: Profile photo upload with S3.
 */

import { useState, useRef } from 'react';

import { useS3Upload } from '~/hooks/useS3Upload';

interface PhotoUploadProps {
  onUploadComplete: (url: string) => void;
  currentPhotoUrl?: string;
  disabled?: boolean;
}

export function PhotoUpload({
  onUploadComplete,
  currentPhotoUrl,
  disabled = false,
}: PhotoUploadProps) {
  const { uploadState, uploadFile, reset } = useS3Upload();
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Arquivo deve ser JPG ou PNG');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo deve ser menor que 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    const url = await uploadFile(file, 'photo');
    if (url) {
      onUploadComplete(url);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Upload button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={disabled || uploadState.isUploading}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className={`
              inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
              ${
                disabled || uploadState.isUploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }
            `}
          >
            {uploadState.isUploading ? 'Enviando...' : preview ? 'Alterar Foto' : 'Escolher Foto'}
          </label>

          {preview && !uploadState.isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="ml-3 inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              Remover
            </button>
          )}
        </div>
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
      {uploadState.error && <p className="text-sm text-red-600">{uploadState.error}</p>}

      {/* Help text */}
      <p className="text-sm text-gray-500">JPG ou PNG, máximo 2MB</p>
    </div>
  );
}
