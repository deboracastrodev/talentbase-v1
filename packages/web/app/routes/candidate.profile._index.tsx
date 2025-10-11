/**
 * Candidate Profile Page
 *
 * Story 2.1: Redirect destination after registration (AC8)
 * Updated with CandidateLayout and profile management options
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useLocation, Link } from '@remix-run/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Alert,
} from '@talentbase/design-system';
import { CheckCircle, User, Edit, Eye } from 'lucide-react';

// Loader: Fetch user data
export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Get token from session/cookie and fetch real data
  const user = {
    name: 'João Silva',
    email: 'joao@email.com',
  };

  // TODO: Fetch candidate profile data
  const hasProfile = false; // Check if profile exists
  const profileComplete = false; // Check if all required fields filled

  return json({ user, hasProfile, profileComplete });
}

export default function CandidateProfile() {
  const { user, hasProfile, profileComplete } = useLoaderData<typeof loader>();
  const location = useLocation();
  const message = location.state?.message;

  // Layout is provided by parent route (candidate.tsx)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {message && (
        <Alert variant="success" className="mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{message}</p>
          </div>
        </Alert>
      )}

      {/* Profile Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Complete seu Perfil</CardTitle>
              <CardDescription>
                {hasProfile
                  ? 'Mantenha seu perfil atualizado para aumentar suas chances de ser encontrado por recrutadores.'
                  : 'Bem-vindo ao TalentBase! Complete seu perfil para começar a se candidatar a vagas.'}
              </CardDescription>
            </div>
            {hasProfile && (
              <div className="flex items-center gap-2">
                <Link to="/candidate/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Link to="/candidate/profile/preview">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasProfile ? (
            <div className="text-center py-8">
              <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Você ainda não criou seu perfil profissional</p>
              <Link to="/candidate/profile/create">
                <Button size="lg">Criar Meu Perfil</Button>
              </Link>
            </div>
          ) : (
            <div>
              {/* TODO: Display profile summary here */}
              <p className="text-gray-600 mb-4">
                Seu perfil está {profileComplete ? 'completo' : 'incompleto'}.
              </p>
              {!profileComplete && (
                <Alert variant="warning">
                  <p className="text-sm">
                    Complete todas as seções do seu perfil para aumentar sua visibilidade.
                  </p>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Sections Info */}
      <Card>
        <CardHeader>
          <CardTitle>O que incluir no seu perfil</CardTitle>
          <CardDescription>
            Adicione estas informações para criar um perfil completo e atrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold mb-2">Informações Básicas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Nome completo e foto</li>
                <li>• Telefone e localização</li>
                <li>• CPF e LinkedIn</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold mb-2">Experiência Profissional</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Posição atual</li>
                <li>• Anos de experiência</li>
                <li>• Tipo de vendas (Inbound/Outbound)</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold mb-2">Habilidades Técnicas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ferramentas e softwares</li>
                <li>• Soluções que já vendeu</li>
                <li>• Departamentos atendidos</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h4 className="font-semibold mb-2">Apresentação</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vídeo pitch (obrigatório)</li>
                <li>• Bio profissional</li>
                <li>• Histórico de trabalho</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
