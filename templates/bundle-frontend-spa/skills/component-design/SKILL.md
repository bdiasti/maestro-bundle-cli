---
name: component-design
description: Create reusable UI components with Tailwind CSS and Shadcn/UI following design system principles. Use when you need to create buttons, cards, modals, tables, badges, or any UI element with consistent styling and accessibility.
version: 1.0.0
author: Maestro
---

# Component Design

Build accessible, reusable UI components with Tailwind CSS, Shadcn/UI, and TypeScript.

## When to Use
- User needs to create a reusable UI component (button, card, modal, table)
- User wants to implement a design system with consistent variants
- User needs data tables with pagination and sorting
- User wants loading skeletons, error states, or empty states
- User needs accessible components with ARIA labels and keyboard navigation

## Available Operations
1. Create variant-based components (Button, Badge, Input)
2. Build compound components (Card with Header/Content/Footer)
3. Implement data tables with TanStack Table
4. Create async content wrappers (loading/error/empty states)
5. Add Shadcn/UI components to the project

## Multi-Step Workflow

### Step 1: Set Up Shadcn/UI (If Not Already Installed)
```bash
npx shadcn@latest init
npx shadcn@latest add button card table badge input dialog
npm install @tanstack/react-table clsx tailwind-merge
```

Create a utility for merging Tailwind classes:
```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 2: Create a Variant-Based Button Component
```tsx
// src/components/ui/Button.tsx
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent hover:bg-gray-100',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : children}
    </button>
  );
}
```

### Step 3: Create a Status Badge
```tsx
// src/components/ui/StatusBadge.tsx
const statusConfig = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
} as const;

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
```

### Step 4: Build a Data Table with Pagination
```tsx
// src/components/ui/DataTable.tsx
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pagination?: { page: number; size: number; total: number };
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({ data, columns, pagination, onPageChange }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-gray-50">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
              Previous
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Create Async Content Wrapper
```tsx
// src/components/ui/AsyncContent.tsx
import type { UseQueryResult } from '@tanstack/react-query';

interface AsyncContentProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
}

export function AsyncContent<T>({ query, children }: AsyncContentProps<T>) {
  if (query.isLoading) return <Skeleton />;
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  if (!query.data) return <EmptyState message="No data found" />;
  return <>{children(query.data)}</>;
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="text-center p-8">
      <p className="text-red-600">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry} className="mt-4">Retry</Button>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center p-8 text-gray-500">{message}</div>;
}
```

### Step 6: Verify Components
```bash
npm run dev
# Open http://localhost:5173 and visually verify components

npx tsc --noEmit
# Check for TypeScript errors
```

## Resources
- `references/tailwind-patterns.md` - Common Tailwind utility patterns
- `references/accessibility-checklist.md` - ARIA and keyboard nav requirements

## Examples
### Example 1: Create a Card Component
User asks: "Create a reusable card component with header, body, and footer slots"
Response approach:
1. Create a Card compound component with Card.Header, Card.Content, Card.Footer
2. Use Tailwind for styling with cn() for class merging
3. Add className prop pass-through for customization
4. Show usage example

### Example 2: Build a Status Dashboard Widget
User asks: "Create a metric card that shows a number with label and icon"
Response approach:
1. Create MetricCard with props: title, value, icon, trend
2. Style with Tailwind using responsive sizing
3. Add trend indicator (up/down arrow with color)
4. Show usage in a dashboard grid

## Notes
- Always extend native HTML attributes (React.ButtonHTMLAttributes, etc.)
- Use the cn() utility to merge Tailwind classes safely
- Every interactive element must be keyboard accessible
- Add aria-label to icon-only buttons
- Use `as const` for config objects to get literal type inference
- Test components in isolation before integrating into pages
