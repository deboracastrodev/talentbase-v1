# ProgressBar Component

## Overview

Visual progress indicator with label and variants. Used for showing upload progress, import progress, and multi-step workflows across the TalentBase platform.

## Features

- ✅ **Visual Progress**: Animated progress bar with percentage display
- ✅ **Multiple Variants**: Default, success, error, and warning states
- ✅ **Label & Info**: Optional label, percentage, and fraction display
- ✅ **Size Options**: Small, medium, and large sizes
- ✅ **Stepped Progress**: Discrete steps with visual indicators
- ✅ **Accessibility**: ARIA attributes for screen readers

## Import

```tsx
import { ProgressBar, ProgressBarWithSteps } from '@talentbase/design-system';
```

## Basic Usage

### Simple Progress Bar

```tsx
<ProgressBar
  value={75}
  max={100}
  label="Uploading arquivo"
  showPercentage
/>
```

### Progress Bar with Steps

```tsx
<ProgressBarWithSteps
  currentStep={1}
  totalSteps={3}
  stepLabels={['Upload', 'Validar', 'Importar']}
/>
```

## ProgressBar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | **Required**. Current progress value |
| `max` | `number` | `100` | Maximum value |
| `label` | `string` | - | Label text above progress bar |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning'` | `'default'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height |
| `showPercentage` | `boolean` | `false` | Show percentage text (e.g., "75%") |
| `showFraction` | `boolean` | `false` | Show fraction text (e.g., "75 / 100") |
| `animated` | `boolean` | `false` | Animated pulse effect |
| `className` | `string` | - | Additional CSS classes |

## ProgressBarWithSteps Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | - | **Required**. Current step (0-indexed) |
| `totalSteps` | `number` | - | **Required**. Total number of steps |
| `stepLabels` | `string[]` | `[]` | Optional step labels |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning'` | `'default'` | Color variant |
| `className` | `string` | - | Additional CSS classes |

## Examples

### Upload Progress

```tsx
const [progress, setProgress] = useState(0);

// In your upload handler
const handleUpload = async (file: File) => {
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (e) => {
    const percent = (e.loaded / e.total) * 100;
    setProgress(percent);
  });

  // ... upload logic
};

return (
  <ProgressBar
    value={progress}
    max={100}
    label="Uploading arquivo CSV"
    variant={progress === 100 ? 'success' : 'default'}
    showPercentage
    animated={progress < 100}
  />
);
```

### Processing Records

```tsx
<ProgressBar
  value={processedRecords}
  max={totalRecords}
  label="Processando registros"
  showFraction
  showPercentage
  variant="default"
/>
```

### Error State

```tsx
<ProgressBar
  value={45}
  max={100}
  label="Erro no upload"
  variant="error"
  showPercentage
/>
```

### Multi-Step Import Wizard

```tsx
const [currentStep, setCurrentStep] = useState(0);

<ProgressBarWithSteps
  currentStep={currentStep}
  totalSteps={4}
  stepLabels={['Upload CSV', 'Validar Dados', 'Processar', 'Concluir']}
  variant={currentStep === 3 ? 'success' : 'default'}
/>
```

## Variants

### Default
- Blue progress bar (`bg-primary-500`)
- Use for normal progress

### Success
- Green progress bar (`bg-green-500`)
- Use when operation completes successfully

### Error
- Red progress bar (`bg-red-500`)
- Use when operation fails

### Warning
- Yellow progress bar (`bg-yellow-500`)
- Use for warnings or important notices

## Size Options

### Small (`sm`)
- Height: 4px
- Use in compact spaces

### Medium (`md`)
- Height: 8px
- Default size, use in most cases

### Large (`lg`)
- Height: 12px
- Use for prominent progress indicators

## Accessibility

- ✅ **ARIA Attributes**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- ✅ **Screen Reader Support**: Progress announced to assistive technologies
- ✅ **Visual Feedback**: Clear visual progress indication

## Integration with Story 3.3

Used in CSV Import Tool for:

1. **File Upload Progress**
```tsx
<ProgressBar
  value={uploadProgress}
  max={100}
  label="Uploading arquivo CSV"
  showPercentage
  animated
/>
```

2. **Record Processing**
```tsx
<ProgressBar
  value={processedCount}
  max={totalCount}
  label={`Importando candidatos`}
  showFraction
  showPercentage
/>
```

3. **Step Indicator**
```tsx
<ProgressBarWithSteps
  currentStep={wizardStep}
  totalSteps={3}
  stepLabels={['Upload', 'Validação', 'Confirmação']}
/>
```

## Animation

The `animated` prop adds a pulse animation to the progress bar:

```tsx
<ProgressBar
  value={progress}
  max={100}
  animated={progress < 100} // Animate while in progress
  variant={progress === 100 ? 'success' : 'default'}
/>
```

## Best Practices

1. **Always show progress info** - Use `showPercentage` or `showFraction` for clarity
2. **Update variant on completion** - Change to `success` or `error` when done
3. **Use appropriate labels** - Describe what is being processed
4. **Animate during progress** - Set `animated={true}` while processing
5. **Clamp values** - Component automatically clamps values between 0 and max

## Related Components

- [Stepper](./stepper.md) - For multi-step navigation with clickable steps
- [FileUpload](./file-upload.md) - Often used together for file upload flows
- [Alert](./alert.md) - For showing completion or error messages
