/**
 * Public Candidate Profile Page
 * Story 3.2: Shareable public candidate profile
 *
 * Route: /share/candidate/:token
 * No authentication required - fully public
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import {
  PublicProfileHero,
  Timeline,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Textarea,
  Alert,
  VideoPlayer,
} from '@talentbase/design-system';
import { useState } from 'react';

import { getApiBaseUrl, getAppBaseUrl } from '~/config/api';

// Types
interface PublicProfile {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  city?: string;
  current_position?: string;
  years_of_experience?: number;
  sales_type?: string;
  sales_cycle?: string;
  avg_ticket?: string;
  top_skills?: string[];
  tools_software?: string[];
  solutions_sold?: string[];
  departments_sold_to?: string[];
  bio?: string;
  pitch_video_url?: string;
  pitch_video_type?: 's3' | 'youtube';
  experiences?: Experience[];
  pcd?: boolean;
  languages?: Array<{ name: string; level: string }>;
  accepts_pj?: boolean;
  travel_availability?: string;
  relocation?: boolean;
  work_model?: 'remote' | 'hybrid' | 'onsite';
  position_interest?: string;
  experience_summary?: ExperienceSummary;
  created_at?: string;
}

interface Experience {
  id: number;
  company_name: string;
  company_logo_url?: string;
  position: string;
  start_date: string;
  end_date?: string;
}

interface ExperienceSummary {
  sdr?: {
    has_experience: boolean;
    details: string[];
  };
  sales?: {
    outbound_years?: number;
    inbound_years?: number;
    inside_sales_years?: number;
    field_sales_years?: number;
    arr_range?: string;
    sales_cycle?: string;
  };
  csm?: {
    retention_years?: number;
    expansion_years?: number;
  };
}

// Loader: Fetch public profile data
export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;

  if (!token) {
    throw new Response('Token not found', { status: 404 });
  }

  const apiBaseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/candidates/public/${token}`);

    if (!response.ok) {
      throw new Response('Profile not found or sharing is disabled', { status: 404 });
    }

    const profile: PublicProfile = await response.json();

    return json({ profile, token });
  } catch (error) {
    throw new Response('Profile not found or sharing is disabled', { status: 404 });
  }
}

// SEO Meta Tags
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: 'Perfil não encontrado | TalentBase' }];
  }

  const { profile } = data;
  const appBaseUrl = getAppBaseUrl();
  const shareUrl = `${appBaseUrl}/share/candidate/${data.token}`;

  const title = `${profile.full_name} - ${profile.current_position || 'Profissional de Vendas'} | TalentBase`;
  const description = profile.bio
    ? profile.bio.substring(0, 160)
    : `${profile.current_position || 'Profissional de Vendas'} com ${profile.years_of_experience || 0} anos de experiência. ${profile.top_skills?.slice(0, 3).join(', ') || ''}.`;

  return [
    { title },
    { name: 'description', content: description },

    // Open Graph (LinkedIn, Facebook)
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: profile.profile_photo_url || `${appBaseUrl}/og-default.png` },
    { property: 'og:url', content: shareUrl },
    { property: 'og:type', content: 'profile' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: profile.profile_photo_url || `${appBaseUrl}/og-default.png` },
  ];
};

export default function ShareCandidateProfile() {
  const { profile, token } = useLoaderData<typeof loader>();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleContactSubmit = async () => {
    setIsSubmitting(true);
    setContactError(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/candidates/public/${token}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      setContactSuccess(true);
      setFormData({ name: '', email: '', message: '' });

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsContactModalOpen(false);
        setContactSuccess(false);
      }, 2000);
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Erro ao enviar mensagem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PublicProfileHero
        name={profile.full_name}
        photo={profile.profile_photo_url}
        position={profile.current_position}
        city={profile.city}
        workModel={profile.work_model}
        positionInterest={profile.position_interest}
        isPCD={profile.pcd}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column - Info Cards */}
          <div className="md:col-span-3 space-y-6">
            {/* Informações Relevantes */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Relevantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profile.pcd && (
                    <div className="border-l-4 border-primary-500 pl-3">
                      <p className="text-sm text-gray-500">PCD</p>
                      <p className="font-semibold">Sim</p>
                    </div>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <div className="border-l-4 border-primary-500 pl-3">
                      <p className="text-sm text-gray-500">Idiomas</p>
                      {profile.languages.map((lang, idx) => (
                        <p key={idx} className="font-semibold">
                          {lang.name} ({lang.level})
                        </p>
                      ))}
                    </div>
                  )}
                  {profile.accepts_pj !== undefined && (
                    <div className="border-l-4 border-primary-500 pl-3">
                      <p className="text-sm text-gray-500">Aceita PJ</p>
                      <p className="font-semibold">{profile.accepts_pj ? 'Sim' : 'Não'}</p>
                    </div>
                  )}
                  {profile.travel_availability && (
                    <div className="border-l-4 border-primary-500 pl-3">
                      <p className="text-sm text-gray-500">Disponibilidade para Viagens</p>
                      <p className="font-semibold">{profile.travel_availability}</p>
                    </div>
                  )}
                  {profile.relocation !== undefined && (
                    <div className="border-l-4 border-primary-500 pl-3">
                      <p className="text-sm text-gray-500">Disponível para Mudança</p>
                      <p className="font-semibold">{profile.relocation ? 'Sim' : 'Não'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Experiências */}
            {profile.experience_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Experiências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SDR */}
                    <div>
                      <h4 className="font-semibold mb-2">SDR</h4>
                      {profile.experience_summary.sdr?.has_experience ? (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {profile.experience_summary.sdr.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Não há experiência prévia</p>
                      )}
                    </div>

                    {/* VENDAS */}
                    <div>
                      <h4 className="font-semibold mb-2">VENDAS</h4>
                      {profile.experience_summary.sales && (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {profile.experience_summary.sales.outbound_years && (
                            <li>
                              Outbound: {profile.experience_summary.sales.outbound_years} anos
                            </li>
                          )}
                          {profile.experience_summary.sales.inbound_years && (
                            <li>Inbound: {profile.experience_summary.sales.inbound_years} anos</li>
                          )}
                          {profile.experience_summary.sales.inside_sales_years && (
                            <li>
                              Inside Sales: {profile.experience_summary.sales.inside_sales_years}{' '}
                              anos
                            </li>
                          )}
                          {profile.experience_summary.sales.field_sales_years && (
                            <li>
                              Field Sales: {profile.experience_summary.sales.field_sales_years} anos
                            </li>
                          )}
                          {profile.experience_summary.sales.arr_range && (
                            <li>ARR: {profile.experience_summary.sales.arr_range}</li>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* CSM */}
                    <div>
                      <h4 className="font-semibold mb-2">CSM/VENDA DE BASE</h4>
                      {profile.experience_summary.csm && (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {profile.experience_summary.csm.retention_years && (
                            <li>Retenção: {profile.experience_summary.csm.retention_years} anos</li>
                          )}
                          {profile.experience_summary.csm.expansion_years && (
                            <li>Expansão: {profile.experience_summary.csm.expansion_years} anos</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pitch Video */}
            {profile.pitch_video_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Entrevista TalentBase - {profile.full_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-2xl mx-auto">
                    <VideoPlayer
                      url={profile.pitch_video_url}
                      type={profile.pitch_video_type || 's3'}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Linha do Tempo */}
            {profile.experiences && profile.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Linha do Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline
                    items={profile.experiences.map((exp) => ({
                      company: exp.company_name,
                      position: exp.position,
                      startDate: exp.start_date,
                      endDate: exp.end_date,
                      logo: exp.company_logo_url,
                    }))}
                  />
                </CardContent>
              </Card>
            )}

            {/* Experiência Técnica */}
            <Card>
              <CardHeader>
                <CardTitle>Experiência Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Softwares */}
                {profile.tools_software && profile.tools_software.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Softwares</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.tools_software.map((tool, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soluções que já vendeu */}
                {profile.solutions_sold && profile.solutions_sold.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Soluções que já vendeu</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {profile.solutions_sold.map((solution, idx) => (
                        <li key={idx}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Departamentos */}
                {profile.departments_sold_to && profile.departments_sold_to.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Departamentos</h4>
                    <p>{profile.departments_sold_to.join(' ; ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - CTA */}
          <div className="md:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={() => setIsContactModalOpen(true)} className="w-full" size="lg">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Entrar em Contato
                  </Button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Contato mediado pela TalentBase
                  </p>
                </CardContent>
              </Card>

              <div className="text-center">
                <Link to="/" className="text-sm text-primary-600 hover:underline">
                  ← Voltar para TalentBase
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Entrar em contato"
        size="md"
      >
        {contactSuccess ? (
          <Alert variant="success">
            <p>Mensagem enviada com sucesso! Entraremos em contato em breve.</p>
          </Alert>
        ) : (
          <>
            {contactError && (
              <Alert variant="error" className="mb-4">
                <p>{contactError}</p>
              </Alert>
            )}

            <div className="space-y-4">
              <Input
                label="Seu nome"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Seu e-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Textarea
                label="Mensagem"
                name="message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Descreva sua oportunidade ou dúvida..."
                required
              />
            </div>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setIsContactModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleContactSubmit}
                disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
