/**
 * Table Component - Enhanced
 *
 * Professional table component with blue header, striped rows, and hover effects.
 * Designed for displaying data in admin panels and dashboards.
 *
 * Features:
 * - 🎨 Primary blue header background
 * - 📊 Zebra-striped rows for better readability
 * - 🖱️ Hover effects on clickable rows
 * - 📱 Responsive with horizontal scroll
 * - ♿️ Semantic HTML and accessible
 * - 🎯 Optional sorting indicators
 * - 🔄 Loading and empty states
 *
 * UX Best Practices:
 * - Use striped rows for tables with 5+ rows
 * - Make entire row clickable when row action exists
 * - Show loading state during data fetch
 * - Provide clear empty state with action
 * - Keep header sticky on scroll for long tables
 *
 * @example
 * ```tsx
 * <Table striped>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow clickable onClick={() => handleRowClick(user)}>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *       <TableCell><Badge>Active</Badge></TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */

import * as React from 'react';
import { cn } from '../lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  /** Enable zebra-striped rows */
  striped?: boolean;
  /** Make table header sticky on scroll */
  stickyHeader?: boolean;
  /** Custom className */
  className?: string;
}

const TableContext = React.createContext<{ striped: boolean }>({ striped: false });

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', children, striped = false, stickyHeader = false, ...props }, ref) => {
    return (
      <TableContext.Provider value={{ striped }}>
        <div className={cn('relative w-full overflow-auto bg-white rounded-lg border border-gray-200', stickyHeader && 'max-h-[600px]')}>
          <table
            ref={ref}
            className={cn('w-full caption-bottom text-sm border-collapse', className)}
            {...props}
          >
            {children}
          </table>
        </div>
      </TableContext.Provider>
    );
  }
);

Table.displayName = 'Table';

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  /** Use primary color (blue) for header background */
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', children, variant = 'primary', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 border-b-2 border-gray-300',
      primary: 'bg-slate-100 border-b-2 border-slate-200',
      secondary: 'bg-secondary-100 border-b-2 border-secondary-200',
    };

    return (
      <thead
        ref={ref}
        className={cn('sticky top-0 z-10', variantClasses[variant], className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={cn('', className)} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  /** Make row clickable with hover effect */
  clickable?: boolean;
  /** Selected state */
  selected?: boolean;
  className?: string;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, clickable = false, selected = false, ...props }, ref) => {
    const { striped } = React.useContext(TableContext);
    const [rowIndex, setRowIndex] = React.useState<number>(0);
    const internalRef = React.useRef<HTMLTableRowElement>(null);

    // Merge internal ref with forwarded ref
    const mergedRef = React.useCallback(
      (node: HTMLTableRowElement | null) => {
        // Update internal ref
        (internalRef as React.MutableRefObject<HTMLTableRowElement | null>).current = node;

        // Update forwarded ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = node;
        }
      },
      [ref]
    );

    React.useEffect(() => {
      if (internalRef.current) {
        const tbody = internalRef.current.parentElement;
        if (tbody) {
          const index = Array.from(tbody.children).indexOf(internalRef.current);
          setRowIndex(index);
        }
      }
    }, []);

    return (
      <tr
        ref={mergedRef}
        className={cn(
          // Base styles
          'border-b border-gray-200 transition-colors duration-150 bg-white',
          // Striped rows (even rows get background)
          striped && rowIndex % 2 === 0 && 'bg-gray-50',
          // Clickable styles
          clickable && [
            'cursor-pointer',
            'hover:bg-slate-50',
            'active:bg-slate-100',
          ],
          // Selected state
          selected && 'bg-blue-50 hover:bg-blue-100',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  /** Enable sorting indicator */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Callback when header is clicked (for sorting) */
  onSort?: () => void;
  className?: string;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    { className = '', children, sortable = false, sortDirection = null, onSort, ...props },
    ref
  ) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-semibold',
          'text-slate-800 text-xs uppercase tracking-wide',
          sortable && 'cursor-pointer select-none hover:text-primary-700 transition-colors',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <span className="text-slate-500">
              {sortDirection === 'asc' && '↑'}
              {sortDirection === 'desc' && '↓'}
              {sortDirection === null && '⇅'}
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  /** Align cell content */
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <td
        ref={ref}
        className={cn(
          'px-4 py-4 align-middle text-gray-900 text-sm',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

/**
 * TableActionCell - Special cell for showing action indicator (chevron)
 * Use this as the last cell in clickable rows to show the › icon
 */
export const TableActionCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className = '', ...props }, ref) => {
  return (
    <td
      ref={ref}
      className={cn('px-4 py-4 align-middle text-gray-400 text-right w-12', className)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </td>
  );
});

TableActionCell.displayName = 'TableActionCell';

/* ===== Table Utility Components ===== */

export interface TableEmptyProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state for tables with no data
 *
 * @example
 * <TableEmpty
 *   title="No candidates found"
 *   message="Start by importing candidates or creating a new one."
 *   action={<Button>Add Candidate</Button>}
 * />
 */
export function TableEmpty({
  icon,
  title,
  message,
  action,
  className = '',
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={100} className={cn('p-12', className)}>
        <div className="flex flex-col items-center justify-center text-center">
          {icon && <div className="mb-4 text-gray-400">{icon}</div>}
          {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
          <p className="text-gray-600 mb-6 max-w-sm">{message}</p>
          {action && <div>{action}</div>}
        </div>
      </td>
    </tr>
  );
}

export interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Loading skeleton for tables
 *
 * @example
 * {isLoading ? (
 *   <TableLoading rows={5} columns={4} />
 * ) : (
 *   // ... actual rows
 * )}
 */
export function TableLoading({ rows = 5, columns = 3, className = '' }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className={className}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export interface TableCaptionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Table caption for accessibility
 *
 * @example
 * <Table>
 *   <TableCaption>List of all active candidates</TableCaption>
 *   ...
 * </Table>
 */
export function TableCaption({ children, className = '' }: TableCaptionProps) {
  return (
    <caption className={cn('mt-4 text-sm text-gray-600', className)}>
      {children}
    </caption>
  );
}
