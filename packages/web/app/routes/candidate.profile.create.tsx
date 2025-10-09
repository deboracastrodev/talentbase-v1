/**
 * Candidate Profile Creation Route
 * Story 3.1: Multi-step wizard for candidate profile creation.
 *
 * 5 Steps:
 * 1. Basic Info (name, phone, city, photo)
 * 2. Position & Experience (position, years, sales type, cycle, ticket)
 * 3. Tools & Software (multi-select)
 * 4. Solutions & Departments (multi-select)
 * 5. Work History, Bio & Video (experiences, bio, pitch video)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { MultiStepWizard } from '~/components/candidate/MultiStepWizard';
import { PhotoUpload } from '~/components/candidate/PhotoUpload';
import { VideoUpload } from '~/components/candidate/VideoUpload';
import { createCandidateProfile } from '~/lib/api/candidates';
import type { CandidateProfile } from '~/lib/types/candidate';

interface Experience {
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string;
}

interface FormData {
  // Step 1: Basic Info
  full_name: string;
  phone: string;
  city: string;
  profile_photo_url?: string;

  // Step 2: Position & Experience
  current_position: string;
  years_of_experience: number;
  sales_type: string;
  sales_cycle: string;
  avg_ticket: string;

  // Step 3: Tools & Software
  tools_software: string[];

  // Step 4: Solutions & Departments
  solutions_sold: string[];
  departments_sold_to: string[];

  // Step 5: Work History, Bio & Video
  bio: string;
  pitch_video_url: string;
  pitch_video_type: 's3' | 'youtube';
  experiences: Experience[];
}

const INITIAL_FORM_DATA: FormData = {
  full_name: '',
  phone: '',
  city: '',
  current_position: '',
  years_of_experience: 0,
  sales_type: '',
  sales_cycle: '',
  avg_ticket: '',
  tools_software: [],
  solutions_sold: [],
  departments_sold_to: [],
  bio: '',
  pitch_video_url: '',
  pitch_video_type: 's3',
  experiences: [],
};

const DRAFT_STORAGE_KEY = 'candidate_profile_draft';

export default function CandidateProfileCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, []);

  // Auto-save draft every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    // TODO: Also save to backend API when implemented
    console.log('Draft saved to localStorage');
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const profile = await createCandidateProfile(formData);

      // Clear draft after successful creation
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Redirect to profile view
      navigate('/candidate/profile', {
        state: { message: 'Perfil criado! Gere seu link compartilhável.' },
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar perfil');
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 1: Basic Info
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Comece com suas informações de contato e foto de perfil',
      content: (
        <div className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              id="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => updateFormData({ full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="(11) 98765-4321"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              id="city"
              type="text"
              required
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: São Paulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de Perfil
            </label>
            <PhotoUpload
              onUploadComplete={(url) => updateFormData({ profile_photo_url: url })}
              currentPhotoUrl={formData.profile_photo_url}
            />
          </div>
        </div>
      ),
    },

    // Step 2: Position & Experience
    {
      id: 2,
      title: 'Posição & Experiência',
      description: 'Conte-nos sobre sua experiência em vendas',
      content: (
        <div className="space-y-6">
          <div>
            <label htmlFor="current_position" className="block text-sm font-medium text-gray-700 mb-2">
              Posição Atual *
            </label>
            <select
              id="current_position"
              required
              value={formData.current_position}
              onChange={(e) => updateFormData({ current_position: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="SDR/BDR">SDR/BDR</option>
              <option value="AE/Closer">Account Executive/Closer</option>
              <option value="CSM">Customer Success Manager</option>
            </select>
          </div>

          <div>
            <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 mb-2">
              Anos de Experiência *
            </label>
            <input
              id="years_of_experience"
              type="number"
              required
              min="0"
              value={formData.years_of_experience}
              onChange={(e) => updateFormData({ years_of_experience: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="sales_type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vendas *
            </label>
            <select
              id="sales_type"
              required
              value={formData.sales_type}
              onChange={(e) => updateFormData({ sales_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Both">Ambos</option>
            </select>
          </div>

          <div>
            <label htmlFor="sales_cycle" className="block text-sm font-medium text-gray-700 mb-2">
              Ciclo de Vendas Típico
            </label>
            <input
              id="sales_cycle"
              type="text"
              value={formData.sales_cycle}
              onChange={(e) => updateFormData({ sales_cycle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 30-60 dias"
            />
          </div>

          <div>
            <label htmlFor="avg_ticket" className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Médio
            </label>
            <input
              id="avg_ticket"
              type="text"
              value={formData.avg_ticket}
              onChange={(e) => updateFormData({ avg_ticket: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: R$ 10k-50k MRR"
            />
          </div>
        </div>
      ),
    },

    // Step 3: Tools & Software
    {
      id: 3,
      title: 'Ferramentas & Software',
      description: 'Quais ferramentas você domina?',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione todas as ferramentas que você tem experiência:
          </p>
          <ToolsSelector
            selected={formData.tools_software}
            onChange={(tools) => updateFormData({ tools_software: tools })}
          />
        </div>
      ),
    },

    // Step 4: Solutions & Departments
    {
      id: 4,
      title: 'Soluções & Departamentos',
      description: 'Experiência por segmento e buyer persona',
      content: (
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Soluções Vendidas
            </label>
            <SolutionsSelector
              selected={formData.solutions_sold}
              onChange={(solutions) => updateFormData({ solutions_sold: solutions })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Departamentos para quem vendeu
            </label>
            <DepartmentsSelector
              selected={formData.departments_sold_to}
              onChange={(departments) => updateFormData({ departments_sold_to: departments })}
            />
          </div>
        </div>
      ),
    },

    // Step 5: Work History, Bio & Video
    {
      id: 5,
      title: 'Histórico de Trabalho, Bio & Vídeo',
      description: 'Finalize seu perfil com suas experiências e vídeo pitch',
      content: (
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Experiências Profissionais
            </label>
            <ExperienceEditor
              experiences={formData.experiences}
              onChange={(experiences) => updateFormData({ experiences })}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio Profissional
            </label>
            <textarea
              id="bio"
              rows={6}
              value={formData.bio}
              onChange={(e) => updateFormData({ bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escreva um resumo sobre sua trajetória em vendas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vídeo Pitch * (Obrigatório)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Grave um vídeo de até 2 minutos se apresentando. Você pode fazer upload direto ou usar um vídeo do YouTube.
            </p>
            <VideoUpload
              onUploadComplete={(url, type) =>
                updateFormData({
                  pitch_video_url: url,
                  pitch_video_type: type
                })
              }
              currentVideoUrl={formData.pitch_video_url}
              currentVideoType={formData.pitch_video_type}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <MultiStepWizard
            steps={steps}
            onComplete={handleComplete}
            onSaveDraft={handleSaveDraft}
            showDraftButton={!isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

// Tools Selector Component
function ToolsSelector({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (tools: string[]) => void;
}) {
  const tools = [
    'Salesforce',
    'HubSpot',
    'Pipedrive',
    'RD Station',
    'Apollo.io',
    'Outreach',
    'SalesLoft',
    'LinkedIn Sales Navigator',
    'ZoomInfo',
    'Exact Sales',
    'Meetime',
  ];

  const toggleTool = (tool: string) => {
    if (selected.includes(tool)) {
      onChange(selected.filter((t) => t !== tool));
    } else {
      onChange([...selected, tool]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {tools.map((tool) => (
        <label
          key={tool}
          className={`
            flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors
            ${
              selected.includes(tool)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <input
            type="checkbox"
            checked={selected.includes(tool)}
            onChange={() => toggleTool(tool)}
            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">{tool}</span>
        </label>
      ))}
    </div>
  );
}

// Solutions Selector Component
function SolutionsSelector({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (solutions: string[]) => void;
}) {
  const solutions = [
    'SaaS B2B',
    'Fintech',
    'HR Tech',
    'Marketing Tech',
    'Sales Tech',
    'E-commerce',
    'Educação',
    'Saúde',
    'Logística',
    'Serviços Profissionais',
  ];

  const toggleSolution = (solution: string) => {
    if (selected.includes(solution)) {
      onChange(selected.filter((s) => s !== solution));
    } else {
      onChange([...selected, solution]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {solutions.map((solution) => (
        <label
          key={solution}
          className={`
            flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors
            ${
              selected.includes(solution)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <input
            type="checkbox"
            checked={selected.includes(solution)}
            onChange={() => toggleSolution(solution)}
            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">{solution}</span>
        </label>
      ))}
    </div>
  );
}

// Departments Selector Component
function DepartmentsSelector({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (departments: string[]) => void;
}) {
  const departments = [
    'C-Level',
    'Marketing',
    'Vendas',
    'TI/Tecnologia',
    'Financeiro',
    'RH',
    'Operações',
    'Produto',
  ];

  const toggleDepartment = (department: string) => {
    if (selected.includes(department)) {
      onChange(selected.filter((d) => d !== department));
    } else {
      onChange([...selected, department]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {departments.map((department) => (
        <label
          key={department}
          className={`
            flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors
            ${
              selected.includes(department)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <input
            type="checkbox"
            checked={selected.includes(department)}
            onChange={() => toggleDepartment(department)}
            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">{department}</span>
        </label>
      ))}
    </div>
  );
}

// Experience Editor Component
function ExperienceEditor({
  experiences,
  onChange
}: {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}) {
  const addExperience = () => {
    onChange([
      ...experiences,
      {
        company_name: '',
        position: '',
        start_date: '',
        end_date: '',
        responsibilities: '',
      },
    ]);
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-md">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Experiência {index + 1}
            </h4>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remover
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <input
                type="text"
                required
                value={exp.company_name}
                onChange={(e) => updateExperience(index, { company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <input
                type="text"
                required
                value={exp.position}
                onChange={(e) => updateExperience(index, { position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="SDR, AE, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                required
                value={exp.start_date}
                onChange={(e) => updateExperience(index, { start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Término
              </label>
              <input
                type="date"
                value={exp.end_date}
                onChange={(e) => updateExperience(index, { end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Deixe em branco se emprego atual"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsabilidades
            </label>
            <textarea
              rows={3}
              value={exp.responsibilities}
              onChange={(e) => updateExperience(index, { responsibilities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Descreva suas principais responsabilidades e conquistas..."
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExperience}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700"
      >
        + Adicionar Experiência
      </button>
    </div>
  );
}
