# Stepper Component

## Overview

Multi-step wizard navigation with step status indicators. Used for guided workflows like CSV import, profile creation, and onboarding processes across the TalentBase platform.

## Features

- ✅ **Visual Progress**: Clear step indicators with completion status
- ✅ **Orientations**: Horizontal and vertical layouts
- ✅ **Interactive**: Clickable completed steps for navigation
- ✅ **Status Indicators**: Completed, current, upcoming, and error states
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ✅ **Optional Steps**: Mark non-required steps as optional

## Import

```tsx
import { Stepper, type Step } from '@talentbase/design-system';
```

## Basic Usage

```tsx
const steps: Step[] = [
  { id: '1', label: 'Upload', description: 'Selecionar arquivo CSV' },
  { id: '2', label: 'Validar', description: 'Verificar dados' },
  { id: '3', label: 'Confirmar', description: 'Revisar importação' },
];

<Stepper
  steps={steps}
  currentStep={1}
  orientation="horizontal"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | - | **Required**. Array of step configurations |
| `currentStep` | `number` | - | **Required**. Current active step (0-indexed) |
| `onStepClick` | `(stepIndex: number) => void` | - | Callback when step is clicked |
| `clickableSteps` | `boolean` | `false` | Allow clicking on completed steps |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Stepper layout |
| `errorSteps` | `number[]` | `[]` | Steps with errors (0-indexed) |
| `className` | `string` | - | Additional CSS classes |

## Step Interface

```tsx
interface Step {
  id: string;           // Unique identifier
  label: string;        // Step name (e.g., "Upload CSV")
  description?: string; // Optional description
  icon?: ReactNode;     // Optional custom icon
  optional?: boolean;   // Mark as optional step
}
```

## Step Status

Each step has one of these statuses:

- **Completed**: Step is finished (green checkmark)
- **Current**: Step is active (blue with ring)
- **Upcoming**: Step not yet reached (gray)
- **Error**: Step has error (red with X icon)

## Examples

### Horizontal Stepper (Default)

```tsx
<Stepper
  steps={[
    { id: '1', label: 'Upload', description: 'Selecionar arquivo' },
    { id: '2', label: 'Validar', description: 'Verificar dados' },
    { id: '3', label: 'Confirmar', description: 'Revisar e importar' },
  ]}
  currentStep={1}
  orientation="horizontal"
/>
```

### Vertical Stepper

```tsx
<Stepper
  steps={[
    { id: '1', label: 'Dados Pessoais', description: 'Nome, e-mail e telefone' },
    { id: '2', label: 'Experiência', description: 'Histórico profissional' },
    { id: '3', label: 'Habilidades', description: 'Skills e competências', optional: true },
    { id: '4', label: 'Revisão', description: 'Confirmar informações' },
  ]}
  currentStep={2}
  orientation="vertical"
/>
```

### Interactive Wizard

```tsx
const [currentStep, setCurrentStep] = useState(0);

<Stepper
  steps={steps}
  currentStep={currentStep}
  onStepClick={(stepIndex) => setCurrentStep(stepIndex)}
  clickableSteps
  orientation="horizontal"
/>
```

### With Error Step

```tsx
<Stepper
  steps={steps}
  currentStep={2}
  errorSteps={[1]} // Step 2 (index 1) has an error
  orientation="horizontal"
/>
```

### With Custom Icons

```tsx
const steps: Step[] = [
  {
    id: '1',
    label: 'Upload',
    icon: <UploadIcon className="w-5 h-5" />
  },
  {
    id: '2',
    label: 'Process',
    icon: <ProcessIcon className="w-5 h-5" />
  },
  {
    id: '3',
    label: 'Complete',
    icon: <CheckIcon className="w-5 h-5" />
  },
];

<Stepper steps={steps} currentStep={1} />
```

## Complete Wizard Example

```tsx
function ImportWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    { id: '1', label: 'Upload CSV', description: 'Selecionar arquivo' },
    { id: '2', label: 'Validação', description: 'Verificar dados' },
    { id: '3', label: 'Confirmação', description: 'Revisar e importar' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(stepIndex) => setCurrentStep(stepIndex)}
        clickableSteps
      />

      {/* Step Content */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold">
          {steps[currentStep].label}
        </h3>
        <p className="text-sm text-gray-600">
          {steps[currentStep].description}
        </p>
        {/* Your step-specific content here */}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-primary-500 text-white rounded"
        >
          {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}
```

## Layout Patterns

### Horizontal with Content Below

```tsx
<div className="space-y-6">
  <Stepper steps={steps} currentStep={currentStep} />
  <StepContent step={steps[currentStep]} />
</div>
```

### Vertical Sidebar Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Sidebar with Stepper */}
  <div className="md:col-span-1">
    <Stepper
      steps={steps}
      currentStep={currentStep}
      orientation="vertical"
    />
  </div>

  {/* Main Content */}
  <div className="md:col-span-2">
    <StepContent step={steps[currentStep]} />
  </div>
</div>
```

## Accessibility

- ✅ **ARIA Labels**: `role="button"` for clickable steps, `aria-label` for step numbers
- ✅ **Keyboard Navigation**: Enter/Space to activate clickable steps
- ✅ **Focus Management**: Clear focus indicators
- ✅ **Screen Readers**: Progress announced ("Passo 2 de 3")

## Integration with Story 3.3

Used in CSV Import Tool:

```tsx
const importSteps: Step[] = [
  {
    id: 'upload',
    label: 'Upload CSV',
    description: 'Selecione o arquivo para importação',
  },
  {
    id: 'validate',
    label: 'Validação',
    description: 'Verificando dados e formato',
  },
  {
    id: 'configure',
    label: 'Configuração',
    description: 'Escolha o modo de importação',
    optional: true,
  },
  {
    id: 'confirm',
    label: 'Confirmação',
    description: 'Revise antes de importar',
  },
];

<Stepper
  steps={importSteps}
  currentStep={wizardStep}
  onStepClick={(step) => handleStepNavigation(step)}
  clickableSteps={isNavigationAllowed}
  errorSteps={validationErrors.length > 0 ? [1] : []}
/>
```

## Responsive Design

The Stepper automatically adapts to different screen sizes:

- **Mobile**: Compact horizontal layout, descriptions hidden
- **Tablet**: Full horizontal layout with descriptions
- **Desktop**: Vertical option available for sidebar layouts

## Best Practices

1. **Keep steps simple** - 3-5 steps is ideal, max 7 steps
2. **Use clear labels** - Short, action-oriented names
3. **Provide descriptions** - Help users understand each step
4. **Mark optional steps** - Set `optional: true` for non-required steps
5. **Handle errors visually** - Use `errorSteps` to show validation issues
6. **Enable navigation** - Set `clickableSteps={true}` for better UX
7. **Show progress** - Keep `currentStep` state synchronized

## Related Components

- [ProgressBar](./progress-bar.md) - For continuous progress indication
- [ProgressBarWithSteps](./progress-bar.md#progressbarwithsteps) - Alternative stepped progress
- [MultiStepWizard](./multi-step-wizard.md) - Higher-level wizard component
- [Button](./button.md) - For navigation buttons
