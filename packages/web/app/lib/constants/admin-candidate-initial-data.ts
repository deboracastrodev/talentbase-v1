/**
 * Initial Form Data for Admin Candidate Creation
 *
 * Centralized initial data structure for the candidate wizard form.
 * Ensures all fields are properly initialized and type-safe.
 */

import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';

/**
 * Creates initial form data with all fields properly initialized
 *
 * Benefits:
 * - Type-safe: Matches AdminCandidateFormData interface
 * - Reusable: Can be used in different components
 * - Complete: All 6 wizard steps have their fields initialized
 * - Maintainable: Single source of truth for initial values
 *
 * @returns Complete initial form data structure
 */
export function createInitialCandidateFormData(): AdminCandidateFormData {
  return {
    // Step 1: Informações Básicas
    email: '',
    full_name: '',
    phone: '',
    city: '',
    linkedin: '',
    cpf: '',
    zip_code: '',
    profile_photo_url: '',

    // Step 2: Posição & Experiência
    current_position: '',
    years_of_experience: 0,
    sales_type: '',
    sales_cycle: '',
    avg_ticket: '',
    academic_degree: '',
    bio: '',

    // Step 3: Ferramentas & Habilidades
    tools_software: [],
    top_skills: [],
    languages: [],

    // Step 4: Soluções & Departamentos
    solutions_sold: [],
    departments_sold_to: [],

    // Step 5: Preferências de Trabalho
    work_model: undefined,
    relocation_availability: '',
    travel_availability: '',
    accepts_pj: false,
    pcd: false,
    is_pcd: false,
    position_interest: '',
    minimum_salary: '',
    salary_notes: '',
    has_drivers_license: false,
    has_vehicle: false,

    // Step 6: Histórico & Vídeo
    experiences: [],
    pitch_video_url: '',
    pitch_video_type: undefined,
    contract_signed: false,
    interview_date: '',

    // CSV/Notion experience fields
    active_prospecting_experience: '',
    inbound_qualification_experience: '',
    portfolio_retention_experience: '',
    portfolio_expansion_experience: '',
    portfolio_size: '',
    inbound_sales_experience: '',
    outbound_sales_experience: '',
    field_sales_experience: '',
    inside_sales_experience: '',

    // Admin option
    send_welcome_email: false,
  };
}

/**
 * Validates if the form data structure is complete
 * Useful for testing and debugging
 */
export function isFormDataComplete(data: Partial<AdminCandidateFormData>): boolean {
  const requiredFields: (keyof AdminCandidateFormData)[] = [
    'email',
    'full_name',
    'phone',
    'city',
    'current_position',
    'years_of_experience',
    'sales_type',
    'tools_software',
    'solutions_sold',
    'departments_sold_to',
    'send_welcome_email',
  ];

  return requiredFields.every((field) => {
    const value = data[field];
    if (Array.isArray(value)) {
      return true; // Arrays can be empty
    }
    if (typeof value === 'boolean') {
      return true; // Booleans always have a value
    }
    if (typeof value === 'number') {
      return value >= 0; // Numbers should be >= 0
    }
    return value !== undefined && value !== null && value !== '';
  });
}
