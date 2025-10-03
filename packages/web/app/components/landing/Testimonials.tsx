import { Card, Avatar } from '@talentbase/design-system';
import { Star } from 'lucide-react';

/**
 * Testimonials section
 * Displays user testimonials with ratings
 */
export function Testimonials() {
  const testimonials = [
    {
      name: 'Ana Paula Silva',
      role: 'Account Executive na SaaS Unicórnio',
      initials: 'AP',
      text: 'A TalentBase mudou completamente minha forma de buscar oportunidades em vendas. Em menos de 2 semanas, recebi 5 propostas de empresas incríveis. O matching da IA é impressionante!',
    },
    {
      name: 'Roberto Mendes',
      role: 'Customer Success Manager na TechStart',
      initials: 'RM',
      text: 'Finalmente uma plataforma que entende o que realmente procuro em vendas tech. As vagas que chegaram eram exatamente o que eu queria. Consegui meu emprego dos sonhos!',
    },
  ];

  return (
    <section id="depoimentos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            O que dizem nossos talentos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Histórias reais de profissionais que encontraram suas oportunidades ideais
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="shadow-lg hover:shadow-xl transition-shadow border-2 hover:border-primary-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary-500 text-primary-500" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <Avatar size="lg" className="bg-gradient-to-r from-primary-500 to-cyan-500">
                  <span className="text-white font-semibold text-lg">
                    {testimonial.initials}
                  </span>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
