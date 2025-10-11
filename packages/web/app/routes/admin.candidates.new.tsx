/**
 * Admin Create Candidate - Complete Profile Wizard
 *
 * Story 3.3.5 (Extended) - Admin can create candidate with ALL CandidateProfile fields
 * Route: /admin/candidates/new
 *
 * 6-Step Wizard:
 * 1. Informações Básicas (email, nome, telefone, cidade, linkedin, cpf, zip, foto)
 * 2. Posição & Experiência (position, years, sales_type, cycle, ticket, degree, bio)
 * 3. Ferramentas & Habilidades (tools, top_skills, languages)
 * 4. Soluções & Departamentos (solutions, departments)
 * 5. Preferências de Trabalho (work_model, relocation, travel, PJ, PCD, salary, CNH)
 * 6. Histórico & Vídeo (experiences, video, contract_signed, interview_date, send_email)
 */

import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useNavigate, useActionData } from '@remix-run/react';
import { MultiStepWizard, Button, Alert, Logo } from '@talentbase/design-system';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  Step1BasicInfo,
  Step2Position,
  Step3Skills,
  Step4Solutions,
  Step5Preferences,
  Step6History,
} from '~/components/admin/candidate-wizard';
import { apiServer } from '~/lib/apiServer';
import {
  AUTO_SAVE_INTERVAL,
  DRAFT_STORAGE_KEY,
  WIZARD_STEPS,
} from '~/lib/constants/admin-candidate';
import type {
  AdminCandidateActionData,
  AdminCandidateFormData,
  CreateCandidateResponse,
} from '~/lib/types/admin-candidate';
import { validateWizardStep } from '~/lib/validation/admin-candidate';
import { requireAdmin } from '~/utils/auth.server';

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
  const data = JSON.parse(formData.get('data')?.toString() || '{}');

  try {
    // Call API to create candidate
    const response = await apiServer.post<CreateCandidateResponse>(
      '/api/v1/candidates/admin/candidates/create',
      data,
      { token }
    );

    // Redirect to candidates list with success message
    return redirect(`/admin/candidates?created=true&email_sent=${response.email_sent}`);
  } catch (error: any) {
    console.error('[Admin Create Candidate] Error:', error);

    // Handle duplicate email error
    if (error.status === 400 && error.data?.email) {
      return json<AdminCandidateActionData>(
        {
          fieldErrors: {
            email: 'Este email já está cadastrado no sistema',
          },
        },
        { status: 400 }
      );
    }

    // Generic error
    return json<AdminCandidateActionData>(
      {
        error: 'Erro ao criar candidato. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

export default function AdminCreateCandidateWizard() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState<AdminCandidateFormData>({
    email: '',
    full_name: '',
    phone: '',
    city: '',
    current_position: '',
    years_of_experience: 0,
    sales_type: '',
    tools_software: [],
    solutions_sold: [],
    departments_sold_to: [],
    send_welcome_email: false,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [formData]);

  const updateFormData = (updates: Partial<AdminCandidateFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (validateWizardStep(currentStep, formData)) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    alert('Rascunho salvo com sucesso!');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const form = new FormData();
    form.append('data', JSON.stringify(formData));

    try {
      const response = await fetch('', {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        // Clear draft
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const emailError = actionData?.fieldErrors?.email;

    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo formData={formData} onUpdate={updateFormData} emailError={emailError} />
        );
      case 1:
        return <Step2Position formData={formData} onUpdate={updateFormData} />;
      case 2:
        return <Step3Skills formData={formData} onUpdate={updateFormData} />;
      case 3:
        return <Step4Solutions formData={formData} onUpdate={updateFormData} />;
      case 4:
        return <Step5Preferences formData={formData} onUpdate={updateFormData} />;
      case 5:
        return <Step6History formData={formData} onUpdate={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/candidates')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Candidatos
          </Button>

          <div className="flex items-center gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Candidato Completo</h1>
              <p className="text-gray-600 mt-1">Preencha o perfil completo do candidato</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {actionData?.error && (
          <Alert variant="destructive" className="mb-6">
            {actionData.error}
          </Alert>
        )}

        {/* Multi-Step Wizard */}
        <MultiStepWizard
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          canGoNext={validateWizardStep(currentStep, formData)}
          submitLabel="Criar Candidato"
        >
          {renderStepContent()}
        </MultiStepWizard>
      </div>
    </div>
  );
}
