# Toast - Exemplos Story 3.3.5

Exemplos práticos de uso do Toast component na Story 3.3.5 (Admin Manual Candidate Creation).

## Setup no Root Layout

Primeiro, adicione o ToastProvider no root da aplicação web:

```tsx
// packages/web/app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { ToastProvider } from '@talentbase/design-system';

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ToastProvider maxToasts={3}>
          <Outlet />
        </ToastProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## Exemplo 1: Form de Criação de Candidato

```tsx
// packages/web/app/routes/admin.candidates.new.tsx
import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '@talentbase/design-system';
import { useEffect } from 'react';
import { AdminLayout } from '~/components/layouts/AdminLayout';
import { requireAdmin } from '~/utils/auth.server';
import { createCandidate } from '~/lib/api/candidates';

interface ActionData {
  success?: boolean;
  email_sent?: boolean;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAdmin(request);
  const formData = await request.formData();

  const data = {
    email: formData.get('email') as string,
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string,
    city: formData.get('city') as string,
    current_position: formData.get('current_position') as string,
    send_welcome_email: formData.get('send_welcome_email') === 'on',
  };

  try {
    const response = await createCandidate(token, data);

    // Return success data to trigger toast
    return json<ActionData>({
      success: true,
      email_sent: response.email_sent
    });
  } catch (error: any) {
    // Return error data to trigger toast
    return json<ActionData>(
      { error: error.message || 'Erro ao criar candidato' },
      { status: 400 }
    );
  }
}

export default function CreateCandidate() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();

  const isSubmitting = navigation.state === 'submitting';

  // Show toast based on action result
  useEffect(() => {
    if (!actionData) return;

    if (actionData.success) {
      // Success toast - message varies based on email_sent flag
      if (actionData.email_sent) {
        toast.success(
          'Candidato criado com sucesso! Email de boas-vindas enviado.',
          'Sucesso!'
        );
      } else {
        toast.success('Candidato criado com sucesso!', 'Sucesso!');
      }

      // Redirect after showing toast
      setTimeout(() => {
        window.location.href = '/admin/candidates?created=true';
      }, 1500);
    } else if (actionData.error) {
      // Error toast - different messages for different errors
      if (actionData.error.includes('already exists')) {
        toast.error(
          'Este email já está cadastrado no sistema.',
          'Email Duplicado'
        );
      } else if (actionData.error.includes('network')) {
        toast.error(
          'Verifique sua conexão e tente novamente.',
          'Erro de Conexão',
          7000 // Longer duration for critical errors
        );
      } else {
        toast.error(
          actionData.error || 'Erro ao criar candidato. Tente novamente.',
          'Erro'
        );
      }
    }
  }, [actionData, toast]);

  return (
    <AdminLayout pageTitle="Criar Candidato" activeItem="candidates">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Novo Candidato</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <Input
                label="Nome Completo"
                name="full_name"
                required
                placeholder="João Silva"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                required
                placeholder="joao@example.com"
                helperText="Email será usado para login do candidato"
              />

              <Input
                label="Telefone"
                name="phone"
                required
                placeholder="(11) 99999-9999"
              />

              <Input
                label="Cidade"
                name="city"
                placeholder="São Paulo, SP"
              />

              <Select
                label="Posição Atual"
                name="current_position"
                options={[
                  { value: '', label: 'Selecione...' },
                  { value: 'SDR/BDR', label: 'SDR/BDR' },
                  { value: 'Account Executive', label: 'Account Executive' },
                  { value: 'Customer Success', label: 'Customer Success' },
                  { value: 'Inside Sales', label: 'Inside Sales' },
                  { value: 'Field Sales', label: 'Field Sales' },
                ]}
              />

              <Checkbox
                name="send_welcome_email"
                label="Enviar email de boas-vindas"
                helperText="Envia email com link para o candidato definir senha e completar perfil"
              />

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Candidato'}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
```

## Exemplo 2: Lista de Candidatos com Ações

```tsx
// packages/web/app/routes/admin.candidates.tsx
import { useToast } from '@talentbase/design-system';

export default function CandidatesList() {
  const { toast } = useToast();

  // Check URL params for success state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('created') === 'true') {
      toast.success('Candidato adicionado à lista!', undefined, 3000);
      // Clean URL
      window.history.replaceState({}, '', '/admin/candidates');
    }
  }, [toast]);

  const handleBulkDelete = async (ids: string[]) => {
    const confirmed = confirm(`Deletar ${ids.length} candidato(s)?`);
    if (!confirmed) return;

    toast.info('Processando...', undefined, 0); // Doesn't auto-dismiss

    try {
      await deleteCandidates(ids);
      toast.success(`${ids.length} candidato(s) removido(s) com sucesso!`);
      refetch();
    } catch (error) {
      toast.error('Erro ao remover candidatos', 'Erro');
    }
  };

  return (
    <AdminLayout>
      {/* ... table with bulk actions ... */}
    </AdminLayout>
  );
}
```

## Exemplo 3: Password Set Page (Candidato)

```tsx
// packages/web/app/routes/auth.set-password.tsx
import { useToast } from '@talentbase/design-system';

export default function SetPassword() {
  const { toast } = useToast();
  const [token] = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    // Client-side validation
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem', 'Erro de Validação');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres', 'Senha Muito Curta');
      return;
    }

    try {
      const response = await setPasswordWithToken(
        token.get('token') as string,
        password
      );

      // Success - save token and redirect
      localStorage.setItem('auth_token', response.access_token);

      toast.success(
        'Senha definida com sucesso! Redirecionando...',
        'Bem-vindo!',
        2000
      );

      setTimeout(() => {
        navigate('/candidate/profile/create');
      }, 2000);
    } catch (error: any) {
      if (error.message.includes('expired')) {
        toast.error(
          'Link expirado. Solicite um novo link ao administrador.',
          'Token Expirado',
          10000 // Longer duration for important error
        );
      } else if (error.message.includes('invalid')) {
        toast.error(
          'Link inválido. Verifique o link ou solicite um novo.',
          'Token Inválido',
          10000
        );
      } else {
        toast.error('Erro ao definir senha. Tente novamente.', 'Erro');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit}>
        {/* ... form fields ... */}
      </form>
    </div>
  );
}
```

## Exemplo 4: CSV Import com Progresso

```tsx
// packages/web/app/routes/admin.import.candidates.tsx
import { useToast } from '@talentbase/design-system';

export default function ImportCandidates() {
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    // Show initial toast that doesn't close
    const uploadToastId = toast.info(
      'Fazendo upload do arquivo CSV...',
      'Processando',
      0 // Never auto-dismiss
    );

    try {
      // Upload file
      const response = await uploadCSV(file);

      // Show success
      toast.success(
        `${response.imported_count} candidatos importados com sucesso!`,
        'Import Concluído'
      );

      // Warnings if any
      if (response.warnings?.length > 0) {
        toast.warning(
          `${response.warnings.length} avisos durante import`,
          'Atenção',
          7000
        );
      }
    } catch (error) {
      toast.error('Erro ao importar arquivo CSV', 'Erro no Import');
    }
  };

  return (
    <AdminLayout>
      {/* ... file upload UI ... */}
    </AdminLayout>
  );
}
```

## Padrões UX Recomendados

### 1. Feedback Imediato

```tsx
// ✅ Bom - feedback imediato
const handleSave = async () => {
  toast.info('Salvando...', undefined, 0);
  await save();
  toast.success('Salvo!');
};

// ❌ Ruim - sem feedback durante ação
const handleSave = async () => {
  await save(); // User doesn't know what's happening
  toast.success('Salvo!');
};
```

### 2. Mensagens Específicas

```tsx
// ✅ Bom - específico e acionável
if (error.code === 'EMAIL_EXISTS') {
  toast.error('Este email já está cadastrado. Use outro email.', 'Email Duplicado');
}

// ❌ Ruim - genérico e não ajuda
toast.error('Erro ao criar');
```

### 3. Duração Apropriada

```tsx
// ✅ Bom - duração baseada em importância
toast.success('Salvo!', undefined, 2000); // Rápido - não interrompe
toast.error('Falha crítica', 'Erro', 10000); // Longo - requer atenção
toast.info('Processando...', undefined, 0); // Permanece até ação terminar
```

### 4. Evitar Spam

```tsx
// ✅ Bom - agrupa notificações
const results = await Promise.allSettled(promises);
const success = results.filter(r => r.status === 'fulfilled').length;
const errors = results.filter(r => r.status === 'rejected').length;

if (success > 0) toast.success(`${success} itens processados`);
if (errors > 0) toast.error(`${errors} erros`);

// ❌ Ruim - múltiplos toasts simultâneos
items.forEach(async item => {
  await process(item);
  toast.success(`${item.name} processado`); // Spam!
});
```

## Testing

### Unit Test

```tsx
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@talentbase/design-system';

function TestComponent() {
  const { toast } = useToast();

  return (
    <button onClick={() => toast.success('Test message')}>
      Show Toast
    </button>
  );
}

test('shows toast on button click', async () => {
  render(
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(await screen.findByText('Test message')).toBeInTheDocument();
});
```

### E2E Test (Playwright)

```typescript
// packages/web/tests/e2e/admin-create-candidate.spec.ts
import { test, expect } from '@playwright/test';

test('shows success toast when candidate created', async ({ page }) => {
  await page.goto('/auth/login');
  // ... login as admin ...

  await page.goto('/admin/candidates/new');

  await page.getByLabel('Nome Completo').fill('João Silva');
  await page.getByLabel('Email').fill('joao@test.com');
  await page.getByLabel('Telefone').fill('11999999999');

  await page.getByRole('button', { name: 'Criar Candidato' }).click();

  // Wait for toast to appear
  const toast = page.locator('[role="alert"]').first();
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Candidato criado com sucesso!');

  // Verify redirect
  await expect(page).toHaveURL(/\/admin\/candidates\?created=true/);
});
```

## Checklist de Implementação

Para Story 3.3.5:

- [ ] ToastProvider adicionado no root.tsx
- [ ] Toast de sucesso no create form (varia baseado em email_sent)
- [ ] Toast de erro para email duplicado
- [ ] Toast de erro para falhas de rede
- [ ] Toast na lista após criação (via URL param)
- [ ] Toast na página set-password (token válido/inválido/expirado)
- [ ] Testes E2E incluem verificação de toasts
- [ ] Acessibilidade verificada (screen reader)
- [ ] Animações funcionando corretamente
