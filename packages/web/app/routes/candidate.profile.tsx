/**
 * Candidate Profile Page (Onboarding)
 *
 * Story 2.1: Redirect destination after registration (AC8)
 * This is a placeholder - full implementation in Epic 3
 */

import { useLocation } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@talentbase/design-system';
import { CheckCircle } from 'lucide-react';

export default function CandidateProfile() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {/* Profile Card - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Complete seu Perfil</CardTitle>
            <CardDescription>
              Bem-vindo ao TalentBase! Complete seu perfil para começar a se candidatar a vagas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta página será implementada no Epic 3: Profile Management.
            </p>
            <p className="text-gray-600 mt-2">
              Aqui você poderá adicionar:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              <li>CPF</li>
              <li>LinkedIn</li>
              <li>Posição atual</li>
              <li>Anos de experiência</li>
              <li>Vídeo de apresentação</li>
              <li>Habilidades e ferramentas</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
