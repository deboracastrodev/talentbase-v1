/**
 * Step 6: History & Video
 * Admin Candidate Creation Wizard
 */

import { Checkbox, Input } from '@talentbase/design-system';

import { ExperienceEditor } from '~/components/candidate/ExperienceEditor';
import { VideoUpload } from '~/components/candidate/VideoUpload';
import type { AdminCandidateFormData } from '~/lib/types/admin-candidate';

interface Step6HistoryProps {
  formData: AdminCandidateFormData;
  onUpdate: (updates: Partial<AdminCandidateFormData>) => void;
}

export function Step6History({ formData, onUpdate }: Step6HistoryProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Histórico & Vídeo</h3>
      <p className="text-sm text-gray-600">Todos os campos desta etapa são opcionais</p>

      <div className="space-y-6">
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Experiências Profissionais</p>
          <ExperienceEditor
            experiences={formData.experiences || []}
            onChange={(experiences) => onUpdate({ experiences })}
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Vídeo Pitch</p>
          <VideoUpload
            onUploadComplete={(url, type) =>
              onUpdate({
                pitch_video_url: url,
                pitch_video_type: type === 's3' ? 's3' : 'youtube',
              })
            }
            currentVideoUrl={formData.pitch_video_url}
            currentVideoType={formData.pitch_video_type}
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Informações Administrativas</h4>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contract_signed"
                checked={formData.contract_signed || false}
                onCheckedChange={(checked) => onUpdate({ contract_signed: checked as boolean })}
              />
              <label
                htmlFor="contract_signed"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Contrato assinado
              </label>
            </div>

            <div>
              <label
                htmlFor="interview_date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data da Entrevista
              </label>
              <Input
                id="interview_date"
                type="date"
                value={formData.interview_date || ''}
                onChange={(e) => onUpdate({ interview_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="send_welcome_email"
                checked={formData.send_welcome_email}
                onCheckedChange={(checked) => onUpdate({ send_welcome_email: checked as boolean })}
              />
              <div className="flex-1">
                <label
                  htmlFor="send_welcome_email"
                  className="block text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Enviar email de boas-vindas
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  O candidato receberá um email com link para definir sua senha e completar o
                  perfil. O link expira em 7 dias. Deixe desmarcado se estiver apenas registrando o
                  candidato.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
