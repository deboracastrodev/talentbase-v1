# Arquitetura TalentBase

Documentação completa da arquitetura do sistema TalentBase - Plataforma de recrutamento especializada em profissionais de vendas.

---

## 📚 Documentos

### 1. [Overview](./overview.md)
Visão geral da arquitetura, stack tecnológica, estrutura do projeto monorepo e áreas da aplicação.

**Conteúdo:**
- Stack: Remix (frontend) + Django REST Framework (backend)
- Estrutura de pastas do monorepo
- 5 áreas: Public, Admin, Candidate, Company, Shareable
- Fluxos principais (cadastro, busca, matching)

---

### 2. [Database Schema](./database-schema.md)
Schema completo do banco de dados PostgreSQL com modelos Django.

**Entidades Principais:**
- **User** - Autenticação (admin, candidate, company)
- **Candidate** - Perfil profissional de vendas
  - Posições: SDR/BDR, AE/Closer, CSM
  - Experiência em vendas (Inbound, Outbound, Inside, Field)
  - Softwares de vendas (Salesforce, Hubspot, Pipedrive, etc)
  - Departamentos vendidos (RH, Financeiro, TI, Marketing)
  - Soluções vendidas (SaaS, Headhunter, Cybersecurity, etc)
- **Company** - Empresas contratantes
- **Job** - Vagas de vendas
- **Application** - Aplicações dos candidatos
- **Skill** - Habilidades e ferramentas de vendas
- **Experience** - Histórico profissional
- **Favorite** - Favoritos da empresa

**Campos Específicos de Vendas:**
- Ciclo de vendas (1-3 meses, 3-6 meses, >6 meses)
- Ticket médio (12-24K, 24-60K, 60-120K, >120K ARR)
- Tipo de vendas (Inbound/Outbound, Inside/Field)
- CSM: Expansão, Retenção, Tamanho de carteira
- SDR/BDR: Experiência Inbound/Outbound (tempo)

---

### 3. [API Endpoints](./api-endpoints.md)
Contratos completos da API REST com exemplos de request/response.

**Principais Endpoints:**
- `POST /auth/register/candidate` - Cadastro de candidato
- `POST /auth/register/company` - Cadastro de empresa
- `GET /candidates` - Buscar candidatos (filtros: posição, experiência, softwares, ticket médio)
- `GET /candidates/:id` - Perfil completo do candidato
- `GET /share/candidate/:token` - Perfil público compartilhável
- `GET /jobs` - Listar vagas
- `POST /jobs` - Criar vaga
- `POST /jobs/:id/apply` - Aplicar para vaga
- `POST /favorites` - Favoritar candidato
- `GET /rankings` - Rankings de candidatos

---

### 4. [Authentication](./authentication.md)
Sistema de autenticação e autorização (Token-based auth).

**Estratégia:**
- Django REST Framework Token Authentication
- 3 roles: admin, candidate, company
- Permissões por endpoint
- Cookie-based storage (frontend)
- Aprovação manual de empresas

**Fluxos:**
- Registro de candidato → Perfil incompleto → Completar dados
- Registro de empresa → Aprovação admin → Acesso liberado
- Login → Validação → Token → Dashboard específico

---

### 5. [Deployment](./deployment.md)
Estratégia de deploy na AWS com GitHub Actions CI/CD.

**Infraestrutura:**
- **DNS:** salesdog.click (Route 53)
- **Frontend:** www.salesdog.click (Remix)
- **Backend:** api.salesdog.click (Django)
- **Storybook:** storybook.salesdog.click (GitHub Pages)

**AWS Resources:**
- EC2/ECS para apps
- RDS PostgreSQL 15
- ElastiCache Redis
- S3 para uploads (avatars, logos)
- ALB + ACM (SSL)

**CI/CD:** GitHub Actions para deploy automático

---

## 🎯 Contexto do Negócio

### Modelo de Negócio
TalentBase é um **headhunter de recolocação pessoal** especializado em profissionais de vendas para empresas de tecnologia.

### Dados Reais (docs/basedados/)
O sistema foi planejado baseado em dados reais de:
- **Candidatos:** Profissionais de vendas (SDR, BDR, AE, CSM) com experiência em SaaS, Cybersecurity, RH Tech, etc.
- **Vagas:** Posições como Account Executive, CSM, SDR com modelos híbridos, CLT, comissionamento
- **Empresas:** Empresas de tecnologia contratando para área comercial

### Posições Principais
1. **SDR/BDR** (Sales/Business Development Representative)
   - Prospecção ativa (Outbound)
   - Qualificação de leads (Inbound)
   - Ferramentas: Apollo.io, Lusha, LinkedIn Sales Navigator

2. **Account Executive / Closer**
   - Condução de vendas
   - Apresentações de solução
   - Negociação e fechamento
   - Ferramentas: Salesforce, Hubspot, Pipedrive

3. **CSM** (Customer Success Manager)
   - Retenção de clientes
   - Expansão de contas (upsell/cross-sell)
   - Gestão de carteira

### Campos-Chave do Sistema
- **Experiência por Tipo:**
  - Vendas Inbound/Outbound
  - Inside Sales / Field Sales
  - Ciclo de vendas (curto, médio, longo)

- **Softwares/Ferramentas:**
  - CRMs: Salesforce, Hubspot, Pipedrive, Zoho
  - Outbound: Apollo.io, Lusha, Outreach
  - Marketing: RD Station, Ramper

- **Soluções Vendidas:**
  - SaaS (ATS, ERP, CRM, HR Tech)
  - Cybersecurity
  - Headhunter/Recruiting
  - Background check
  - People Analytics

- **Ticket Médio / ARR:**
  - 12-24K
  - 24-60K
  - 60-120K
  - >120K

---

## 🚀 MVP - Funcionalidades Essenciais

### Prioridade Crítica
1. ✅ Design System completo
2. Landing Page
3. Cadastro de candidatos (migrar do Notion)
4. Cadastro de vagas
5. Busca/filtro de candidatos (empresa)
6. Perfil compartilhável do candidato
7. Link compartilhável de vaga
8. Status de candidatos (disponível, inativo, sem contrato)
9. Rankings de candidatos (melhores por área)
10. Dashboard Admin/Candidato/Empresa

### Migração do Notion
Atualmente os dados estão no Notion. MVP deve permitir:
- Importar candidatos do CSV
- Cadastro via sistema (substituir Notion)
- Manter perfis compartilháveis (como usam hoje)

---

## 📊 Principais Métricas

### Candidatos
- Ranking score (0-100)
- Categoria (Frontend, Backend, CSM, SDR)
- Status (disponível, inativo, sem contrato)
- Verificado (sim/não)
- Experiência em vendas (anos, tipo)

### Matching (Futuro Automático)
Critérios para match candidato x vaga:
1. Posição compatível (SDR, AE, CSM)
2. Experiência com tipo de venda (inbound/outbound)
3. Conhecimento de softwares/CRMs
4. Experiência vendendo soluções similares
5. Ticket médio compatível
6. Ciclo de vendas similar
7. Ranking do candidato

---

## 📝 Próximos Passos

### Fase 1: Setup (Atual)
- [x] Design System
- [x] Arquitetura documentada
- [ ] Setup Django backend
- [ ] Setup Remix frontend
- [ ] Landing page

### Fase 2: Backend MVP
- [ ] Models Django
- [ ] API Auth
- [ ] API Candidates CRUD
- [ ] API Jobs CRUD
- [ ] Importação CSV (Notion → Sistema)

### Fase 3: Frontend MVP
- [ ] Landing page
- [ ] Auth (login, register)
- [ ] Dashboard Admin
- [ ] Dashboard Empresa
- [ ] Dashboard Candidato
- [ ] Busca de candidatos
- [ ] Perfis compartilháveis

### Fase 4: Deploy
- [ ] Setup AWS infrastructure
- [ ] GitHub Actions CI/CD
- [ ] DNS configuration
- [ ] SSL certificates
- [ ] Deploy production

### Fase 5: Otimizações
- [ ] Rankings automáticos
- [ ] Matching algorithm
- [ ] Email notifications
- [ ] Analytics dashboard

---

## ⚠️ Avisos Importantes

### Evitar Over-Engineering
- MVP deve ser simples e funcional
- Matching manual no início (admin faz o match)
- Automação vem depois
- Foco em substituir Notion primeiro

### Dados Reais
- Os dados em `docs/basedados/` são reais
- Cuidado com exposição de dados sensíveis
- Implementar LGPD compliance
- Campos de CPF devem ser criptografados

### Nomenclatura
- Sempre usar inglês no código
- PT-BR apenas para UI/UX
- Comentários em inglês
