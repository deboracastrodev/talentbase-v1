import { Button } from '@talentbase/design-system';

const ArrowRight = () => (
  <svg
    className="inline-block ml-2 h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export function Hero() {
  const companies = [
    { name: "Totus" },
    { name: "Mindsight" },
    { name: "Ploomes" },
    { name: "Sankhya" },
    { name: "Caju" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-blue-900 to-cyan-500">
      {/* Blur Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            O parceiro de IA para sua próxima{" "}
            <span className="text-cyan-400">oportunidade</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Encontre oportunidades de carreira com o apoio de um parceiro de IA que entende seu perfil e conecta você às vagas certas em menos tempo.
          </p>

          {/* CTA Button */}
          <div>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
            >
              Quero meu headhunter pessoal
              <ArrowRight />
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16">
            <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">
              Empresas que contratam via TalentBase
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {companies.map((company) => (
                <div
                  key={company.name}
                  className="text-gray-500 text-xl font-semibold opacity-60 hover:opacity-100 transition-opacity"
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
