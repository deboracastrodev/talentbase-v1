/**
 * Candidate Dashboard
 * Story 3.2: Share link generation and management
 *
 * Route: /candidate/dashboard
 * Auth: Required (candidate role)
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
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
import { useState } from 'react';

import { getAppBaseUrl } from '~/config/api';
import { apiClient, ApiError } from '~/lib/apiClient';
import { formatDateTime } from '~/utils/formatting';

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
export async function loader({ request: _request }: LoaderFunctionArgs) {
  // TODO: Get token from session/cookie and fetch candidate profile via API
  // For now, return mock data
  try {
    const profile: CandidateProfile = {
      id: '1',
      full_name: 'João Silva',
      current_position: 'SDR/BDR',
      pitch_video_url: 'https://youtube.com/watch?v=test',
      public_sharing_enabled: false,
      public_token: 'mock-uuid',
      share_link_generated_at: undefined,
    };

    const user = {
      name: profile.full_name,
      email: 'joao@email.com', // TODO: Get from API
    };

    return json({ profile, user });
  } catch (error) {
    throw new Response('Failed to load profile', { status: 500 });
  }
}

export default function CandidateDashboard() {
  const { profile, user } = useLoaderData<typeof loader>();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharingEnabled, setSharingEnabled] = useState(profile.public_sharing_enabled);

  const appBaseUrl = getAppBaseUrl();

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await apiClient.post<{ share_url: string; public_sharing_enabled: boolean }>(
        `/api/v1/candidates/${profile.id}/generate-share-token`,
        {}
      );

      setShareLink(data.share_url);
      setSharingEnabled(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as any;
        setError(errorData?.error || 'Erro ao gerar link');
      } else {
        setError('Erro ao gerar link');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSharing = async () => {
    setIsToggling(true);
    setError(null);

    try {
      const data = await apiClient.patch<{ public_sharing_enabled: boolean }>(
        `/api/v1/candidates/${profile.id}/toggle-sharing`,
        { enabled: !sharingEnabled }
      );

      setSharingEnabled(data.public_sharing_enabled);
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Erro ao alterar compartilhamento');
      } else {
        setError('Erro ao alterar compartilhamento');
      }
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
  const currentShareLink =
    shareLink ||
    (profile.share_link_generated_at
      ? `${appBaseUrl}/share/candidate/${profile.public_token}`
      : null);

  // Layout is provided by parent route (candidate.tsx)
  return (
    <div className="max-w-4xl mx-auto">
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
                <label
                  htmlFor="share-link"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Link de compartilhamento
                </label>
                <div className="flex gap-2">
                  <input
                    id="share-link"
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
                <Button variant="outline" onClick={handleGenerateLink} disabled={isGenerating}>
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
                    Gerado em: {formatDateTime(profile.share_link_generated_at)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Você ainda não gerou um link de compartilhamento</p>
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
            <CardDescription>Adicione mais informações ao seu perfil</CardDescription>
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
            <CardDescription>Encontre oportunidades que combinam com você</CardDescription>
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
  );
}
