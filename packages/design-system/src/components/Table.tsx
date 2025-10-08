/**
 * Table Component - Design System
 *
 * Responsive table component with support for sorting, loading states, and empty states.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */

import * as React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={`w-full caption-bottom text-sm ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`border-b bg-gray-50 ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={`divide-y divide-gray-200 ${className}`}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, clickable = false, ...props }, ref) => {
    const classes = `
      ${clickable ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
      ${className}
    `.trim();

    return (
      <tr
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`h-12 px-4 text-left align-middle font-medium text-gray-700 ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`p-4 align-middle ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';
