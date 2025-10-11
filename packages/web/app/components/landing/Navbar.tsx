import { Link } from '@remix-run/react';
import { Button } from '@talentbase/design-system';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import logoFull from '~/assets/logo-full.svg';
import { ROUTES } from '~/config/routes';

/**
 * Navbar component for landing page
 * Fixed navigation with responsive mobile menu
 */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={logoFull} alt="TalentBase" className="h-8" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-400 hover:text-primary-500 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link to={ROUTES.auth.register}>
              <Button variant="outline" size="default">
                Começar agora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-primary-500 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-400 hover:text-primary-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link to={ROUTES.auth.register} onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="default" className="w-full">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
