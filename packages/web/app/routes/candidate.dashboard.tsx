/**
 * Candidate Dashboard
 * Story 3.2: Share link generation and management
 *
 * Route: /candidate/dashboard
 * Auth: Required (candidate role)
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Alert,
} from '@talentbase/design-system';
import { Share2, Copy, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react';
import { getApiBaseUrl, getAppBaseUrl } from '~/config/api';

// Types
interface CandidateProfile {
  id: string;
  full_name: string;
  current_position?: string;
  pitch_video_url?: string;
  public_sharing_enabled: boolean;
  public_token: string;
  share_link_generated_at?: string;
}

// Loader: Fetch candidate profile data
export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Get token from session/cookie
  const candidateToken = 'mock-candidate-token';

  try {
    // TODO: Fetch candidate profile via API
    // For now, return mock data
    const profile: CandidateProfile = {
      id: '1',
      full_name: 'João Silva',
      current_position: 'SDR/BDR',
      pitch_video_url: 'https://youtube.com/watch?v=test',
      public_sharing_enabled: false,
      public_token: 'mock-uuid',
      share_link_generated_at: undefined,
    };

    return json({ profile });
  } catch (error) {
    throw new Response('Failed to load profile', { status: 500 });
  }
}

export default function CandidateDashboard() {
  const { profile } = useLoaderData<typeof loader>();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharingEnabled, setSharingEnabled] = useState(profile.public_sharing_enabled);

  const appBaseUrl = getAppBaseUrl();
  const apiBaseUrl = getApiBaseUrl();

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/candidates/${profile.id}/generate-share-token`, {
        method: 'POST',
        headers: {
          // TODO: Add actual auth token
          'Authorization': 'Token mock-token',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar link');
      }

      const data = await response.json();
      setShareLink(data.share_url);
      setSharingEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSharing = async () => {
    setIsToggling(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/candidates/${profile.id}/toggle-sharing`, {
        method: 'PATCH',
        headers: {
          // TODO: Add actual auth token
          'Authorization': 'Token mock-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !sharingEnabled }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar compartilhamento');
      }

      const data = await response.json();
      setSharingEnabled(data.public_sharing_enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar compartilhamento');
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Erro ao copiar link');
    }
  };

  // Build share link from token if already generated
  const currentShareLink = shareLink || (profile.share_link_generated_at
    ? `${appBaseUrl}/share/candidate/${profile.public_token}`
    : null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo, {profile.full_name}!
          </p>
        </div>

        {/* Share Link Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Compartilhar Perfil Público
                </CardTitle>
                <CardDescription>
                  Gere um link público para compartilhar seu perfil com recrutadores
                </CardDescription>
              </div>

              {/* Toggle Sharing */}
              {currentShareLink && (
                <Button
                  variant={sharingEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleSharing}
                  disabled={isToggling}
                  className="flex items-center gap-2"
                >
                  {sharingEnabled ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Desativado
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="error" className="mb-4">
                <p>{error}</p>
              </Alert>
            )}

            {!profile.pitch_video_url && (
              <Alert variant="warning" className="mb-4">
                <p>
                  Complete seu perfil com vídeo pitch antes de gerar o link público.{' '}
                  <Link to="/candidate/profile/create" className="underline font-medium">
                    Completar perfil →
                  </Link>
                </p>
              </Alert>
            )}

            {currentShareLink ? (
              <div className="space-y-4">
                {/* Share Link Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de compartilhamento
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentShareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex items-center gap-2"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleGenerateLink}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Gerando...' : 'Gerar Novo Link'}
                  </Button>

                  {sharingEnabled && (
                    <Link
                      to={`/share/candidate/${profile.public_token}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visualizar Perfil Público
                    </Link>
                  )}
                </div>

                {/* Status Info */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Status:{' '}
                    <span className={sharingEnabled ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {sharingEnabled ? 'Compartilhamento ativo' : 'Compartilhamento desativado'}
                    </span>
                  </p>
                  {profile.share_link_generated_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Gerado em: {new Date(profile.share_link_generated_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Você ainda não gerou um link de compartilhamento
                </p>
                <Button
                  onClick={handleGenerateLink}
                  disabled={isGenerating || !profile.pitch_video_url}
                  size="lg"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Completar Perfil</CardTitle>
              <CardDescription>
                Adicione mais informações ao seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/candidate/profile/create">
                <Button variant="outline" className="w-full">
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buscar Vagas</CardTitle>
              <CardDescription>
                Encontre oportunidades que combinam com você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/jobs">
                <Button variant="outline" className="w-full">
                  Ver Vagas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
