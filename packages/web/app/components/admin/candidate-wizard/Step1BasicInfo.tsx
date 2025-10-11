/**
 * Step 1: Basic Information
 * Admin Candidate Creation Wizard
 *
 * Collects essential candidate information including:
 * - Required: email, full name, phone, city
 * - Optional: LinkedIn, CPF, CEP, profile photo
 */

import { Alert, FormField, Input } from '@talentbase/design-system';

import { PhotoUpload } from '~/components/candidate/PhotoUpload';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';
import { formatCPF, formatPhone, formatCEP } from '~/utils/formatting';

interface Step1BasicInfoProps {
  formData: AdminCandidateFormData;
  onUpdate: (updates: Partial<AdminCandidateFormData>) => void;
  emailError?: string;
}

export function Step1BasicInfo({ formData, onUpdate, emailError }: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas *</h3>

        {emailError && (
          <Alert variant="destructive" className="mb-4">
            {emailError}
          </Alert>
        )}

        <div className="space-y-4">
          <FormField label="Email" required>
            <Input
              id="email"
              type="email"
              placeholder="candidato@exemplo.com"
              value={formData.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Nome Completo" required>
            <Input
              id="full_name"
              placeholder="João Silva"
              value={formData.full_name}
              onChange={(e) => onUpdate({ full_name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Telefone" required hint="Formato: (11) 99999-9999">
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
              required
            />
          </FormField>

          <FormField label="Cidade" required>
            <Input
              id="city"
              placeholder="São Paulo, SP"
              value={formData.city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              required
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Adicionais (Opcional)
        </h3>

        <div className="space-y-4">
          <FormField label="LinkedIn" hint="Cole o link completo do perfil">
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin || ''}
              onChange={(e) => onUpdate({ linkedin: e.target.value })}
            />
          </FormField>

          <FormField label="CPF" hint="Será criptografado no banco de dados">
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf || ''}
              onChange={(e) => onUpdate({ cpf: formatCPF(e.target.value) })}
              maxLength={14}
            />
          </FormField>

          <FormField label="CEP" hint="Formato: 00000-000">
            <Input
              id="zip_code"
              placeholder="00000-000"
              value={formData.zip_code || ''}
              onChange={(e) => onUpdate({ zip_code: formatCEP(e.target.value) })}
              maxLength={9}
            />
          </FormField>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</p>
            <PhotoUpload
              onUploadComplete={(url) => onUpdate({ profile_photo_url: url })}
              currentPhotoUrl={formData.profile_photo_url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
