# TalentBase

> Plataforma de recrutamento e seleção com foco em vagas de vendas no setor de tecnologia.

## 📦 Estrutura do Projeto

```
talentbase-v1/
├── packages/
│   └── design-system/        # Design System com Storybook
├── docs/
│   ├── design-system/         # Documentação do DS
│   ├── planejamento/          # Planejamento do projeto
│   ├── layouts/               # Layouts e referências
│   ├── basedados/             # Modelos de dados
│   └── site/                  # Assets da landing page
└── bmad/                      # BMad framework
```

## 🎨 Design System

O Design System está em `packages/design-system/` e inclui:

### Componentes (11 total)
- **Button** - Botões com 6 variantes
- **Card** - Cards com sub-componentes
- **Input** - Inputs com validação
- **Badge** - Badges de status
- **Avatar** - Avatares circulares
- **CandidateCard** - Card profissional de candidato
- **SearchBar** - Busca com filtros
- **Select** - Dropdown
- **Textarea** - Área de texto
- **Checkbox** - Checkbox
- **Radio** - Radio button

### Rodar Localmente

```bash
cd packages/design-system
npm install
npm run dev
```

Acesse: http://localhost:6006

### Ver Online

🚀 **Storybook Deploy:** Em breve no GitHub Pages

## 🛠️ Stack Técnica

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS (customizado)
- **Components:** Design System próprio
- **Storybook:** Documentação interativa
- **Deploy:** GitHub Actions + GitHub Pages

## 📝 Planejamento

Veja [docs/planejamento/index.md](docs/planejamento/index.md) para detalhes completos.

## 🚀 Roadmap

- [x] Design System base
- [x] Componentes de formulário
- [x] Storybook configurado
- [x] GitHub Actions para deploy
- [ ] Aplicação principal (React)
- [ ] API REST (Backend)
- [ ] Deploy AWS
- [ ] Domínio salesdog.click

## 📄 Licença

MIT © TalentBase
