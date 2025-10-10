import type { MetaFunction } from '@remix-run/node';

import { CTASection } from '../components/landing/CTASection';
import { FAQSection } from '../components/landing/FAQSection';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { HowItWorksStep1 } from '../components/landing/HowItWorksStep1';
import { HowItWorksStep2 } from '../components/landing/HowItWorksStep2';
import { HowItWorksStep3 } from '../components/landing/HowItWorksStep3';
import { Navbar } from '../components/landing/Navbar';
import { Testimonials } from '../components/landing/Testimonials';
import { WhyTalentBase } from '../components/landing/WhyTalentBase';

export const meta: MetaFunction = () => {
  return [
    { title: 'TalentBase - Recrutamento Tech com IA | Seu Headhunter Pessoal' },
    {
      name: 'description',
      content:
        'Encontre vagas tech com apoio de IA. TalentBase conecta você diretamente aos decisores, sem Gupy ou filtros automáticos.',
    },
    { property: 'og:title', content: 'TalentBase - Seu Headhunter de IA' },
    {
      property: 'og:description',
      content: 'Recrutamento tech personalizado com inteligência artificial',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.talentbase.com' },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <WhyTalentBase />
      <HowItWorksStep1 />
      <HowItWorksStep2 />
      <HowItWorksStep3 />
      <Testimonials />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
}
