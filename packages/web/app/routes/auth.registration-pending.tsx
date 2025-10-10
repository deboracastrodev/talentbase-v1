/**
 * Registration Pending Page
 *
 * Story 2.3: Login & Token Authentication
 * Route: /auth/registration-pending (AC6)
 *
 * Displayed when a company user with pending approval tries to login.
 * Per AC6: company (pending) → /auth/registration-pending
 */

import { Link } from '@remix-run/react';
import { AuthLayout, AuthCard, Button } from '@talentbase/design-system';
import { Clock, Mail, CheckCircle } from 'lucide-react';

export default function RegistrationPending() {
  return (
    <AuthLayout>
      <AuthCard
        title="Registro em Análise"
        subtitle="Seu cadastro está sendo analisado pela nossa equipe"
      >
        <div className="space-y-6">
          {/* Pending Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-12 w-12 text-yellow-600" aria-hidden="true" />
            </div>
          </div>

          {/* Information */}
          <div className="space-y-4 text-sm text-gray-600">
            <p className="text-center">
              Obrigado por se registrar na TalentBase! Seu cadastro está em análise.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                Próximos Passos
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Nossa equipe está revisando suas informações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Você receberá um email de confirmação em até 24 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Após aprovação, você poderá acessar sua conta normalmente</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 justify-center text-gray-500">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Verifique sua caixa de entrada e spam</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = '/')}
            >
              Voltar para Home
            </Button>

            <p className="text-center text-xs text-gray-500">
              Dúvidas?{' '}
              <Link to="/support" className="text-primary-600 hover:text-primary-500">
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
