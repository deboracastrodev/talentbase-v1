/**
 * Formatting utilities for Brazilian documents and phone numbers
 *
 * These functions format user input to standard Brazilian formats:
 * - CNPJ: XX.XXX.XXX/XXXX-XX
 * - CPF: XXX.XXX.XXX-XX
 * - Phone: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */

import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

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

/**
 * Default timezone for the application (São Paulo, Brazil)
 */
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/**
 * Format date to Brazilian locale (pt-BR) with consistent timezone
 * This function is safe for SSR/hydration as it always uses the same timezone
 *
 * @param date - Date string, Date object, or timestamp
 * @param formatString - Format string (default: 'dd/MM/yyyy')
 * @param timezone - Timezone to use (default: America/Sao_Paulo)
 * @returns Formatted date string in pt-BR locale
 * @example
 * formatDate('2024-01-15T10:30:00Z') // '15/01/2024'
 * formatDate('2024-01-15T10:30:00Z', 'dd/MM/yyyy HH:mm') // '15/01/2024 07:30'
 * formatDate('2024-01-15T10:30:00Z', "dd 'de' MMMM 'de' yyyy") // '15 de janeiro de 2024'
 */
export function formatDate(
  date: string | Date | number,
  formatString: string = 'dd/MM/yyyy',
  timezone: string = DEFAULT_TIMEZONE
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return formatInTimeZone(dateObj, timezone, formatString, { locale: ptBR });
}

/**
 * Format date with time to Brazilian locale
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date and time string
 * @example
 * formatDateTime('2024-01-15T10:30:00Z') // '15/01/2024 07:30'
 */
export function formatDateTime(
  date: string | Date | number,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm', timezone);
}

/**
 * Format date in a relative way (e.g., "2 dias atrás")
 * For dates within the last 7 days, shows relative time
 * For older dates, shows the full date
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted relative or absolute date string
 * @example
 * formatRelativeDate(new Date()) // 'hoje'
 * formatRelativeDate(new Date(Date.now() - 86400000)) // 'ontem'
 * formatRelativeDate('2024-01-01') // '01/01/2024'
 */
export function formatRelativeDate(date: string | Date | number): string {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;

  return formatDate(dateObj);
}
