# Modal Component

Componente de diálogo modal completo com animações, variantes e acessibilidade total. Ideal para confirmações, formulários e exibição de informações detalhadas que requerem atenção focada do usuário.

## Características

- ✅ **Variantes semânticas** - default, danger, success, info
- ✅ **Animações suaves** - fade in/out do backdrop, scale in/out do conteúdo
- ✅ **Focus trap** - mantém foco dentro do modal
- ✅ **Keyboard navigation** - Esc para fechar, Tab para navegar
- ✅ **Body scroll lock** - previne scroll do conteúdo de fundo
- ✅ **Click outside** - fecha ao clicar no backdrop (configurável)
- ✅ **Tamanhos responsivos** - sm, md, lg, xl, full
- ✅ **Acessibilidade completa** - ARIA labels, roles, focus management
- ✅ **Sub-componentes** - ModalHeader, ModalBody, ModalFooter

## Quando Usar

### ✅ Use Modal para:

- **Confirmações críticas** - "Tem certeza que deseja deletar?"
- **Formulários curtos** - criar/editar registros sem mudar de página
- **Detalhes do item** - visualizar informações completas
- **Wizards multi-step** - fluxos guiados em etapas
- **Avisos importantes** - mensagens que requerem ação

### ❌ Não use Modal para:

- **Feedback simples** → use Toast
- **Mensagens inline** → use Alert
- **Formulários complexos/longos** → use página dedicada
- **Múltiplos modais empilhados** → redesenhe o fluxo
- **Navegação principal** → use rotas/páginas

## Instalação

O Modal já está incluído no design system:

```tsx
import { Modal, ModalFooter, Button } from '@talentbase/design-system';
```

## Uso Básico

```tsx
import { useState } from 'react';
import { Modal, ModalFooter, Button } from '@talentbase/design-system';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Welcome"
      >
        <p>This is a basic modal.</p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

## API

### Modal Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `isOpen` | `boolean` | - | Controla visibilidade do modal (required) |
| `onClose` | `() => void` | - | Callback quando modal deve fechar (required) |
| `title` | `string` | `undefined` | Título do modal |
| `description` | `string` | `undefined` | Descrição abaixo do título |
| `children` | `ReactNode` | - | Conteúdo do modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Tamanho do modal |
| `variant` | `'default' \| 'danger' \| 'success' \| 'info'` | `'default'` | Variante visual |
| `showCloseButton` | `boolean` | `true` | Mostra botão X de fechar |
| `closeOnBackdrop` | `boolean` | `true` | Fecha ao clicar fora |
| `closeOnEscape` | `boolean` | `true` | Fecha ao pressionar Esc |
| `className` | `string` | `''` | Classe CSS customizada |

### Tamanhos

- `sm` - 384px (max-w-sm) - pequenas confirmações
- `md` - 512px (max-w-lg) - padrão, formulários simples
- `lg` - 768px (max-w-2xl) - formulários médios, detalhes
- `xl` - 1024px (max-w-4xl) - formulários complexos, wizards
- `full` - 1280px (max-w-7xl) - conteúdo muito extenso

## Variantes

### Default

Modal padrão sem ícone, para uso geral.

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="User Details"
  variant="default"
>
  <p>View and edit user information.</p>
</Modal>
```

### Danger

Modal vermelho com ícone de alerta, para ações destrutivas.

```tsx
<Modal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  title="Delete Candidate"
  description="This action cannot be undone."
  variant="danger"
>
  <p>Are you sure you want to delete João Silva?</p>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
      Cancel
    </Button>
    <Button variant="destructive" onClick={handleDelete}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

### Success

Modal verde com ícone de check, para confirmações positivas.

```tsx
<Modal
  isOpen={isSuccessOpen}
  onClose={() => setIsSuccessOpen(false)}
  title="Candidate Created!"
  variant="success"
>
  <p>João Silva has been added to the database.</p>
  <ModalFooter>
    <Button onClick={() => setIsSuccessOpen(false)}>
      OK
    </Button>
  </ModalFooter>
</Modal>
```

### Info

Modal azul com ícone de informação, para avisos e informações.

```tsx
<Modal
  isOpen={isInfoOpen}
  onClose={() => setIsInfoOpen(false)}
  title="Important Information"
  variant="info"
>
  <p>Your session will expire in 5 minutes.</p>
  <ModalFooter>
    <Button onClick={extendSession}>Extend Session</Button>
  </ModalFooter>
</Modal>
```

## Sub-componentes

### ModalHeader

Use quando precisar de header customizado (raro, geralmente use props `title` e `description`).

```tsx
<Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
  <ModalHeader>
    <div className="flex items-center gap-3">
      <Avatar src="/user.jpg" />
      <div>
        <h2 className="text-xl font-bold">João Silva</h2>
        <p className="text-sm text-gray-600">SDR/BDR</p>
      </div>
    </div>
  </ModalHeader>
  {/* ... body ... */}
</Modal>
```

### ModalBody

Use quando precisar de estilos customizados no corpo (raro, geralmente use children direto).

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Details">
  <ModalBody className="bg-gray-50 p-0">
    {/* custom styled content */}
  </ModalBody>
</Modal>
```

### ModalFooter

Use para botões de ação no rodapé.

```tsx
<ModalFooter>
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button onClick={onSave}>Save Changes</Button>
</ModalFooter>
```

## Exemplos Práticos

### Confirmação de Deleção

```tsx
function DeleteCandidateModal({ candidate, isOpen, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(candidate.id);
      onClose();
      toast.success('Candidato removido');
    } catch (error) {
      toast.error('Erro ao remover candidato');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deletar Candidato"
      description="Esta ação não pode ser desfeita."
      variant="danger"
      closeOnBackdrop={false} // Previne fechar acidentalmente
    >
      <p className="text-gray-700">
        Tem certeza que deseja deletar <strong>{candidate.name}</strong>?
      </p>
      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deletando...' : 'Deletar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Formulário de Edição

```tsx
function EditCandidateModal({ candidate, isOpen, onClose }) {
  const [formData, setFormData] = useState(candidate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCandidate(formData);
    onClose();
    toast.success('Candidato atualizado!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Candidato"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Posição"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            options={[
              { value: 'SDR/BDR', label: 'SDR/BDR' },
              { value: 'AE', label: 'Account Executive' },
            ]}
          />
        </div>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
```

### Detalhes do Candidato

```tsx
function CandidateDetailsModal({ candidate, isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={candidate.name}
      description={candidate.position}
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Informações de Contato</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-600">Email</dt>
              <dd className="font-medium">{candidate.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Telefone</dt>
              <dd className="font-medium">{candidate.phone}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Experiência</h3>
          <p>{candidate.years_experience} anos em vendas</p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Fechar</Button>
        <Button onClick={() => navigate(`/candidates/${candidate.id}/edit`)}>
          Editar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Modal sem Fechar por Acidente

```tsx
<Modal
  isOpen={isProcessing}
  onClose={() => {}} // Não faz nada
  title="Processando..."
  closeOnBackdrop={false} // Não fecha clicando fora
  closeOnEscape={false} // Não fecha com Esc
  showCloseButton={false} // Remove botão X
>
  <p>Por favor aguarde enquanto processamos sua solicitação.</p>
  <div className="flex justify-center mt-4">
    <Spinner />
  </div>
</Modal>
```

## UX Best Practices

### ✅ Boas Práticas

1. **Sempre forneça uma saída**
   ```tsx
   // ✅ Bom - sempre tem botão Cancelar
   <ModalFooter>
     <Button variant="ghost" onClick={onClose}>Cancelar</Button>
     <Button onClick={onConfirm}>Confirmar</Button>
   </ModalFooter>
   ```

2. **Use variantes apropriadas**
   ```tsx
   // ✅ Bom - danger para ações destrutivas
   <Modal variant="danger" title="Deletar Usuário">

   // ❌ Ruim - default para deleção
   <Modal variant="default" title="Deletar Usuário">
   ```

3. **Mantenha conteúdo conciso**
   ```tsx
   // ✅ Bom - curto e direto
   <Modal title="Deletar?">
     <p>Esta ação não pode ser desfeita.</p>
   </Modal>

   // ❌ Ruim - muito texto
   <Modal title="...">
     <p>{longParagraph1}</p>
     <p>{longParagraph2}</p>
     <p>{longParagraph3}</p>
   </Modal>
   ```

4. **Desabilite ações durante loading**
   ```tsx
   <ModalFooter>
     <Button variant="ghost" onClick={onClose} disabled={isLoading}>
       Cancelar
     </Button>
     <Button onClick={handleSave} disabled={isLoading}>
       {isLoading ? 'Salvando...' : 'Salvar'}
     </Button>
   </ModalFooter>
   ```

5. **Use tamanho apropriado**
   - `sm` - "Deletar?"
   - `md` - Formulário com 3-5 campos
   - `lg` - Formulário com 6-10 campos
   - `xl` - Detalhes completos, wizards
   - `full` - Evite, use página

## Acessibilidade

- **ARIA labels** - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- **Focus management** - foco vai para modal ao abrir, retorna ao elemento anterior ao fechar
- **Focus trap** - Tab navega apenas dentro do modal
- **Keyboard navigation** - Esc fecha, Tab/Shift+Tab navegam
- **Screen readers** - título e descrição anunciados

## Comparação: Modal vs Toast vs Alert

| Característica | Modal | Toast | Alert |
|----------------|-------|-------|-------|
| **Interrompe** | Sim | Não | Depende |
| **Requer ação** | Geralmente sim | Não | Às vezes |
| **Duração** | Até fechar | Temporário | Permanente |
| **Posição** | Centro | Canto | Inline |
| **Uso** | Confirmações, forms | Feedback | Avisos contextuais |

## Troubleshooting

### Modal não abre

**Causa:** `isOpen` não está sendo atualizado.

**Solução:** Verifique se useState está correto:
```tsx
const [isOpen, setIsOpen] = useState(false);
// ...
onClick={() => setIsOpen(true)} // ✅ Correto
onClick={() => setIsOpen(isOpen)} // ❌ Errado - não muda
```

### Conteúdo de fundo ainda rola

**Causa:** Múltiplos modals abertos ou modal não desmontando corretamente.

**Solução:** Garanta que apenas um modal está aberto por vez.

### Focus trap não funciona

**Causa:** Elementos focáveis fora do ref do modal.

**Solução:** Use ModalFooter para botões, mantenha conteúdo dentro do modal.

## Changelog

### v2.0.0 (2025-10-10)
- ✨ Adiciona variantes (danger, success, info)
- ✨ Animações suaves de entrada/saída
- ✨ Focus trap implementado
- ✨ Props `description`, `closeOnBackdrop`, `closeOnEscape`
- ✨ Sub-componentes: ModalHeader, ModalBody
- ✨ Ícones para variantes
- 🎨 Novo tamanho `full`
- ♿️ Acessibilidade melhorada
- 📝 Documentação completa

### v1.0.0
- Versão básica do Modal
