# Landing Page TalentBase - Especificação UX

**Data:** 2025-10-02
**Designer:** Sally (UX Expert Agent)
**Story:** 1.4 - Build Public Landing Page

---

## 📋 Overview

Landing page profissional para TalentBase - plataforma de recrutamento tech com IA. Design moderno, gradientes vibrantes, foco em conversão.

---

## 🎨 Design System

### Cores
- **Primary:** `#0066FF` / `#2563EB` (azul vibrante)
- **Gradientes:**
  - Hero: `from-black via-blue-900 to-cyan-500`
  - CTA: `from-black via-blue-800 to-blue-600`
- **Backgrounds:** Branco / Preto alternados
- **Texto:**
  - Primário: `text-black` / `text-white`
  - Secundário: `text-gray-600` / `text-gray-400`

### Tipografia
- **Font:** Inter (já no design system)
- **Hierarquia:**
  - H1 Hero: `text-5xl md:text-6xl font-bold`
  - H2 Sections: `text-3xl md:text-4xl font-bold`
  - Body: `text-base md:text-lg`
  - Captions: `text-sm text-gray-500`

### Espaçamento
- Container: `max-w-7xl mx-auto px-6`
- Sections: `py-20 md:py-28`
- Grid gaps: `gap-8 md:gap-12`

---

## 🏗️ Estrutura (9 Seções)

### SEÇÃO 1: Hero
**Layout:** Full viewport, gradiente diagonal
**Elementos:**
- Navbar fixo transparente → solid on scroll
- Logo TalentBase (esquerda)
- Menu items (desktop only)
- CTA button outline cyan
- Hero content centralizado:
  - H1 com palavra destacada em azul
  - Subtitle gray
  - CTA button grande branco
  - Social proof: 5 logos empresas em grayscale

**Componentes:**
- `Button` (variant="outline", variant="primary")
- Custom gradient background

### SEÇÃO 2: Como Funciona - Passo 1
**Layout:** 2 colunas (texto + mockup)
**Elementos:**
- Título + subtítulo
- Numeração "1. Preencha seu perfil"
- Mockup dark card com formulário
  - FormFields: Nome, Sobrenome, Email, Data, Endereço, Cargo
  - Dark theme: bg-gray-900, inputs bg-gray-800

**Componentes:**
- `Card` (dark variant - criar)
- `Input` + `FormField`
- `SearchBar` (para cargo)

### SEÇÃO 3: IA Matching - Passo 2
**Layout:** 2 colunas
**Elementos:**
- "2. IA procura a vaga para você"
- Card perfil candidato (centro)
- 4 cards vagas (direita) com badges
- Linhas curvas conectando (SVG animado)

**Componentes:**
- `Card` (profile variant)
- `Badge` (para tags: Remoto, CLT, etc)
- `Avatar`
- Custom SVG connections

### SEÇÃO 4: Apresentação - Passo 3
**Layout:** 2 colunas invertidas
**Elementos:**
- "3. Apresentamos você"
- Interface dark TalentBase
- Badges experiência (azul)
- VideoPlayer para entrevistas gravadas

**Componentes:**
- `Card` (dark)
- `Badge` (variant="primary")
- `VideoPlayer` ✅ (já existe!)
- Tabs/Sections

### SEÇÃO 5: Tour Guiado
**Layout:** Full-width, fundo azul vibrante
**Elementos:**
- Badge "TOUR GUIADA"
- Título + subtítulo
- Foto profissional + laptop
- Card branco: "Um tour pela plataforma" + play icon
- Organic shapes background (blob shapes)

**Componentes:**
- `Badge`
- `Card` (light, elevated shadow)
- `VideoPlayer` trigger

### SEÇÃO 6: Depoimentos
**Layout:** Grid 2 colunas
**Elementos:**
- Cards testimonial
- Avatar circular + Nome + Cargo @ Empresa
- Texto depoimento

**Componentes:**
- `Card` (variant="testimonial" - criar)
- `Avatar` ✅ (já existe!)

### SEÇÃO 7: CTA Final
**Layout:** Full-width gradiente
**Elementos:**
- Logo TalentBase branco
- Headline impactante
- Subtítulo provocativo
- CTA button azul grande

**Componentes:**
- `Button` (variant="primary", size="lg")
- Gradient background

### SEÇÃO 8: FAQ
**Layout:** 2 colunas (título + accordion)
**Elementos:**
- Título + subtítulo
- Accordion 5 items
- Item aberto: bg-blue-600
- Items fechados: bg-gray-100

**Componentes:**
- **Accordion/Collapsible** (criar novo)
- Chevron icons

### SEÇÃO 9: Form + Footer
**Layout:** Fundo preto, footer azul
**Elementos:**
- Título formulário
- Form: Nome, Sobrenome (grid-cols-2), Email, 2x Cargo, Button
- Footer azul: Logo + Copyright

**Componentes:**
- `FormField` + `Input` ✅
- `Button` (variant="primary")
- Footer component (criar)

---

## 🔧 Componentes a Criar

### 1. Accordion Component
```typescript
// packages/design-system/src/components/Accordion.tsx
interface AccordionProps {
  items: { question: string; answer: string }[];
}
```
- Item aberto: bg-blue-600, text-white
- Items fechados: bg-gray-100
- Chevron down animado

### 2. Card Variants
Adicionar variants ao Card existente:
- `variant="dark"` → bg-gray-900, text-white
- `variant="testimonial"` → padding especial, avatar layout
- `variant="profile"` → border azul, shadow

### 3. Navbar Component
```typescript
// packages/web/app/components/Navbar.tsx
- Fixed position
- Transparent → solid on scroll
- Mobile: hamburger menu
```

### 4. Footer Component
```typescript
// packages/web/app/components/Footer.tsx
- Background azul
- Logo + Copyright
- Links sociais (opcional)
```

---

## 📱 Responsividade

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Ajustes Mobile
- **Hero:** H1 reduzido, CTA full-width
- **Grids 2-col:** Stack vertical
- **Navbar:** Hamburger menu
- **Form:** Inputs full-width
- **Padding:** Reduzir para `px-4 py-12`

---

## ⚡ Performance & SEO

### Meta Tags (Remix)
```typescript
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
```

### Otimizações
- Lazy loading: imagens e videos
- Gradientes CSS (não imagens)
- Font display: swap
- Lighthouse target: >90 Performance

---

## 🎬 Micro-Interações

1. **Buttons:** Hover scale 1.05, transition 200ms
2. **Cards:** Hover elevate shadow
3. **Scroll:** Fade-in sections (Intersection Observer)
4. **Form:** Input focus ring azul
5. **Accordion:** Smooth height transition
6. **Navbar:** Scroll-triggered solid background

---

## 📝 Conteúdo Real

### Hero
**H1:** "O parceiro de IA para sua **próxima oportunidade**"
**Subtitle:** "Encontre oportunidades de carreira com o apoio de um parceiro de IA que entende seu perfil e conecta você às vagas certas em menos tempo."
**CTA:** "Quero meu headhunter pessoal"

### Tagline Repetida
"TalentBase é o seu headhunter de recolocação pessoal."

### Social Proof
Empresas: Totus, Mindsight, Ploomes, Sankhya, Caju

### Passos
1. "Preencha seu perfil" → "Conte suas preferências: tipo de vaga, empresa dos sonhos, salário desejado."
2. "IA procura a vaga para você" → "Nossa inteligência artificial encontra empresas contratando e cruza com o seu perfil."
3. "Apresentamos você" → "Seu perfil vai direto para quem decide. Nada de Gupy ou filtros automáticos."
4. "Só paga se for contratado" → "20% do seu primeiro salário. Justo, transparente, e sem pegadinhas."

### CTA Final
**Headline:** "Enquanto você pensa, outros estão sendo apresentados direto para os decisores."
**Subtitle:** "Preencha seu perfil agora e pare de implorar atenção pelo LinkedIn."

---

## ✅ Checklist Implementação

### Pré-requisitos
- [x] Design system com componentes base (Story 1.3 ✅)
- [x] Remix configurado
- [x] Tailwind CSS setup

### Componentes Novos
- [ ] Accordion component
- [ ] Card variants (dark, testimonial)
- [ ] Navbar component
- [ ] Footer component

### Seções Landing
- [ ] Hero section
- [ ] Como funciona (4 passos)
- [ ] Tour guiado
- [ ] Depoimentos
- [ ] CTA final
- [ ] FAQ
- [ ] Form + Footer

### Polimento
- [ ] Micro-interações
- [ ] Responsividade mobile
- [ ] SEO meta tags
- [ ] Performance audit (Lighthouse)
- [ ] Testes E2E

---

## 🔗 Referências

- **Design:** `docs/site/modelo-imagem/` (site1.png - site9.png)
- **Story:** `docs/stories/story-1.4.md`
- **Design System:** `packages/design-system/src/`

---

**Pronto para implementação!** 🚀
Passe para o Dev Agent com este documento + prompt v0/Lovable.
