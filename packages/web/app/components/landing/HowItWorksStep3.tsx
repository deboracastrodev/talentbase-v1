import { Card, Badge } from '@talentbase/design-system';
import { Play } from 'lucide-react';

/**
 * How It Works - Step 3: Presentation
 * Shows video interview mockup
 */
export function HowItWorksStep3() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6 order-2 md:order-1">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-primary-600 font-semibold text-sm">Passo 3</span>
            </div>
            <h3 className="text-2xl font-semibold">3. Apresentamos você</h3>
            <p className="text-lg text-gray-600">
              Sua apresentação vai além do currículo. Com vídeo-entrevistas e perfis detalhados, as
              empresas conhecem o profissional real por trás dos números e metas batidas.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-600" />
                <p className="text-gray-600">Perfil completo com resultados e conquistas</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-600" />
                <p className="text-gray-600">Vídeo-apresentações personalizadas</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-600" />
                <p className="text-gray-600">Destaque suas soft skills</p>
              </div>
            </div>
          </div>

          {/* Right: Dark Interface Mockup */}
          <div className="order-1 md:order-2 animate-fade-in">
            <Card variant="elevated" padding="lg" className="bg-gray-900 border-none shadow-xl">
              {/* Profile Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <div>
                    <h4 className="text-white text-xl font-semibold">Mateus Souza</h4>
                    <p className="text-gray-400">Account Executive</p>
                  </div>
                </div>

                {/* Experience Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-gray-800 text-white hover:bg-gray-800">3+ anos vendas</Badge>
                  <Badge className="bg-gray-800 text-white hover:bg-gray-800">Top Performer</Badge>
                  <Badge className="bg-gray-800 text-white hover:bg-gray-800">150% quota</Badge>
                  <Badge className="bg-gray-800 text-white hover:bg-gray-800">
                    Certificado SaaS
                  </Badge>
                </div>
              </div>

              {/* Video Interviews Section */}
              <div className="space-y-3">
                <h5 className="text-white font-semibold mb-3">Vídeo Entrevistas</h5>

                {/* Video Thumbnail 1 */}
                <div className="relative rounded-lg overflow-hidden bg-gray-800 h-32 group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                      <Play className="h-6 w-6 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium">Por que vendas?</p>
                  </div>
                </div>

                {/* Video Thumbnail 2 */}
                <div className="relative rounded-lg overflow-hidden bg-gray-800 h-32 group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                      <Play className="h-6 w-6 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium">Maior venda fechada</p>
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
