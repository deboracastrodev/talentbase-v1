/**
 * Validation constants and error messages
 *
 * Centralized constants for form validation across the application.
 * Keeps validation rules and messages consistent and DRY.
 */

// Validation Regex Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  FULL_NAME_MIN_LENGTH: 3,
  PHONE_MIN_DIGITS: 10,
  PHONE_MAX_DIGITS: 15,
  CNPJ_DIGITS: 14,
  CPF_DIGITS: 11,
} as const;

// Error Messages - Portuguese (Brazil)
export const ERROR_MESSAGES = {
  // Required fields
  REQUIRED_FIELD: 'Este campo é obrigatório',
  REQUIRED_EMAIL: 'Email é obrigatório',
  REQUIRED_PASSWORD: 'Senha é obrigatória',
  REQUIRED_FULL_NAME: 'Nome completo é obrigatório',
  REQUIRED_PHONE: 'Telefone é obrigatório',
  REQUIRED_CNPJ: 'CNPJ é obrigatório',
  REQUIRED_CPF: 'CPF é obrigatório',
  REQUIRED_COMPANY_NAME: 'Nome da empresa é obrigatório',

  // Format validation
  INVALID_EMAIL: 'Email inválido',
  INVALID_URL: 'URL inválida (ex: https://empresa.com.br)',
  INVALID_CNPJ: 'CNPJ inválido',
  INVALID_CPF: 'CPF inválido',
  INVALID_PHONE: 'Telefone deve ter entre 10 e 15 dígitos',

  // Password validation
  PASSWORD_TOO_SHORT: 'Senha deve ter no mínimo 8 caracteres',
  PASSWORD_WEAK: 'Senha deve conter letras maiúsculas, minúsculas e números',
  PASSWORDS_DONT_MATCH: 'Senhas não conferem',

  // Length validation
  FULL_NAME_TOO_SHORT: 'Nome completo é obrigatório (mínimo 3 caracteres)',
  COMPANY_NAME_TOO_SHORT: 'Nome da empresa é obrigatório (mínimo 3 caracteres)',
  CNPJ_WRONG_LENGTH: 'CNPJ deve ter 14 dígitos',
  CPF_WRONG_LENGTH: 'CPF deve ter 11 dígitos',

  // Server errors
  SERVER_ERROR: 'Erro ao processar requisição. Tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  DUPLICATE_EMAIL: 'Já existe uma conta com este email',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PASSWORDS_MATCH: 'Senhas conferem',
  ACCOUNT_CREATED: 'Conta criada com sucesso!',
  REGISTRATION_SENT: 'Registro enviado, você receberá aprovação em 24 horas',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso',
} as const;

// Helper Text
export const HELPER_TEXT = {
  PASSWORD_REQUIREMENTS: 'Mínimo 8 caracteres com letras maiúsculas, minúsculas e números',
  PHONE_FORMAT: 'Digite apenas números',
  CNPJ_FORMAT: 'Formato: XX.XXX.XXX/XXXX-XX',
  CPF_FORMAT: 'Formato: XXX.XXX.XXX-XX',
  WEBSITE_FORMAT: 'Ex: https://www.empresa.com.br',
} as const;
