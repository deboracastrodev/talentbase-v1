import { Target, Zap, Shield, TrendingUp } from 'lucide-react';

/**
 * Why TalentBase section
 * Highlights key differentiators of the platform
 */
export function WhyTalentBase() {
  const benefits = [
    {
      icon: Target,
      title: 'Especialização Exclusiva em Vendas Tech',
      description:
        'Não somos mais uma plataforma genérica. Entendemos de SaaS, ARR, ciclos de venda B2B e métricas que realmente importam para vendedores tech.',
    },
    {
      icon: Zap,
      title: 'Matching Inteligente com IA',
      description:
        'Nossa IA analisa mais de 50 critérios para conectar você apenas com oportunidades que fazem sentido para seu perfil e objetivos de carreira.',
    },
    {
      icon: Shield,
      title: 'Qualidade, Não Quantidade',
      description:
        'Vagas curadas manualmente. Sem spam de vagas genéricas. Você recebe apenas oportunidades reais de empresas tech verificadas.',
    },
    {
      icon: TrendingUp,
      title: 'Success Fee - Pagamento por Resultado',
      description:
        'Você só paga quando conseguir o emprego. Cobramos uma taxa de sucesso apenas após sua contratação bem-sucedida. Sem riscos, sem custos antecipados.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Por que escolher TalentBase?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A primeira plataforma brasileira focada exclusivamente em conectar profissionais de
            vendas com empresas de tecnologia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg bg-white border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
