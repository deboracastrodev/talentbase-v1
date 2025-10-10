import { Card, Input, Label } from '@talentbase/design-system';
import { Search } from 'lucide-react';

/**
 * How It Works - Step 1: Fill Profile
 * Visual mockup showing profile form
 */
export function HowItWorksStep1() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-primary-600 font-semibold text-sm">Passo 1</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Como funciona a TalentBase?</h2>
            <h3 className="text-2xl font-semibold text-gray-600">1. Preencha seu perfil</h3>
            <p className="text-lg text-gray-600">
              Comece criando seu perfil completo. Compartilhe suas experiências, habilidades e
              aspirações profissionais. Quanto mais detalhado, melhor a IA pode trabalhar para você.
            </p>
          </div>

          {/* Right: Mockup (não interativo) */}
          <div className="animate-fade-in pointer-events-none relative">
            {/* Gradiente overlay para indicar que é mockup */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/60 rounded-lg z-10 pointer-events-none" />

            <Card
              variant="elevated"
              padding="lg"
              className="bg-gray-900 border-none shadow-xl relative"
            >
              <div className="space-y-6">
                <h4 className="text-white text-xl font-semibold mb-6">Complete seu perfil</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Nome</Label>
                    <Input
                      placeholder="João"
                      className="bg-gray-800 border-gray-800 text-white placeholder:text-gray-600 rounded-lg cursor-default"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Sobrenome</Label>
                    <Input
                      placeholder="Silva"
                      className="bg-gray-800 border-gray-800 text-white placeholder:text-gray-600 rounded-lg cursor-default"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="joao@exemplo.com"
                    className="bg-gray-800 border-gray-800 text-white placeholder:text-gray-600 rounded-lg cursor-default"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Data de nascimento</Label>
                  <Input
                    type="date"
                    className="bg-gray-800 border-gray-800 text-white placeholder:text-gray-600 rounded-lg cursor-default"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Endereço</Label>
                  <Input
                    placeholder="São Paulo, SP"
                    className="bg-gray-800 border-gray-800 text-white placeholder:text-gray-600 rounded-lg cursor-default"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-sm">Cargo desejado</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <Input
                      placeholder="Ex: Account Executive"
                      className="bg-gray-800 border-gray-800 text-white placeholder:text-gray-600 rounded-lg pl-10 cursor-default"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
