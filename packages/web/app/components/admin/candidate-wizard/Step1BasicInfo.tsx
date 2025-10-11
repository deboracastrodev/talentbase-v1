/**
 * Step 1: Basic Information
 * Admin Candidate Creation Wizard
 */

import { Alert, Input } from '@talentbase/design-system';

import { PhotoUpload } from '~/components/candidate/PhotoUpload';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';
import { formatPhone } from '~/utils/formatting';

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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="candidato@exemplo.com"
              value={formData.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <Input
              id="full_name"
              placeholder="João Silva"
              value={formData.full_name}
              onChange={(e) => onUpdate({ full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
              required
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Cidade <span className="text-red-500">*</span>
            </label>
            <Input
              id="city"
              placeholder="São Paulo, SP"
              value={formData.city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Adicionais (Opcional)
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin || ''}
              onChange={(e) => onUpdate({ linkedin: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
              CPF
            </label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf || ''}
              onChange={(e) => onUpdate({ cpf: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Será criptografado no banco de dados</p>
          </div>

          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
              CEP
            </label>
            <Input
              id="zip_code"
              placeholder="00000-000"
              value={formData.zip_code || ''}
              onChange={(e) => onUpdate({ zip_code: e.target.value })}
            />
          </div>

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
