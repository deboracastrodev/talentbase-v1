import { Link } from '@remix-run/react';
import { Button } from '@talentbase/design-system';
import logoSymbol from '~/assets/logo-symbol.svg';

/**
 * CTA Section component
 * Final call-to-action to convert visitors
 */
export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-black via-blue-900 to-blue-600">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <img src={logoSymbol} alt="TalentBase" className="w-16 h-16" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Enquanto você pensa, outros estão sendo apresentados direto para os decisores.
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Preencha seu perfil agora e pare de implorar atenção pelo LinkedIn.
          </p>
          <Link to="/auth/register?type=candidate">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-6 h-auto text-lg shadow-xl transition-all duration-300 hover:scale-105"
            >
              Quero meu headhunter pessoal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
