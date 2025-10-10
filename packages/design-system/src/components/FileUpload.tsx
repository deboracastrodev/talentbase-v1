/**
 * FileUpload Component - Design System
 *
 * Drag & drop file upload component with validation.
 * Used for CSV import and other file uploads.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   accept=".csv"
 *   maxSize={10 * 1024 * 1024}
 *   onFileSelect={(file) => console.log(file)}
 *   onError={(error) => toast.error(error)}
 * />
 * ```
 */

import { useCallback, useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { Alert } from './Alert';

export interface FileUploadProps {
  /**
   * Accepted file types (e.g., ".csv", ".pdf", "image/*")
   */
  accept?: string;
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  /**
   * Callback when file is selected and valid
   */
  onFileSelect: (file: File) => void;
  /**
   * Callback when validation error occurs
   */
  onError?: (error: string) => void;
  /**
   * Helper text below upload zone
   */
  helperText?: string;
  /**
   * Disable upload
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function FileUpload({
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFileSelect,
  onError,
  helperText,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file extension
      if (accept !== '*' && !accept.includes('*')) {
        const extensions = accept.split(',').map((ext) => ext.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!extensions.includes(fileExtension)) {
          return {
            valid: false,
            error: `Apenas arquivos ${accept} são aceitos`,
          };
        }
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
          valid: false,
          error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
        };
      }

      // Check if empty
      if (file.size === 0) {
        return {
          valid: false,
          error: 'Arquivo vazio. Selecione um arquivo válido',
        };
      }

      return { valid: true };
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error || 'Erro ao validar arquivo');
        onError?.(validation.error || 'Erro ao validar arquivo');
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        document.getElementById('file-input')?.click();
      }
    },
    [disabled]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) input.value = '';
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Área de upload de arquivo. ${helperText || ''}`}
        aria-describedby="upload-instructions"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging && !disabled && 'border-primary-500 bg-primary-50',
          !isDragging && !disabled && 'border-gray-300 hover:border-primary-400',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          error && 'border-red-500'
        )}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-label="Selecionar arquivo"
        />

        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p id="upload-instructions" className="text-sm text-gray-600">
              {isDragging
                ? 'Solte o arquivo aqui'
                : 'Arraste um arquivo ou clique para selecionar'}
            </p>
            {helperText && (
              <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={disabled}
          >
            📁 Selecionar Arquivo
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" message={error} />
      )}

      {/* Selected File Preview */}
      {selectedFile && !error && (
        <Alert
          variant="success"
          message={
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFile}
                disabled={disabled}
              >
                ✕ Remover
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
