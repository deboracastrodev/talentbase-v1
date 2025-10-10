import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MultiStepWizard, WizardStep } from '../components/MultiStepWizard';
import { Input, FormField } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';

const meta = {
  title: 'Components/MultiStepWizard',
  component: MultiStepWizard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MultiStepWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

const candidateProfileSteps: WizardStep[] = [
  { id: 'basic', label: 'Informações Básicas', description: 'Nome, contato e localização' },
  {
    id: 'experience',
    label: 'Posição & Experiência',
    description: 'Cargo e tipo de vendas',
  },
  { id: 'tools', label: 'Ferramentas', description: 'CRMs e softwares' },
  { id: 'solutions', label: 'Soluções', description: 'Produtos e departamentos' },
  { id: 'history', label: 'Histórico', description: 'Bio e experiências' },
];

// Interactive example with state management
export const CandidateProfileForm: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      location: '',
      position: '',
      experience: '',
      tools: [] as string[],
      solutions: '',
      bio: '',
    });

    const handleNext = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
      setCurrentStep((prev) => Math.min(prev + 1, candidateProfileSteps.length - 1));
    };

    const handlePrevious = () => {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSaveDraft = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
      alert('Rascunho salvo com sucesso!');
    };

    const handleSubmit = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
      alert('Perfil criado com sucesso!');
    };

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-4">
              <FormField label="Nome completo" required>
                <Input
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormField>
              <FormField label="Telefone" required>
                <Input
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </FormField>
              <FormField label="Localização" required>
                <Input
                  placeholder="São Paulo, SP"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </FormField>
            </div>
          );

        case 1:
          return (
            <div className="space-y-4">
              <FormField label="Posição atual" required>
                <Select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="SDR/BDR">SDR/BDR</option>
                  <option value="AE">Account Executive</option>
                  <option value="CSM">Customer Success Manager</option>
                  <option value="Manager">Sales Manager</option>
                </Select>
              </FormField>
              <FormField label="Anos de experiência" required>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </FormField>
              <FormField label="Tipo de vendas">
                <div className="space-y-2">
                  <Checkbox id="inbound" label="Inbound" />
                  <Checkbox id="outbound" label="Outbound" />
                  <Checkbox id="inside" label="Inside Sales" />
                  <Checkbox id="field" label="Field Sales" />
                </div>
              </FormField>
            </div>
          );

        case 2:
          return (
            <div className="space-y-4">
              <FormField label="Ferramentas & Software" required>
                <div className="space-y-2">
                  <Checkbox id="salesforce" label="Salesforce" />
                  <Checkbox id="hubspot" label="Hubspot" />
                  <Checkbox id="apollo" label="Apollo.io" />
                  <Checkbox id="outreach" label="Outreach" />
                  <Checkbox id="salesloft" label="Salesloft" />
                </div>
              </FormField>
            </div>
          );

        case 3:
          return (
            <div className="space-y-4">
              <FormField label="Soluções vendidas" required>
                <Input
                  placeholder="Ex: SaaS B2B, Fintech, HR Tech"
                  value={formData.solutions}
                  onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
                />
              </FormField>
              <FormField label="Departamentos para quem vendeu">
                <div className="space-y-2">
                  <Checkbox id="it" label="IT" />
                  <Checkbox id="finance" label="Finance" />
                  <Checkbox id="hr" label="HR" />
                  <Checkbox id="marketing" label="Marketing" />
                  <Checkbox id="clevel" label="C-Level" />
                </div>
              </FormField>
            </div>
          );

        case 4:
          return (
            <div className="space-y-4">
              <FormField label="Bio profissional" required>
                <Textarea
                  placeholder="Conte um pouco sobre sua trajetória em vendas..."
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 100 caracteres</p>
              </FormField>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Experiências profissionais</p>
                <p className="text-xs text-gray-500">
                  Adicione pelo menos 1 experiência profissional anterior
                </p>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    // Validation logic
    const canGoNext = () => {
      switch (currentStep) {
        case 0:
          return formData.name && formData.phone && formData.location;
        case 1:
          return formData.position && formData.experience;
        case 2:
          return formData.tools.length > 0;
        case 3:
          return formData.solutions;
        case 4:
          return formData.bio.length >= 100;
        default:
          return true;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <MultiStepWizard
          steps={candidateProfileSteps}
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          canGoNext={canGoNext()}
          submitLabel="Criar Perfil"
        >
          {renderStepContent()}
        </MultiStepWizard>
      </div>
    );
  },
};

// Simple 3-step wizard
export const SimpleWizard: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    const steps: WizardStep[] = [
      { id: 'step1', label: 'Passo 1' },
      { id: 'step2', label: 'Passo 2' },
      { id: 'step3', label: 'Passo 3' },
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <MultiStepWizard
          steps={steps}
          currentStep={currentStep}
          onNext={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
          onPrevious={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          showSaveDraft={false}
        >
          <div className="py-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Conteúdo do {steps[currentStep].label}
            </h3>
            <p className="text-gray-600 mt-2">Aqui vai o conteúdo do formulário</p>
          </div>
        </MultiStepWizard>
      </div>
    );
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    steps: candidateProfileSteps,
    currentStep: 2,
    isLoading: true,
    children: (
      <div className="space-y-4">
        <FormField label="Campo de exemplo">
          <Input placeholder="Digite algo..." />
        </FormField>
      </div>
    ),
  },
};

// Last step
export const LastStep: Story = {
  args: {
    steps: candidateProfileSteps,
    currentStep: 4,
    submitLabel: 'Criar Perfil',
    children: (
      <div className="space-y-4">
        <FormField label="Bio profissional">
          <Textarea placeholder="Conte sua história..." rows={6} />
        </FormField>
      </div>
    ),
  },
};

// First step
export const FirstStep: Story = {
  args: {
    steps: candidateProfileSteps,
    currentStep: 0,
    children: (
      <div className="space-y-4">
        <FormField label="Nome completo" required>
          <Input placeholder="Digite seu nome" />
        </FormField>
      </div>
    ),
  },
};
