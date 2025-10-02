import { Button } from '@talentbase/design-system';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-black via-blue-900 to-blue-600">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">TB</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Enquanto você pensa, outros estão sendo apresentados direto para os decisores.
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Preencha seu perfil agora e pare de implorar atenção pelo LinkedIn.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
            Quero meu headhunter pessoal
          </Button>
        </div>
      </div>
    </section>
  );
}
