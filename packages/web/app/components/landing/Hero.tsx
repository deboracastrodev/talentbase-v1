import { Link } from '@remix-run/react';
import { Button } from '@talentbase/design-system';
import { ArrowRight } from 'lucide-react';

import { ROUTES } from '~/config/routes';

/**
 * Hero section component for landing page
 * Premium design with gradient background, social proof, and animations
 */
export function Hero() {
  const companies = [
    { name: 'Totus' },
    { name: 'Mindsight' },
    { name: 'Ploomes' },
    { name: 'Sankhya' },
    { name: 'Caju' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-blue-900 to-cyan-500 pt-16">
      {/* Blur Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up leading-tight">
            O parceiro de IA para sua <span className="text-cyan-400">próxima oportunidade</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            Encontre oportunidades de carreira com o apoio de um parceiro de IA que entende seu
            perfil e conecta você às vagas certas em menos tempo.
          </p>

          {/* CTA Button */}
          <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <Link to={`${ROUTES.auth.candidateRegister}?type=candidate`}>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 h-auto shadow-xl transition-all duration-300 hover:scale-105"
              >
                Quero meu headhunter pessoal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Vendedores Tech
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">10+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Empresas Parceiras
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">0%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Custo Antecipado
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">
              Empresas que contratam via TalentBase
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {companies.map((company, index) => (
                <div
                  key={company.name}
                  className="text-gray-500 text-xl font-semibold opacity-60 hover:opacity-100 transition-opacity"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  {company.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
