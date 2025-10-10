/**
 * Formatting utilities for Brazilian documents and phone numbers
 *
 * These functions format user input to standard Brazilian formats:
 * - CNPJ: XX.XXX.XXX/XXXX-XX
 * - CPF: XXX.XXX.XXX-XX
 * - Phone: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */

/**
 * Format CNPJ as user types: XX.XXX.XXX/XXXX-XX
 * @param value - Raw CNPJ string (formatted or unformatted)
 * @returns Formatted CNPJ string
 * @example
 * formatCNPJ('12345678000190') // '12.345.678/0001-90'
 */
export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 14) {
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return value;
}

/**
 * Format CPF as user types: XXX.XXX.XXX-XX
 * @param value - Raw CPF string (formatted or unformatted)
 * @returns Formatted CPF string
 * @example
 * formatCPF('12345678900') // '123.456.789-00'
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    return numbers
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }

  return value;
}

/**
 * Format phone number as user types: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 * Handles both mobile (9 digits) and landline (8 digits)
 * @param value - Raw phone string (formatted or unformatted)
 * @returns Formatted phone string
 * @example
 * formatPhone('11999999999') // '(11) 99999-9999'
 * formatPhone('1133334444') // '(11) 3333-4444'
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    // Mobile: (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return numbers.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    // Landline: (XX) XXXX-XXXX
    if (numbers.length === 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    // Partial formatting
    if (numbers.length > 6) {
      return numbers.replace(/^(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
    }
    if (numbers.length > 2) {
      return numbers.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    if (numbers.length > 0) {
      return numbers.replace(/^(\d*)/, '($1');
    }
  }

  return value;
}

/**
 * Remove all formatting from a string, leaving only digits
 * @param value - Formatted string
 * @returns String with only digits
 * @example
 * stripFormatting('12.345.678/0001-90') // '12345678000190'
 */
export function stripFormatting(value: string): string {
  return value.replace(/\D/g, '');
}
