/**
 * Candidate profile types and API response types.
 * Story 3.1: Candidate profile creation.
 */

export interface Experience {
  id?: number;
  company_name: string;
  position: string;
  start_date: string; // ISO date
  end_date?: string | null; // ISO date or null if current
  responsibilities: string;
  created_at?: string;
  updated_at?: string;
}

export interface CandidateProfile {
  id?: number;
  user?: number;
  full_name: string;
  phone: string;
  city?: string;
  cpf?: string;
  linkedin?: string;
  profile_photo_url?: string | null;
  pitch_video_url?: string;
  pitch_video_type?: 'S3' | 'youtube';
  current_position?: string;
  years_of_experience?: number;
  sales_type?: string;
  sales_cycle?: string;
  avg_ticket?: string;
  top_skills?: string[];
  tools_software?: string[];
  solutions_sold?: string[];
  departments_sold_to?: string[];
  bio?: string;
  status?: string;
  is_public?: boolean;
  public_token?: string;
  experiences?: Experience[];
  created_at?: string;
  updated_at?: string;
}

export interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  file_url: string;
  expires_in: number;
}

export interface ApiError {
  error: string | Record<string, string[]>;
}

// Multi-step form state
export interface CandidateFormData {
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
  top_skills: string[];
  tools_software: string[];

  // Step 4: Solutions & Departments
  solutions_sold: string[];
  departments_sold_to: string[];

  // Step 5: Work History & Bio & Video
  bio: string;
  experiences: Experience[];
  pitch_video_url: string;
  pitch_video_type: 's3' | 'youtube';
}

// Form validation errors
export interface FormErrors {
  [key: string]: string | undefined;
}

// Draft state
export interface DraftState extends Partial<CandidateFormData> {
  current_step?: number;
  last_saved?: string; // ISO timestamp
}
