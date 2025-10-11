/**
 * useDraftAutoSave Hook
 *
 * Manages automatic saving of form data to localStorage with configurable interval.
 * Loads initial draft data on mount and periodically saves updates.
 *
 * @example
 * const { formData, updateFormData, clearDraft, saveDraft } = useDraftAutoSave({
 *   storageKey: 'admin-candidate-draft',
 *   initialData: { email: '', full_name: '' },
 *   autoSaveInterval: 30000, // 30 seconds
 * });
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook options
 */
interface UseDraftAutoSaveOptions<T> {
  /**
   * LocalStorage key for storing draft data
   */
  storageKey: string;

  /**
   * Initial form data structure
   */
  initialData: T;

  /**
   * Auto-save interval in milliseconds
   * @default 30000 (30 seconds)
   */
  autoSaveInterval?: number;

  /**
   * Enable/disable auto-save
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook return value
 */
interface UseDraftAutoSaveReturn<T> {
  /**
   * Current form data
   */
  formData: T;

  /**
   * Update form data (partial update)
   */
  updateFormData: (updates: Partial<T>) => void;

  /**
   * Set complete form data
   */
  setFormData: (data: T) => void;

  /**
   * Manually save draft to localStorage
   */
  saveDraft: () => void;

  /**
   * Clear draft from localStorage
   */
  clearDraft: () => void;

  /**
   * Check if draft exists in localStorage
   */
  hasDraft: boolean;
}

/**
 * Validates and parses draft data from localStorage
 */
function loadDraftFromStorage<T>(storageKey: string, initialData: T): T {
  if (typeof window === 'undefined') {
    return initialData;
  }

  try {
    const draft = localStorage.getItem(storageKey);
    if (!draft) {
      return initialData;
    }

    const parsed = JSON.parse(draft);

    // Basic validation: ensure parsed data is an object
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('[useDraftAutoSave] Invalid draft data format, using initial data');
      return initialData;
    }

    return parsed as T;
  } catch (error) {
    console.error('[useDraftAutoSave] Failed to load draft:', error);
    return initialData;
  }
}

/**
 * Auto-save form data to localStorage with periodic saves
 */
export function useDraftAutoSave<T extends Record<string, unknown>>({
  storageKey,
  initialData,
  autoSaveInterval = 30000,
  enabled = true,
}: UseDraftAutoSaveOptions<T>): UseDraftAutoSaveReturn<T> {
  // Load initial draft on mount
  const [formData, setFormData] = useState<T>(() => loadDraftFromStorage(storageKey, initialData));

  // Track if draft exists
  const [hasDraft, setHasDraft] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const exists = localStorage.getItem(storageKey) !== null;
      setHasDraft(exists);
    }
  }, [storageKey]);

  /**
   * Manually save draft to localStorage
   */
  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined' || !enabled) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
      setHasDraft(true);
    } catch (error) {
      console.error('[useDraftAutoSave] Failed to save draft:', error);
    }
  }, [storageKey, formData, enabled]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
    } catch (error) {
      console.error('[useDraftAutoSave] Failed to clear draft:', error);
    }
  }, [storageKey]);

  /**
   * Update form data (partial update)
   */
  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Auto-save effect
   */
  useEffect(() => {
    if (!enabled || autoSaveInterval <= 0) return;

    const interval = setInterval(() => {
      saveDraft();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [enabled, autoSaveInterval, saveDraft]);

  return {
    formData,
    updateFormData,
    setFormData,
    saveDraft,
    clearDraft,
    hasDraft,
  };
}
