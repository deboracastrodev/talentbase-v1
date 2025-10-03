import { Card, Badge, Avatar } from '@talentbase/design-system';
import { Briefcase, MapPin } from 'lucide-react';

/**
 * How It Works - Step 2: AI Matching
 * Visual representation of AI matching candidates with jobs
 */
export function HowItWorksStep2() {
  const jobs = [
    {
      company: 'SaaS Corp',
      title: 'Account Executive Pleno',
      type: 'Remoto',
      color: 'bg-blue-500',
    },
    {
      company: 'TechStart',
      title: 'SDR/BDR Sênior',
      type: 'Híbrido',
      color: 'bg-purple-500',
    },
    {
      company: 'CloudInc',
      title: 'Customer Success Manager',
      type: 'Remoto',
      color: 'bg-green-500',
    },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Visual with profile and job cards */}
          <div className="relative animate-fade-in min-h-[400px]">
            {/* Center Profile Card */}
            <Card
              variant="elevated"
              padding="md"
              className="relative z-10 bg-white shadow-xl max-w-sm mx-auto"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Avatar size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <span className="text-white font-bold text-xl">MS</span>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">Mateus Souza</h4>
                  <p className="text-sm text-gray-600">Account Executive</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Prospecção B2B</Badge>
                <Badge variant="secondary">SaaS</Badge>
                <Badge variant="secondary">Negociação</Badge>
                <Badge variant="secondary">Salesforce</Badge>
              </div>
            </Card>

            {/* Animated SVG Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Curved lines connecting profile to jobs */}
              <path
                d="M 250 100 Q 400 100, 500 50"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                className="animate-pulse"
              />
              <path
                d="M 250 150 Q 400 150, 500 130"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
              <path
                d="M 250 200 Q 400 200, 500 210"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '1s' }}
              />
            </svg>

            {/* Job Cards on the right */}
            <div className="absolute right-0 top-0 space-y-3 w-48" style={{ zIndex: 1 }}>
              {jobs.map((job, index) => (
                <Card
                  key={index}
                  variant="default"
                  padding="sm"
                  className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`w-8 h-8 ${job.color} rounded flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{job.title}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Text */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-primary-600 font-semibold text-sm">Passo 2</span>
            </div>
            <h3 className="text-2xl font-semibold">2. IA faz o matching perfeito</h3>
            <p className="text-lg text-gray-600">
              Nossa inteligência artificial analisa seu perfil e conecta você com as
              oportunidades mais relevantes. Algoritmos avançados garantem matches precisos
              baseados em suas habilidades, experiências e objetivos de carreira.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Matching inteligente</h4>
                  <p className="text-sm text-gray-600">
                    IA avalia compatibilidade técnica e cultural
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Vagas remotas e híbridas</h4>
                  <p className="text-sm text-gray-600">
                    Flexibilidade para trabalhar de onde você quiser
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
