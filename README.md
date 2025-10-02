# TalentBase

> Plataforma de recrutamento e seleção com foco em vagas de vendas no setor de tecnologia.

## 🔧 Pré-requisitos

Antes de iniciar o desenvolvimento, certifique-se de ter todas as ferramentas necessárias instaladas. Use o script de verificação automática:

```bash
./scripts/check-prerequisites.sh
```

### Ferramentas Requeridas

**Frontend / Build:**
- **Node.js 20+** ([Download](https://nodejs.org/))
- **pnpm 8.14+** ([Instalação](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```

**Backend / Python:**
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Poetry 1.7+** ([Instalação](https://python-poetry.org/docs/#installation))
  ```bash
  curl -sSL https://install.python-poetry.org | python3 -
  ```

**Containers:**
- **Docker 24+** ([Docker Desktop](https://www.docker.com/products/docker-desktop/))
- **Docker Compose** (incluído no Docker Desktop)

**Cloud / Deploy:**
- **AWS CLI v2** ([Instalação](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **AWS Credentials configuradas**
  ```bash
  aws configure
  # Você precisará de: Access Key ID, Secret Access Key, Region (us-east-1)
  ```

### Verificação Rápida

Execute o script de verificação para validar seu ambiente:

```bash
./scripts/check-prerequisites.sh
```

**Output esperado:**
```
✅ Node.js v20.x.x
✅ pnpm 8.x.x
✅ Python 3.11.x
✅ Poetry 1.7.x
✅ Docker 24.x.x
✅ Docker Compose 2.x.x
✅ AWS CLI 2.x.x
✅ AWS CLI configurado
✅ Domínio salesdog.click configurado no Route 53

✅ Todos os pré-requisitos essenciais atendidos! Pronto para Story 1.1
```

### Troubleshooting

**Node.js ou pnpm não encontrado:**
- Baixe Node.js LTS de https://nodejs.org/
- Instale pnpm globalmente: `npm install -g pnpm`

**Python ou Poetry não encontrado:**
- Baixe Python de https://www.python.org/downloads/
- Instale Poetry: `curl -sSL https://install.python-poetry.org | python3 -`

**Docker não encontrado:**
- Instale Docker Desktop: https://www.docker.com/products/docker-desktop/
- No Mac/Windows, Docker Compose já vem incluído

**AWS CLI não configurado:**
- Instale AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Configure credenciais: `aws configure`
- Entre em contato com admin do projeto para obter Access Keys

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
