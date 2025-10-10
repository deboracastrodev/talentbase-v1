import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './FileUpload';
import { useState } from 'react';

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Drag & drop file upload component with validation. Used for CSV import and other file uploads.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default file upload component accepting all file types
 */
export const Default: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <FileUpload
        onFileSelect={(file) => {
          setFile(file);
          console.log('File selected:', file);
        }}
        onError={(error) => console.error(error)}
      />
    );
  },
};

/**
 * CSV file upload with size limit
 */
export const CSVUpload: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <FileUpload
        accept=".csv"
        maxSize={5 * 1024 * 1024} // 5MB
        onFileSelect={(file) => {
          setFile(file);
          console.log('CSV file selected:', file);
        }}
        onError={(error) => console.error(error)}
        helperText="Formatos aceitos: CSV (máx. 5MB)"
      />
    );
  },
};

/**
 * Image upload with multiple formats
 */
export const ImageUpload: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <FileUpload
        accept=".jpg,.jpeg,.png,.webp"
        maxSize={2 * 1024 * 1024} // 2MB
        onFileSelect={(file) => {
          setFile(file);
          console.log('Image file selected:', file);
        }}
        onError={(error) => console.error(error)}
        helperText="Formatos aceitos: JPG, PNG, WEBP (máx. 2MB)"
      />
    );
  },
};

/**
 * PDF document upload
 */
export const PDFUpload: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);
    return (
      <FileUpload
        accept=".pdf"
        maxSize={10 * 1024 * 1024} // 10MB
        onFileSelect={(file) => {
          setFile(file);
          console.log('PDF file selected:', file);
        }}
        onError={(error) => console.error(error)}
        helperText="Formato aceito: PDF (máx. 10MB)"
      />
    );
  },
};

/**
 * Disabled upload state
 */
export const Disabled: Story = {
  render: () => {
    return (
      <FileUpload
        accept=".csv"
        onFileSelect={(file) => console.log(file)}
        disabled
        helperText="Upload desabilitado no momento"
      />
    );
  },
};

/**
 * With custom error handling
 */
export const WithErrorHandling: Story = {
  render: () => {
    const [error, setError] = useState<string | null>(null);
    return (
      <div>
        <FileUpload
          accept=".csv"
          maxSize={1024} // 1KB - very small to trigger errors
          onFileSelect={(file) => {
            setError(null);
            console.log('File accepted:', file);
          }}
          onError={(err) => {
            setError(err);
            alert(err);
          }}
          helperText="Tente fazer upload de um arquivo maior que 1KB para ver o erro"
        />
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Erro capturado: {error}
          </div>
        )}
      </div>
    );
  },
};
