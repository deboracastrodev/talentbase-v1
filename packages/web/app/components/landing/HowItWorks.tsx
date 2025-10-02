export function HowItWorks() {
  return (
    <>
      {/* Section 1: Preencha seu perfil */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como funciona a TalentBase?</h2>
            <p className="text-xl text-gray-600">TalentBase é o seu headhunter de recolocação pessoal.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">1. Preencha seu perfil</h3>
              <p className="text-gray-600 text-lg">
                Conte suas preferências: tipo de vaga, empresa dos sonhos, salário desejado.
              </p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <h4 className="text-lg font-semibold mb-6">Preencha seu perfil</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Nome</label>
                    <div className="bg-gray-800 rounded-lg p-3 h-10"></div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Sobrenome</label>
                    <div className="bg-gray-800 rounded-lg p-3 h-10"></div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">E-mail</label>
                  <div className="bg-gray-800 rounded-lg p-3 h-10"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Cargo desejado</label>
                  <div className="bg-gray-800 rounded-lg p-3 h-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: IA procura a vaga */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">2. IA procura a vaga para você</h3>
              <p className="text-gray-600 text-lg">
                Nossa inteligência artificial encontra empresas contratando e cruza com o seu perfil.
              </p>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
                  <div>
                    <div className="font-semibold">Mateus Souza</div>
                    <div className="text-sm text-gray-600">Executivo de Contas Pleno</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-600">
                    <div className="font-medium text-sm">Executivo de contas Pleno</div>
                    <div className="text-xs text-gray-600">Presencial • R$ 5.500</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-600">
                    <div className="font-medium text-sm">Executivo de contas Pleno</div>
                    <div className="text-xs text-gray-600">Remoto • R$ 7.000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Apresentamos você */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gray-900 rounded-2xl p-8 text-white">
                <h4 className="text-lg font-semibold mb-4">Mateus Souza</h4>
                <div className="flex gap-2 mb-6 flex-wrap">
                  <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">Experiência em Vendas</span>
                  <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">Enterprise B2B</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-3">Entrevistas gravadas</div>
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div className="text-sm">Técnicas vendas B2B</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold mb-4">3. Apresentamos você</h3>
              <p className="text-gray-600 text-lg">
                Seu perfil vai direto para quem decide. Nada de Gupy ou filtros automáticos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
