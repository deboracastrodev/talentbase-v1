/**
 * Validation utilities for forms
 *
 * Centralized validation logic to avoid duplication across components.
 * Follows DRY principle and ensures consistent validation rules.
 */

import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

import { VALIDATION_PATTERNS, VALIDATION_RULES, ERROR_MESSAGES } from './constants';
import { stripFormatting } from './formatting';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 * @param email - Email string to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_EMAIL };
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @param password - Password string to validate
 * @returns Validation result with error message if invalid
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_PASSWORD };
  }

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }

  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_WEAK };
  }

  return { isValid: true };
}

/**
 * Validate password confirmation matches original password
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result with error message if passwords don't match
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (password !== confirmPassword) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORDS_DONT_MATCH };
  }

  return { isValid: true };
}

/**
 * Validate full name
 * @param fullName - Full name string to validate
 * @returns Validation result with error message if invalid
 */
export function validateFullName(fullName: string): ValidationResult {
  if (!fullName || fullName.trim().length < VALIDATION_RULES.FULL_NAME_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.FULL_NAME_TOO_SHORT };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 * Accepts formatted or unformatted phone numbers
 * Requirements: 10-15 digits (Brazilian format)
 *
 * @param phone - Phone string to validate
 * @returns Validation result with error message if invalid
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_PHONE };
  }

  const phoneDigits = stripFormatting(phone);

  if (
    phoneDigits.length < VALIDATION_RULES.PHONE_MIN_DIGITS ||
    phoneDigits.length > VALIDATION_RULES.PHONE_MAX_DIGITS
  ) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PHONE };
  }

  return { isValid: true };
}

/**
 * Validate CNPJ (Brazilian company tax ID)
 * Uses cpf-cnpj-validator library for check digit validation
 * Accepts formatted or unformatted CNPJ
 *
 * @param cnpj - CNPJ string to validate
 * @returns Validation result with error message if invalid
 */
export function validateCNPJ(cnpj: string): ValidationResult {
  if (!cnpj) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_CNPJ };
  }

  const cnpjNumbers = stripFormatting(cnpj);

  if (cnpjNumbers.length !== VALIDATION_RULES.CNPJ_DIGITS) {
    return { isValid: false, error: ERROR_MESSAGES.CNPJ_WRONG_LENGTH };
  }

  if (!cnpjValidator.isValid(cnpj)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_CNPJ };
  }

  return { isValid: true };
}

/**
 * Validate URL
 * @param url - URL string to validate
 * @param required - Whether the field is required
 * @returns Validation result with error message if invalid
 */
export function validateURL(url: string, required: boolean = false): ValidationResult {
  if (!url) {
    if (required) {
      return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }
    return { isValid: true }; // Optional field, empty is valid
  }

  if (!VALIDATION_PATTERNS.URL.test(url)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_URL };
  }

  return { isValid: true };
}

/**
 * Validate company name
 * @param companyName - Company name string to validate
 * @returns Validation result with error message if invalid
 */
export function validateCompanyName(companyName: string): ValidationResult {
  if (!companyName || companyName.trim().length < VALIDATION_RULES.FULL_NAME_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.COMPANY_NAME_TOO_SHORT };
  }

  return { isValid: true };
}
