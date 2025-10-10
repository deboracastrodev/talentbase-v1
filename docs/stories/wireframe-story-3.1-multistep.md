# Wireframe - Story 3.1: Multi-Step Wizard (Candidate Profile Creation)

**Story:** 3.1 - Candidate Profile Creation
**Component:** MultiStepWizard
**Total Steps:** 5
**Created:** 2025-10-09
**UX Designer:** Sally (BMad UX Expert)

---

## 🎨 Design Principles

### Visual Hierarchy
- **Progress indicator** sempre visível no topo
- **Step atual** destacado com ring effect
- **Steps completados** com checkmark
- **Form fields** com labels claras e placeholders informativos

### Interaction Patterns
- **Validação inline** ao blur do campo
- **Botão "Próximo" disabled** se validação falhar
- **Auto-save** em localStorage a cada 30s (silent)
- **Loading states** durante API calls

### Accessibility (WCAG 2.1 AA)
- Navegação por teclado (Tab, Enter)
- Labels associados a inputs
- Error messages com aria-live
- Focus indicators claros

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVBAR (LoggedIn)                        │
│  TalentBase Logo    Candidate Dashboard    [Avatar Menu]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PROGRESS SECTION                         │
│                                                             │
│  Passo 2 de 5                              40% completo    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                             │
│  [✓]──────[●]──────[ ]──────[ ]──────[ ]                   │
│  Básico  Posição  Ferramentas Soluções Histórico          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STEP TITLE                               │
│  Posição & Experiência                                     │
│  Cargo e tipo de vendas                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FORM CONTENT (Card)                      │
│                                                             │
│  [Form fields específicos de cada step]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATION                               │
│                                                             │
│  [← Anterior]  [💾 Salvar Rascunho]         [Próximo →]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔹 Step 1: Informações Básicas

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Informações Básicas                             │
│ Nome, contato e localização                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ Nome completo *                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Digite seu nome completo                    ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Telefone *                                      │
│ ┌─────────────────────────────────────────────┐│
│ │ (11) 98765-4321                             ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Localização *                                   │
│ ┌─────────────────────────────────────────────┐│
│ │ São Paulo, SP                               ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Foto de perfil (opcional)                      │
│ ┌─────────────┐                                │
│ │   [📷]      │  Arraste ou clique para upload │
│ │             │  JPG, PNG (max 2MB)            │
│ └─────────────┘                                │
│                                                 │
└─────────────────────────────────────────────────┘

[💾 Salvar Rascunho]              [Próximo →]
```

### Fields
- **Nome completo** (text, required)
  - Validation: Min 3 caracteres
  - Error: "Nome deve ter pelo menos 3 caracteres"

- **Telefone** (text, required)
  - Mask: (XX) XXXXX-XXXX
  - Validation: Formato brasileiro
  - Error: "Telefone inválido. Use formato: (11) 98765-4321"

- **Localização** (text, required)
  - Placeholder: "São Paulo, SP"
  - Validation: Not empty
  - Error: "Localização é obrigatória"

- **Foto de perfil** (file, optional)
  - Upload to S3 via presigned URL
  - Max size: 2MB
  - Accepted: JPG, PNG
  - Preview after upload
  - Error: "Arquivo deve ser JPG ou PNG e menor que 2MB"

### Behavior
- "Próximo" button **disabled** if required fields empty
- Photo upload shows **loading spinner** during S3 upload
- Auto-save to localStorage on blur

---

## 🔹 Step 2: Posição & Experiência

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Posição & Experiência                           │
│ Cargo e tipo de vendas                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ Posição atual *                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Selecione sua posição            [▼]       ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Anos de experiência *                           │
│ ┌─────────────────────────────────────────────┐│
│ │ 5                                           ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Tipo de vendas *                                │
│ ☐ Inbound                                       │
│ ☐ Outbound                                      │
│                                                 │
│ Modelo de vendas *                              │
│ ☐ Inside Sales                                  │
│ ☐ Field Sales                                   │
│                                                 │
│ Ciclo de vendas                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Selecione o ciclo médio          [▼]       ││
│ └─────────────────────────────────────────────┘│
│ • 1-3 meses  • 3-6 meses  • 6-12 meses         │
│                                                 │
│ Ticket médio (ARR)                              │
│ ┌─────────────────────────────────────────────┐│
│ │ Selecione o ticket médio         [▼]       ││
│ └─────────────────────────────────────────────┘│
│ • R$ 12-24K  • R$ 24-60K  • R$ 60K+            │
│                                                 │
└─────────────────────────────────────────────────┘

[← Anterior]  [💾 Salvar Rascunho]    [Próximo →]
```

### Fields
- **Posição atual** (select, required)
  - Options: SDR/BDR, AE, CSM, Sales Manager, Sales Director
  - Error: "Selecione sua posição"

- **Anos de experiência** (number, required)
  - Min: 0, Max: 50
  - Error: "Anos de experiência deve ser maior que 0"

- **Tipo de vendas** (checkbox, at least 1 required)
  - Inbound, Outbound
  - Error: "Selecione pelo menos 1 tipo de venda"

- **Modelo de vendas** (checkbox, at least 1 required)
  - Inside Sales, Field Sales
  - Error: "Selecione pelo menos 1 modelo de venda"

- **Ciclo de vendas** (select, optional)
  - Options: 1-3mo, 3-6mo, 6-12mo, 12mo+

- **Ticket médio** (select, optional)
  - Options: R$ 12-24K, R$ 24-60K, R$ 60-120K, R$ 120K+

### Behavior
- "Próximo" disabled if: position empty OR experience = 0 OR no sales type selected

---

## 🔹 Step 3: Ferramentas & Software

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Ferramentas & Software                          │
│ CRMs e softwares que você domina              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Selecione pelo menos 1 ferramenta *            │
│                                                 │
│ ☐ Salesforce          ☐ Outreach               │
│ ☐ Hubspot             ☐ Salesloft              │
│ ☐ Apollo.io           ☐ Pipedrive              │
│ ☐ LinkedIn Sales Nav  ☐ Zoho CRM               │
│ ☐ Microsoft Dynamics  ☐ Outro                  │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Especifique outras ferramentas (opcional)   ││
│ └─────────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘

[← Anterior]  [💾 Salvar Rascunho]    [Próximo →]
```

### Fields
- **Ferramentas** (checkbox group, at least 1 required)
  - Options: Salesforce, Hubspot, Apollo.io, Outreach, Salesloft, Pipedrive, LinkedIn Sales Navigator, Zoho CRM, Microsoft Dynamics, Outro
  - Error: "Selecione pelo menos 1 ferramenta"

- **Outras ferramentas** (text, optional)
  - Shown if "Outro" checked
  - Placeholder: "Ex: Close.io, Reply.io"

### Behavior
- "Próximo" disabled if no tools selected
- Checkboxes with custom styling (primary color)

---

## 🔹 Step 4: Soluções & Departamentos

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Soluções & Departamentos                        │
│ Produtos e departamentos que você atende       │
├─────────────────────────────────────────────────┤
│                                                 │
│ Soluções vendidas *                             │
│                                                 │
│ ☐ SaaS B2B            ☐ Martech                 │
│ ☐ Fintech             ☐ Edtech                  │
│ ☐ HR Tech             ☐ E-commerce              │
│ ☐ Healthtech          ☐ Cybersecurity           │
│ ☐ Outra               ┌──────────────────────┐  │
│                       │ Especifique (opcional)│  │
│                       └──────────────────────┘  │
│                                                 │
│ Departamentos para quem vendeu *                │
│                                                 │
│ ☐ IT                  ☐ C-Level                 │
│ ☐ Finance             ☐ Operations              │
│ ☐ HR                  ☐ Sales                   │
│ ☐ Marketing           ☐ Outro                   │
│                                                 │
└─────────────────────────────────────────────────┘

[← Anterior]  [💾 Salvar Rascunho]    [Próximo →]
```

### Fields
- **Soluções** (checkbox group, at least 1 required)
  - Options: SaaS B2B, Fintech, HR Tech, Healthtech, Martech, Edtech, E-commerce, Cybersecurity, Outra
  - Error: "Selecione pelo menos 1 solução"

- **Departamentos** (checkbox group, at least 1 required)
  - Options: IT, Finance, HR, Marketing, C-Level, Operations, Sales, Outro
  - Error: "Selecione pelo menos 1 departamento"

### Behavior
- "Próximo" disabled if solutions = 0 OR departments = 0

---

## 🔹 Step 5: Histórico & Bio

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Histórico de Trabalho & Bio                    │
│ Sua trajetória profissional                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ Bio profissional * (mínimo 100 caracteres)     │
│ ┌─────────────────────────────────────────────┐│
│ │                                             ││
│ │ Conte um pouco sobre sua trajetória em      ││
│ │ vendas, principais conquistas e o que te    ││
│ │ motiva...                                   ││
│ │                                             ││
│ │                                             ││
│ └─────────────────────────────────────────────┘│
│ 150 / 100 caracteres                           │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ Experiências profissionais *                   │
│ (adicione pelo menos 1)                        │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🏢 Tech Company                             ││
│ │    Account Executive • 2020 - Atual         ││
│ │    [📝 Editar]  [🗑️ Remover]               ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ [+ Adicionar experiência]                      │
│                                                 │
└─────────────────────────────────────────────────┘

[← Anterior]  [💾 Salvar Rascunho]   [✓ Criar Perfil]
```

### Fields
- **Bio** (textarea, required)
  - Min length: 100 caracteres
  - Max length: 2000 caracteres
  - Character counter shown
  - Error: "Bio deve ter no mínimo 100 caracteres (atual: X)"

- **Experiências** (dynamic list, at least 1 required)
  - Company name (text, required)
  - Position (text, required)
  - Start date (date, required)
  - End date (date, optional - if empty, shows "Atual")
  - Description (textarea, optional)
  - Error: "Adicione pelo menos 1 experiência profissional"

### Add Experience Modal

```
┌─────────────────────────────────────────────────┐
│ Adicionar Experiência Profissional        [✕]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ Nome da empresa *                               │
│ ┌─────────────────────────────────────────────┐│
│ │ Ex: Salesforce                              ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Cargo *                                         │
│ ┌─────────────────────────────────────────────┐│
│ │ Ex: Account Executive                       ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Data de início *        Data de término        │
│ ┌──────────────────┐   ┌──────────────────┐    │
│ │ MM/AAAA          │   │ MM/AAAA (atual)  │    │
│ └──────────────────┘   └──────────────────┘    │
│                       ☐ Trabalho atual         │
│                                                 │
│ Descrição (opcional)                            │
│ ┌─────────────────────────────────────────────┐│
│ │ Principais responsabilidades e conquistas   ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│          [Cancelar]      [Adicionar]           │
└─────────────────────────────────────────────────┘
```

### Behavior
- **Bio character counter** updates in real-time
- **"Criar Perfil" button disabled** if: bio < 100 chars OR experiences = 0
- **Loading state** on submit (shows spinner + "Processando...")
- **Success flow:**
  1. Submit → Loading (1-2s)
  2. Success toast: "Perfil criado! Gere seu link compartilhável."
  3. Redirect to `/candidate/profile` (view mode)

---

## 🎯 States & Interactions

### Loading States
```
[⏳ Carregando...]  (Button disabled + spinner)
```

### Error States
```
┌─────────────────────────────────────────────┐
│ ⚠️ Telefone inválido                        │
│    Use formato: (11) 98765-4321            │
└─────────────────────────────────────────────┘
```

### Success Toast (After Submit)
```
┌─────────────────────────────────────────────┐
│ ✓ Perfil criado com sucesso!               │
│   Gere seu link compartilhável             │
│                                        [✕]  │
└─────────────────────────────────────────────┘
```

### Draft Saved Toast
```
┌─────────────────────────────────────────────┐
│ ✓ Rascunho salvo                           │
│                                        [✕]  │
└─────────────────────────────────────────────┘
```

---

## 🔄 Navigation Flow

```
┌──────────┐  Next   ┌──────────┐  Next   ┌──────────┐
│  Step 1  │ ──────> │  Step 2  │ ──────> │  Step 3  │
│  Basic   │ <────── │ Position │ <────── │  Tools   │
└──────────┘  Prev   └──────────┘  Prev   └──────────┘
                                                │
                                                │ Next
                                                v
                                          ┌──────────┐
                                          │  Step 4  │
                                          │Solutions │
                                          └──────────┘
                                                │
                                                │ Next
                                                v
                                          ┌──────────┐
                                          │  Step 5  │
                                          │ History  │
                                          └──────────┘
                                                │
                                                │ Submit
                                                v
                                          ✓ Success!
                                                │
                                                v
                                      /candidate/profile
```

---

## 📱 Responsive Behavior

### Mobile (<768px)
- Progress indicator: Compact mode (show only current step number)
- Step pills: Stack vertically with smaller font
- Form: Full width
- Buttons: Stack vertically
- Navigation: "Anterior" and "Próximo" full width

### Tablet (768px - 1024px)
- Progress indicator: Show abbreviated step labels
- Form: Max width 600px, centered
- Buttons: Inline

### Desktop (>1024px)
- Full layout as shown in wireframes
- Max width 800px, centered
- All elements visible

---

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab** moves focus through form fields
- **Enter** on "Próximo" advances to next step
- **Escape** closes modals
- **Space** toggles checkboxes

### Screen Readers
- Progress announced: "Step 2 of 5, Position and Experience"
- Errors announced with aria-live="polite"
- Required fields have aria-required="true"
- Checkboxes grouped with fieldset/legend

### Visual
- Focus indicators: 2px solid ring on primary color
- Error color: Red with sufficient contrast
- Loading states: Spinner + text (not spinner-only)

---

## 🚀 Performance Considerations

- **Code splitting:** MultiStepWizard loaded on-demand
- **Image optimization:** Photo resized client-side before S3 upload
- **Form state:** React Context (avoid prop drilling)
- **Auto-save:** Debounced 30s to avoid excessive API calls
- **Validation:** Client-side first, server-side on submit

---

**Wireframe Version:** 1.0
**Last Updated:** 2025-10-09
**Status:** Ready for Development
