import type { MetaFunction } from '@remix-run/node';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export const meta: MetaFunction = () => {
  return [
    { title: 'TalentBase - Recrutamento Tech com IA | Seu Headhunter Pessoal' },
    { name: 'description', content: 'Encontre vagas tech com apoio de IA. TalentBase conecta você diretamente aos decisores, sem Gupy ou filtros automáticos.' },
    { property: 'og:title', content: 'TalentBase - Seu Headhunter de IA' },
    { property: 'og:description', content: 'Recrutamento tech personalizado com inteligência artificial' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.talentbase.com' },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}
