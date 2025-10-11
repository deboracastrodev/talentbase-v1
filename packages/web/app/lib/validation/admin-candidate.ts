/**
 * Validation functions for Admin Candidate Creation
 * Story 3.3.5
 */

import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';
import { validatePhone } from '~/utils/validation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep1(formData: AdminCandidateFormData): boolean {
  return !!(
    formData.email &&
    EMAIL_REGEX.test(formData.email) &&
    formData.full_name.trim() &&
    formData.phone &&
    validatePhone(formData.phone) &&
    formData.city.trim()
  );
}

export function validateStep2(formData: AdminCandidateFormData): boolean {
  return !!(formData.current_position && formData.years_of_experience > 0 && formData.sales_type);
}

export function validateStep3(formData: AdminCandidateFormData): boolean {
  return formData.tools_software.length > 0;
}

export function validateStep4(formData: AdminCandidateFormData): boolean {
  return formData.solutions_sold.length > 0 && formData.departments_sold_to.length > 0;
}

export function validateStep5(): boolean {
  return true; // All fields optional
}

export function validateStep6(): boolean {
  return true; // All fields optional
}

export function validateWizardStep(stepIndex: number, formData: AdminCandidateFormData): boolean {
  switch (stepIndex) {
    case 0:
      return validateStep1(formData);
    case 1:
      return validateStep2(formData);
    case 2:
      return validateStep3(formData);
    case 3:
      return validateStep4(formData);
    case 4:
      return validateStep5();
    case 5:
      return validateStep6();
    default:
      return false;
  }
}
