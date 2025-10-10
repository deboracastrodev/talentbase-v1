# RadioGroup Component

## Overview

Grouped radio button input for selecting one option from multiple choices. Used for forms with mutually exclusive options across the TalentBase platform.

## Features

- ✅ **Visual Selection**: Card-style radio buttons with clear selection state
- ✅ **Descriptions**: Optional description text for each option
- ✅ **Validation**: Required field support with error messages
- ✅ **Disabled States**: Disable all options or individual options
- ✅ **Orientations**: Vertical (default) and horizontal layouts
- ✅ **Accessibility**: Full ARIA support and keyboard navigation
- ✅ **Radio Cards**: Alternative card-based variant

## Import

```tsx
import { RadioGroup, RadioCard, type RadioOption } from '@talentbase/design-system';
```

## Basic Usage

```tsx
const [value, setValue] = useState('merge');

const options: RadioOption[] = [
  {
    value: 'replace',
    label: 'Substituir dados existentes',
    description: 'Remove todos os registros antigos',
  },
  {
    value: 'merge',
    label: 'Mesclar com dados existentes',
    description: 'Atualiza registros e adiciona novos',
  },
];

<RadioGroup
  name="import-mode"
  options={options}
  value={value}
  onChange={setValue}
  label="Modo de Importação"
/>
```

## RadioGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | **Required**. Name attribute for radio inputs |
| `options` | `RadioOption[]` | - | **Required**. Array of radio options |
| `value` | `string` | - | Currently selected value |
| `onChange` | `(value: string) => void` | - | Callback when selection changes |
| `label` | `string` | - | Group label |
| `helperText` | `string` | - | Helper text below group |
| `error` | `string` | - | Error message |
| `disabled` | `boolean` | `false` | Disable all options |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout orientation |
| `required` | `boolean` | `false` | Required field |
| `className` | `string` | - | Additional CSS classes |

## RadioOption Interface

```tsx
interface RadioOption {
  value: string;        // Option value
  label: string;        // Option label
  description?: string; // Optional description
  disabled?: boolean;   // Is option disabled?
  icon?: ReactNode;     // Optional icon
}
```

## RadioCard Props

For the card variant:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | **Required**. Name attribute |
| `value` | `string` | - | **Required**. Card value |
| `checked` | `boolean` | - | **Required**. Is selected? |
| `onChange` | `() => void` | - | **Required**. On change callback |
| `title` | `string` | - | **Required**. Card title |
| `description` | `string` | - | Card description |
| `icon` | `ReactNode` | - | Card icon |
| `disabled` | `boolean` | `false` | Is disabled? |
| `className` | `string` | - | Additional CSS classes |

## Examples

### Simple Options

```tsx
const [format, setFormat] = useState('csv');

const formatOptions: RadioOption[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel (XLSX)' },
  { value: 'json', label: 'JSON' },
];

<RadioGroup
  name="file-format"
  options={formatOptions}
  value={format}
  onChange={setFormat}
  label="Formato do arquivo"
/>
```

### With Descriptions

```tsx
const importModes: RadioOption[] = [
  {
    value: 'replace',
    label: 'Substituir dados existentes',
    description: 'Remove todos os registros antigos e importa apenas os novos',
  },
  {
    value: 'merge',
    label: 'Mesclar com dados existentes',
    description: 'Atualiza registros existentes e adiciona novos',
  },
  {
    value: 'skip',
    label: 'Ignorar duplicados',
    description: 'Mantém dados existentes e adiciona apenas registros novos',
  },
];

<RadioGroup
  name="import-mode"
  options={importModes}
  value={mode}
  onChange={setMode}
  label="Como deseja importar os dados?"
  helperText="Esta escolha afetará como os dados serão processados"
/>
```

### Required Field with Validation

```tsx
const [plan, setPlan] = useState('');
const [error, setError] = useState('');

const handleSubmit = () => {
  if (!plan) {
    setError('Por favor, selecione um plano');
    return;
  }
  // Continue...
};

<RadioGroup
  name="plan"
  options={planOptions}
  value={plan}
  onChange={(value) => {
    setPlan(value);
    setError(''); // Clear error on change
  }}
  label="Escolha seu plano"
  required
  error={error}
/>
```

### Horizontal Orientation

```tsx
const yesNoOptions: RadioOption[] = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
];

<RadioGroup
  name="confirm"
  options={yesNoOptions}
  value={confirm}
  onChange={setConfirm}
  label="Confirmar importação?"
  orientation="horizontal"
/>
```

### Disabled State

```tsx
<RadioGroup
  name="plan"
  options={planOptions}
  value="basic"
  onChange={() => {}}
  label="Plano Atual"
  disabled
  helperText="Não é possível alterar o plano no momento"
/>
```

### Individual Disabled Option

```tsx
const options: RadioOption[] = [
  { value: 'free', label: 'Gratuito', description: 'Até 10 candidatos' },
  { value: 'basic', label: 'Básico', description: 'Até 100 candidatos' },
  {
    value: 'pro',
    label: 'Profissional (Esgotado)',
    description: 'Indisponível no momento',
    disabled: true,
  },
];

<RadioGroup
  name="plan"
  options={options}
  value={plan}
  onChange={setPlan}
  label="Escolha seu plano"
/>
```

### Radio Cards Variant

```tsx
const [plan, setPlan] = useState('basic');

<div className="space-y-3">
  <RadioCard
    name="plan-card"
    value="free"
    checked={plan === 'free'}
    onChange={() => setPlan('free')}
    title="Gratuito"
    description="Até 10 candidatos"
    icon={<UserIcon className="w-6 h-6" />}
  />
  <RadioCard
    name="plan-card"
    value="basic"
    checked={plan === 'basic'}
    onChange={() => setPlan('basic')}
    title="Básico"
    description="Até 100 candidatos - R$ 99/mês"
    icon={<UsersIcon className="w-6 h-6" />}
  />
  <RadioCard
    name="plan-card"
    value="pro"
    checked={plan === 'pro'}
    onChange={() => setPlan('pro')}
    title="Profissional"
    description="Candidatos ilimitados - R$ 299/mês"
    icon={<StarIcon className="w-6 h-6" />}
  />
</div>
```

## Visual States

### Default State
- Gray border (`border-gray-200`)
- White background
- Hover effect on non-disabled options

### Selected State
- Blue border (`border-primary-500`)
- Light blue background (`bg-primary-50`)
- Custom radio circle with blue fill

### Disabled State
- Reduced opacity (`opacity-50`)
- Gray background (`bg-gray-50`)
- Not clickable (`cursor-not-allowed`)

### Error State
- Red border (`border-red-500`)
- Error message displayed below

## Accessibility

- ✅ **ARIA Attributes**: `role="radiogroup"`, `aria-required`, `aria-describedby`
- ✅ **Keyboard Navigation**: Tab to navigate, Space to select
- ✅ **Focus Management**: Clear focus indicators
- ✅ **Screen Reader Support**: Labels and descriptions announced
- ✅ **Error Announcements**: Errors have `role="alert"`

## Integration with Story 3.3

Used in CSV Import Tool for import mode selection:

```tsx
const importModes: RadioOption[] = [
  {
    value: 'replace',
    label: 'Substituir todos os candidatos',
    description: 'Remove candidatos existentes e importa os novos',
    icon: <RefreshIcon />,
  },
  {
    value: 'merge',
    label: 'Atualizar e adicionar',
    description: 'Atualiza candidatos existentes (por e-mail) e adiciona novos',
    icon: <MergeIcon />,
  },
  {
    value: 'skip',
    label: 'Apenas adicionar novos',
    description: 'Ignora e-mails duplicados, adiciona apenas novos candidatos',
    icon: <PlusIcon />,
  },
];

<RadioGroup
  name="import-mode"
  options={importModes}
  value={importMode}
  onChange={setImportMode}
  label="Modo de Importação"
  required
  error={validationError}
  helperText="Escolha como os dados do CSV serão importados"
/>
```

## Form Integration

```tsx
function ImportConfigForm() {
  const [mode, setMode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!mode) {
      setErrors({ mode: 'Selecione um modo de importação' });
      return;
    }

    // Submit...
  };

  return (
    <form onSubmit={handleSubmit}>
      <RadioGroup
        name="import-mode"
        options={importModes}
        value={mode}
        onChange={(value) => {
          setMode(value);
          setErrors({});
        }}
        label="Modo de Importação"
        required
        error={errors.mode}
      />

      <button type="submit">Continuar</button>
    </form>
  );
}
```

## Best Practices

1. **Use descriptions** - Help users understand each option
2. **Limit options** - 3-7 options is ideal, use Select for more
3. **Provide helper text** - Explain the purpose of the selection
4. **Handle validation** - Show clear error messages
5. **Use RadioCards for complex options** - Better for options with icons and longer descriptions
6. **Keep labels short** - Use descriptions for details
7. **Mark required fields** - Use `required` prop and show asterisk

## Related Components

- [Checkbox](./checkbox.md) - For multiple selections
- [Select](./select.md) - For many options (dropdown)
- [FormField](./input.md#formfield) - For wrapping form inputs
- [Button](./button.md) - For form submission
