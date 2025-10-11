/**
 * Types for Admin Candidate Creation
 * Story 3.3.5
 */

import type { Language } from '~/components/admin/LanguageInput';
import type { Experience } from '~/components/candidate/ExperienceEditor';

export interface AdminCandidateFormData extends Record<string, unknown> {
  // Step 1: Informações Básicas
  email: string;
  full_name: string;
  phone: string;
  city: string;
  linkedin?: string;
  cpf?: string;
  zip_code?: string;
  profile_photo_url?: string;

  // Step 2: Posição & Experiência
  current_position: string;
  years_of_experience: number;
  sales_type: string;
  sales_cycle?: string;
  avg_ticket?: string;
  academic_degree?: string;
  bio?: string;

  // Step 3: Ferramentas & Habilidades
  tools_software: string[];
  top_skills?: string[];
  languages?: Language[];

  // Step 4: Soluções & Departamentos
  solutions_sold: string[];
  departments_sold_to: string[];

  // Step 5: Preferências de Trabalho
  work_model?: 'remote' | 'hybrid' | 'onsite';
  relocation_availability?: string;
  travel_availability?: string;
  accepts_pj?: boolean;
  pcd?: boolean;
  is_pcd?: boolean;
  position_interest?: string;
  minimum_salary?: string;
  salary_notes?: string;
  has_drivers_license?: boolean;
  has_vehicle?: boolean;

  // Step 6: Histórico & Vídeo
  experiences?: Experience[];
  pitch_video_url?: string;
  pitch_video_type?: 's3' | 'youtube';
  contract_signed?: boolean;
  interview_date?: string;

  // CSV/Notion experience fields
  active_prospecting_experience?: string;
  inbound_qualification_experience?: string;
  portfolio_retention_experience?: string;
  portfolio_expansion_experience?: string;
  portfolio_size?: string;
  inbound_sales_experience?: string;
  outbound_sales_experience?: string;
  field_sales_experience?: string;
  inside_sales_experience?: string;

  // Admin option
  send_welcome_email: boolean;
}

export interface AdminCandidateActionData {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface CreateCandidateResponse {
  success: boolean;
  candidate: {
    id: string;
    email: string;
    full_name: string;
  };
  email_sent: boolean;
}
