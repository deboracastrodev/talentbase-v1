# FileUpload Component

## Overview

Drag & drop file upload component with validation. Used for CSV import and other file uploads across the TalentBase platform.

## Features

- ✅ **Drag & Drop**: Full drag and drop support with visual feedback
- ✅ **File Validation**: Type, size, and empty file validation
- ✅ **Error Handling**: Clear error messages for validation failures
- ✅ **Accessibility**: Keyboard navigation and ARIA labels
- ✅ **File Preview**: Shows selected file name and size with remove option
- ✅ **Visual States**: Dragging, error, and success states

## Import

```tsx
import { FileUpload } from '@talentbase/design-system';
```

## Basic Usage

```tsx
<FileUpload
  accept=".csv"
  maxSize={10 * 1024 * 1024} // 10MB
  onFileSelect={(file) => console.log(file)}
  onError={(error) => toast.error(error)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `'*'` | Accepted file types (e.g., ".csv", ".pdf", "image/*") |
| `maxSize` | `number` | `10485760` | Maximum file size in bytes (default 10MB) |
| `onFileSelect` | `(file: File) => void` | - | **Required**. Callback when file is selected and valid |
| `onError` | `(error: string) => void` | - | Callback when validation error occurs |
| `helperText` | `string` | - | Helper text below upload zone |
| `disabled` | `boolean` | `false` | Disable upload |
| `className` | `string` | - | Additional CSS classes |

## Examples

### CSV Import

```tsx
<FileUpload
  accept=".csv"
  maxSize={5 * 1024 * 1024} // 5MB
  onFileSelect={(file) => handleCSVUpload(file)}
  onError={(error) => setError(error)}
  helperText="Formato aceito: CSV (máximo 5MB)"
/>
```

### Image Upload

```tsx
<FileUpload
  accept=".jpg,.jpeg,.png,.webp"
  maxSize={2 * 1024 * 1024} // 2MB
  onFileSelect={(file) => handleImageUpload(file)}
  onError={(error) => toast.error(error)}
  helperText="Formatos aceitos: JPG, PNG, WEBP (máximo 2MB)"
/>
```

### With Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

<FileUpload
  accept=".pdf"
  maxSize={10 * 1024 * 1024}
  onFileSelect={(file) => {
    setError(null);
    uploadFile(file);
  }}
  onError={(err) => {
    setError(err);
    // Optionally show toast
    toast.error(err);
  }}
  helperText="Formato aceito: PDF (máximo 10MB)"
/>
```

## Validation Rules

The component validates files based on:

1. **File Extension**: Checks if file extension matches the `accept` prop
2. **File Size**: Ensures file size doesn't exceed `maxSize`
3. **Empty Files**: Rejects files with 0 bytes

### Validation Error Messages

- Invalid type: `"Apenas arquivos {accept} são aceitos"`
- Too large: `"Arquivo muito grande. Tamanho máximo: {size}MB"`
- Empty file: `"Arquivo vazio. Selecione um arquivo válido"`

## Accessibility

- ✅ **ARIA Labels**: Proper labels for screen readers
- ✅ **Keyboard Navigation**: Enter/Space to open file dialog
- ✅ **Focus Management**: Clear focus states
- ✅ **Error Announcements**: Errors announced via `role="alert"`

## UI States

### Default State
- Gray dashed border
- Upload icon and instructions visible
- "Selecionar Arquivo" button

### Dragging State
- Blue border (`border-primary-500`)
- Blue background (`bg-primary-50`)
- "Solte o arquivo aqui" message

### Error State
- Red border (`border-red-500`)
- Error message displayed in Alert component
- Previous file cleared

### Success State
- Green Alert with file preview
- File name and size displayed
- "Remover" button to clear selection

### Disabled State
- Opacity reduced (`opacity-50`)
- Gray background (`bg-gray-50`)
- Not clickable (`cursor-not-allowed`)

## Integration with Story 3.3

This component is used in the CSV Import Tool workflow:

```tsx
// Step 1: Upload CSV
<FileUpload
  accept=".csv"
  maxSize={5 * 1024 * 1024}
  onFileSelect={(file) => {
    setSelectedFile(file);
    validateCSV(file);
  }}
  onError={(error) => {
    toast.error(error);
    setStep(0); // Stay on upload step
  }}
  helperText="Selecione um arquivo CSV com dados de candidatos"
/>
```

## Best Practices

1. **Always provide `helperText`** to inform users about accepted formats and size limits
2. **Handle errors gracefully** with both visual feedback and user notifications
3. **Clear file after upload** to allow re-upload
4. **Use appropriate size limits** based on your backend constraints
5. **Validate MIME types server-side** as well for security

## Related Components

- [ProgressBar](./progress-bar.md) - For showing upload progress
- [Stepper](./stepper.md) - For multi-step upload workflows
- [Alert](./alert.md) - Used internally for error/success messages
