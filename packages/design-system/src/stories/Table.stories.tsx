import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableActionCell,
  TableEmpty,
  TableLoading,
  Badge,
  Button,
} from '../index';
import { Users, Plus } from 'lucide-react';

/**
 * Table Component - Data Tables
 *
 * Professional table with blue header, striped rows, and hover effects.
 *
 * ## Features
 * - 🎨 Primary blue header
 * - 📊 Zebra-striped rows
 * - 🖱️ Hover effects
 * - 🔄 Loading & empty states
 * - 🎯 Sorting indicators
 * - 📱 Responsive
 */
const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Table component optimized for admin panels and dashboards.

## Usage

\`\`\`tsx
<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow clickable onClick={handleClick}>
      <TableCell>João Silva</TableCell>
      <TableCell>joao@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const candidates = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    position: 'SDR/BDR',
    status: 'active',
    city: 'São Paulo, SP',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    position: 'Account Executive',
    status: 'pending',
    city: 'Rio de Janeiro, RJ',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@example.com',
    position: 'Customer Success',
    status: 'active',
    city: 'Belo Horizonte, MG',
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana@example.com',
    position: 'SDR/BDR',
    status: 'inactive',
    city: 'Curitiba, PR',
  },
  {
    id: '5',
    name: 'Carlos Ferreira',
    email: 'carlos@example.com',
    position: 'Inside Sales',
    status: 'active',
    city: 'Porto Alegre, RS',
  },
];

/**
 * Basic table without stripes or hover.
 */
export const Basic: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Posição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.slice(0, 3).map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>{candidate.name}</TableCell>
            <TableCell>{candidate.email}</TableCell>
            <TableCell>{candidate.position}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * Table with striped rows (zebra pattern).
 * Recommended for tables with 5+ rows.
 */
export const Striped: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Posição</TableHead>
          <TableHead>Cidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>{candidate.name}</TableCell>
            <TableCell>{candidate.email}</TableCell>
            <TableCell>{candidate.position}</TableCell>
            <TableCell>{candidate.city}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * Table with clickable rows and action indicator.
 * Rows show hover effect, cursor pointer, and chevron (›) icon.
 * Use TableActionCell as the last cell to show the action indicator.
 */
export const ClickableRows: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Posição</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-12">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow
            key={candidate.id}
            clickable
            onClick={() => alert(`Clicked on ${candidate.name}`)}
          >
            <TableCell>{candidate.name}</TableCell>
            <TableCell>{candidate.email}</TableCell>
            <TableCell>{candidate.position}</TableCell>
            <TableCell>
              <Badge
                variant={
                  candidate.status === 'active'
                    ? 'success'
                    : candidate.status === 'pending'
                    ? 'warning'
                    : 'default'
                }
              >
                {candidate.status}
              </Badge>
            </TableCell>
            <TableActionCell />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * Table with sortable columns.
 */
export const Sortable: Story = {
  render: () => {
    const [sortColumn, setSortColumn] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    const sortedData = [...candidates].sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a];
      const bVal = b[sortColumn as keyof typeof b];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : -modifier;
    });

    return (
      <Table striped>
        <TableHeader>
          <TableRow>
            <TableHead
              sortable
              sortDirection={sortColumn === 'name' ? sortDirection : null}
              onSort={() => handleSort('name')}
            >
              Nome
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortColumn === 'email' ? sortDirection : null}
              onSort={() => handleSort('email')}
            >
              Email
            </TableHead>
            <TableHead
              sortable
              sortDirection={sortColumn === 'position' ? sortDirection : null}
              onSort={() => handleSort('position')}
            >
              Posição
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.position}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    candidate.status === 'active'
                      ? 'success'
                      : candidate.status === 'pending'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {candidate.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * Table with loading state skeleton.
 */
export const Loading: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <>
        <Button onClick={() => setIsLoading(!isLoading)} className="mb-4">
          Toggle Loading
        </Button>

        <Table striped>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading rows={5} columns={4} />
            ) : (
              candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <Badge variant="success">{candidate.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </>
    );
  },
};

/**
 * Table with empty state.
 */
export const Empty: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Posição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableEmpty
          icon={<Users className="h-12 w-12" />}
          title="Nenhum candidato encontrado"
          message="Comece importando candidatos via CSV ou criando um novo manualmente."
          action={
            <div className="flex gap-3">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
              <Button>Criar Candidato</Button>
            </div>
          }
        />
      </TableBody>
    </Table>
  ),
};

/**
 * Table with selection checkboxes.
 */
export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    };

    const toggleSelectAll = () => {
      setSelected((prev) => (prev.length === candidates.length ? [] : candidates.map((c) => c.id)));
    };

    return (
      <>
        {selected.length > 0 && (
          <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
            <span className="text-primary-900 font-medium">
              {selected.length} candidato(s) selecionado(s)
            </span>
            <Button size="sm" variant="destructive">
              Deletar Selecionados
            </Button>
          </div>
        )}

        <Table striped>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selected.length === candidates.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Posição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id} selected={selected.includes(candidate.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(candidate.id)}
                    onChange={() => toggleSelect(candidate.id)}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  },
};

/**
 * Table with actions column.
 */
export const WithActions: Story = {
  render: () => (
    <Table striped>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell>{candidate.name}</TableCell>
            <TableCell>{candidate.email}</TableCell>
            <TableCell>
              <Badge
                variant={candidate.status === 'active' ? 'success' : 'default'}
              >
                {candidate.status}
              </Badge>
            </TableCell>
            <TableCell align="right">
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost">
                  Visualizar
                </Button>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
                <Button size="sm" variant="destructive">
                  Deletar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/**
 * Table with sticky header for long lists.
 */
export const StickyHeader: Story = {
  render: () => {
    // Create longer dataset
    const longData = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@example.com`,
      position: ['SDR/BDR', 'AE', 'CSM'][i % 3],
      status: ['active', 'pending', 'inactive'][i % 3],
    }));

    return (
      <Table striped stickyHeader>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Posição</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {longData.map((item) => (
            <TableRow key={item.id} clickable>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.position}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.status === 'active'
                      ? 'success'
                      : item.status === 'pending'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * Table with different header variants.
 */
export const HeaderVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Primary Header (Default)</h3>
        <Table striped>
          <TableHeader variant="primary">
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
              <TableHead>Column 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
              <TableCell>Data 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Secondary Header</h3>
        <Table striped>
          <TableHeader variant="secondary">
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
              <TableHead>Column 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
              <TableCell>Data 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Default Header (Gray)</h3>
        <Table striped>
          <TableHeader variant="default">
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
              <TableHead>Column 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
              <TableCell>Data 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  ),
};
