/**
 * Constants for Admin Candidate Creation
 * Story 3.3.5
 */

export const DRAFT_STORAGE_KEY = 'admin_candidate_draft';

export const POSITION_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'SDR/BDR', label: 'SDR/BDR' },
  { value: 'AE/Closer', label: 'Account Executive/Closer' },
  { value: 'CSM', label: 'Customer Success Manager' },
  { value: 'Account Executive', label: 'Account Executive' },
  { value: 'Customer Success', label: 'Customer Success' },
  { value: 'Inside Sales', label: 'Inside Sales' },
  { value: 'Field Sales', label: 'Field Sales' },
] as const;

export const SALES_TYPE_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'Inbound', label: 'Inbound' },
  { value: 'Outbound', label: 'Outbound' },
  { value: 'Both', label: 'Ambos' },
] as const;

export const WORK_MODEL_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'onsite', label: 'Presencial' },
] as const;

export const WIZARD_STEPS = [
  {
    id: '1',
    label: 'Informações Básicas',
    description: 'Email, nome, telefone e contatos',
  },
  {
    id: '2',
    label: 'Posição & Experiência',
    description: 'Cargo, tempo de experiência e formação',
  },
  {
    id: '3',
    label: 'Ferramentas & Habilidades',
    description: 'Tecnologias, skills e idiomas',
  },
  {
    id: '4',
    label: 'Soluções & Departamentos',
    description: 'Experiência por segmento e buyer persona',
  },
  {
    id: '5',
    label: 'Preferências de Trabalho',
    description: 'Modelo de trabalho, disponibilidade e remuneração',
  },
  {
    id: '6',
    label: 'Histórico & Vídeo',
    description: 'Experiências profissionais e vídeo pitch',
  },
] as const;

export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
