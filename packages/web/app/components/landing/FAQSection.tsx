import { Accordion } from './Accordion';

/**
 * FAQ Section component
 * Displays frequently asked questions with accordion
 */
export function FAQSection() {
  const faqs = [
    {
      question: 'Como funciona a TalentBase?',
      answer:
        'A TalentBase utiliza inteligência artificial avançada para analisar seu perfil e conectá-lo às oportunidades mais relevantes. Você cria seu perfil completo, nossa IA faz o matching com vagas compatíveis e apresenta você diretamente para as empresas interessadas.',
    },
    {
      question: 'Como funciona o pagamento?',
      answer:
        'Trabalhamos com modelo de Success Fee (taxa de sucesso). Você só paga quando conseguir o emprego! Cobramos uma pequena taxa apenas após sua contratação efetiva. Sem custos antecipados, sem riscos - nosso sucesso está diretamente ligado ao seu.',
    },
    {
      question: 'Quanto custa para o candidato?',
      answer:
        'Cobramos uma taxa de success fee do candidato apenas quando você for contratado. O valor é um percentual do seu primeiro salário. Durante todo o processo de busca, match e entrevistas, não há nenhum custo. Você só paga se conseguir o emprego.',
    },
    {
      question: 'Qual a diferença entre TalentBase e outras plataformas?',
      answer:
        'Somos especializados exclusivamente em vendas tech. Não somos uma plataforma genérica - entendemos de SaaS, ARR, ciclos de venda B2B e métricas que realmente importam para vendedores. Nossas vagas são curadas manualmente, sem spam.',
    },
    {
      question: 'Que tipo de vagas vocês oferecem?',
      answer:
        'Focamos em posições de vendas tech: SDR/BDR, Account Executive, Customer Success Manager e liderança comercial. Trabalhamos com empresas SaaS, HRTech, Cibersegurança e outras tecnologias B2B. Modalidades remotas, híbridas e presenciais, CLT e PJ.',
    },
    {
      question: 'Quanto tempo leva para receber propostas?',
      answer:
        'O tempo varia de acordo com seu perfil e a demanda do mercado. Em média, candidatos com perfil completo começam a receber os primeiros matches em até 48-72 horas.',
    },
    {
      question: 'Como a IA garante matches relevantes?',
      answer:
        'Nossa IA analisa mais de 50 critérios específicos de vendas: tipo de vaga (SDR, AE, CSM), ciclo de venda, ticket médio, ferramentas (Salesforce, Hubspot), segmento (SaaS, HRTech), experiências anteriores e objetivos de carreira. Isso garante que você receba apenas oportunidades verdadeiramente alinhadas.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Left: Title */}
          <div className="md:col-span-4">
            <h2 className="text-4xl md:text-5xl font-bold sticky top-24">
              Perguntas Frequentes
            </h2>
          </div>

          {/* Right: Accordion */}
          <div className="md:col-span-8">
            <Accordion items={faqs} defaultOpenIndex={0} />
          </div>
        </div>
      </div>
    </section>
  );
}
