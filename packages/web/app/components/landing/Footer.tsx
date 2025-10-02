import logoFull from '~/assets/logo-full.svg';

/**
 * Footer component for landing page
 * Displays logo and copyright information
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 py-8 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-white gap-4">
          <div className="flex items-center gap-3">
            <img src={logoFull} alt="TalentBase" className="h-8" />
          </div>
          <div className="text-sm text-center md:text-right text-gray-400">
            © 2025 TalentBase. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
