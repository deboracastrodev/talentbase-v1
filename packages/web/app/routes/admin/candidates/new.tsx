/**
 * Admin Create Candidate Manually
 *
 * Story 3.3.5 - AC 1, 2, 3, 4, 5, 6, 7, 13, 14, 16
 * Route: /admin/candidates/new
 * Admin can manually create a candidate with minimal fields
 */

import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useNavigate, Form, useNavigation } from '@remix-run/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  Alert,
  Checkbox,
} from '@talentbase/design-system';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { apiServer } from '~/lib/apiServer';
import { requireAdmin } from '~/utils/auth.server';
import { formatPhone } from '~/utils/formatting';
import { validatePhone } from '~/utils/validation';

interface ActionData {
  error?: string;
  fieldErrors?: {
    email?: string;
    full_name?: string;
    phone?: string;
  };
  success?: boolean;
  candidate?: {
    id: string;
    email: string;
    full_name: string;
  };
  email_sent?: boolean;
}

/**
 * Loader - Check admin authentication
 */
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ ok: true });
}

/**
 * Action - Handle form submission
 */
export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAdmin(request);

  const formData = await request.formData();
  const email = formData.get('email')?.toString() || '';
  const full_name = formData.get('full_name')?.toString() || '';
  const phone = formData.get('phone')?.toString() || '';
  const city = formData.get('city')?.toString() || '';
  const current_position = formData.get('current_position')?.toString() || '';
  const send_welcome_email = formData.get('send_welcome_email') === 'on';

  // Client-side validation
  const fieldErrors: ActionData['fieldErrors'] = {};

  if (!email || !email.includes('@')) {
    fieldErrors.email = 'Email válido é obrigatório';
  }

  if (!full_name || full_name.length < 3) {
    fieldErrors.full_name = 'Nome completo é obrigatório (mínimo 3 caracteres)';
  }

  if (!phone) {
    fieldErrors.phone = 'Telefone é obrigatório';
  } else if (!validatePhone(phone)) {
    fieldErrors.phone = 'Telefone inválido (formato: (11) 99999-9999)';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  try {
    // Call API to create candidate
    const response = await apiServer.post<{
      success: boolean;
      candidate: { id: string; email: string; full_name: string };
      email_sent: boolean;
    }>(
      '/api/v1/candidates/admin/candidates/create',
      {
        email,
        full_name,
        phone,
        city,
        current_position,
        send_welcome_email,
      },
      { token }
    );

    // Redirect to candidates list with success message
    return redirect(`/admin/candidates?created=true&email_sent=${response.email_sent}`);
  } catch (error: any) {
    console.error('[Admin Create Candidate] Error:', error);

    // Handle duplicate email error
    if (error.status === 400 && error.data?.email) {
      return json<ActionData>(
        {
          fieldErrors: {
            email: 'Este email já está cadastrado no sistema',
          },
        },
        { status: 400 }
      );
    }

    // Generic error
    return json<ActionData>(
      {
        error: 'Erro ao criar candidato. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

// Note: AdminLayout is applied by parent route (admin.tsx)
export default function AdminCreateCandidatePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/candidates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Criar Candidato Manualmente</h2>
          <p className="text-gray-600 mt-1">Adicione um candidato com informações básicas</p>
        </div>
      </div>

      {/* Error Alert */}
      {actionData?.error && (
        <Alert variant="destructive" title="Erro">
          {actionData.error}
        </Alert>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Candidato</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Campos Obrigatórios
              </h3>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Ex: João Silva"
                  required
                  error={actionData?.fieldErrors?.full_name}
                  disabled={isSubmitting}
                />
                {actionData?.fieldErrors?.full_name && (
                  <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ex: joao@example.com"
                  required
                  error={actionData?.fieldErrors?.email}
                  disabled={isSubmitting}
                />
                {actionData?.fieldErrors?.email && (
                  <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  error={actionData?.fieldErrors?.phone}
                  disabled={isSubmitting}
                />
                {actionData?.fieldErrors?.phone && (
                  <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.phone}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Formato: (11) 99999-9999</p>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Campos Opcionais
              </h3>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Ex: São Paulo, SP"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">Opcional</p>
              </div>

              {/* Current Position */}
              <div>
                <label
                  htmlFor="current_position"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Posição Atual
                </label>
                <Select
                  id="current_position"
                  name="current_position"
                  disabled={isSubmitting}
                  options={[
                    { value: '', label: 'Selecione (opcional)' },
                    { value: 'SDR/BDR', label: 'SDR/BDR' },
                    { value: 'Account Executive', label: 'Account Executive' },
                    { value: 'Customer Success', label: 'Customer Success' },
                    { value: 'Inside Sales', label: 'Inside Sales' },
                    { value: 'Field Sales', label: 'Field Sales' },
                  ]}
                />
                <p className="mt-1 text-sm text-gray-500">Opcional</p>
              </div>
            </div>

            {/* Email Options Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Opções de Email
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="send_welcome_email"
                    name="send_welcome_email"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="send_welcome_email"
                      className="block text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Enviar email de boas-vindas
                    </label>
                    <p className="mt-1 text-sm text-gray-600">
                      O candidato receberá um email com link para definir sua senha e completar o
                      perfil. O link expira em 7 dias.
                    </p>
                  </div>
                </div>
              </div>

              {!sendEmail && (
                <Alert variant="info" title="Modo Registro Rápido">
                  <p className="text-sm">
                    O candidato será criado como <strong>inativo</strong> sem receber email. Útil
                    para manter registros de candidatos que ainda não precisam acessar o sistema.
                  </p>
                </Alert>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/candidates')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Candidato
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
