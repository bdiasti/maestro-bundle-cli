---
name: react-patterns
description: Implement React patterns with TypeScript including custom hooks, composition, container/presenter, error boundaries, and forms with validation. Use when you need to create React components, structure features, build forms, or solve frontend architecture problems.
version: 1.0.0
author: Maestro
---

# React Patterns

Apply proven React + TypeScript patterns for scalable, maintainable frontend code.

## When to Use
- User needs to create a custom hook for data fetching or shared logic
- User wants to structure a feature using container/presenter pattern
- User needs to build a form with validation (React Hook Form + Zod)
- User wants to add error boundaries to catch rendering errors
- User needs to compose components instead of using deep prop drilling

## Available Operations
1. Create custom hooks for data fetching with React Query
2. Build components using composition pattern (slots, children)
3. Implement container/presenter separation
4. Add error boundaries with recovery
5. Build validated forms with React Hook Form + Zod

## Multi-Step Workflow

### Step 1: Set Up Project Dependencies
```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod react-error-boundary
npm install -D @types/react @types/react-dom typescript
```

### Step 2: Create Custom Hooks for Data Fetching
```tsx
// src/hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemApi } from '../services/itemApi';
import { toast } from 'sonner';

export function useItems(filters?: ItemFilters) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemApi.list(filters),
    staleTime: 30_000,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemApi.get(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created');
    },
    onError: (err) => toast.error(err.message),
  });
}
```

### Step 3: Build Components with Composition
```tsx
// src/components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-lg border bg-white shadow-sm', className)}>{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between p-4 border-b">{children}</div>;
};

Card.Content = function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-t bg-gray-50">{children}</div>;
};

// Usage:
<Card>
  <Card.Header>
    <h3>{item.title}</h3>
    <StatusBadge status={item.status} />
  </Card.Header>
  <Card.Content>
    <p>{item.description}</p>
  </Card.Content>
  <Card.Footer>
    <ProgressBar value={item.progress} />
  </Card.Footer>
</Card>
```

### Step 4: Implement Container/Presenter Pattern
```tsx
// Container: owns data fetching and state
function ItemListContainer() {
  const { data, isLoading, error } = useItems();
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} />;

  return <ItemList items={data!} selected={selected} onSelect={setSelected} />;
}

// Presenter: pure rendering, easy to test
interface ItemListProps {
  items: Item[];
  selected: string | null;
  onSelect: (id: string) => void;
}

function ItemList({ items, selected, onSelect }: ItemListProps) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isSelected={item.id === selected}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
}
```

### Step 5: Add Error Boundaries
```tsx
// src/components/AppErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button onClick={resetErrorBoundary} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Try again
      </button>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
}
```

### Step 6: Build Validated Forms
```tsx
// src/features/items/CreateItemForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const itemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
});

type ItemFormData = z.infer<typeof itemSchema>;

export function CreateItemForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });
  const createItem = useCreateItem();

  return (
    <form onSubmit={handleSubmit((data) => createItem.mutate(data))}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" {...register('title')} className="border rounded p-2 w-full" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register('description')} className="border rounded p-2 w-full" />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="priority">Priority</label>
        <select id="priority" {...register('priority')} className="border rounded p-2 w-full">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="submit" disabled={createItem.isPending} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        {createItem.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Step 7: Verify the Pattern Works
```bash
npm run dev
# Open http://localhost:5173 and test the feature

npm run type-check
# or: npx tsc --noEmit
```

## Resources
- `references/hook-patterns.md` - Custom hook patterns and anti-patterns
- `references/component-checklist.md` - Quality checklist for React components

## Examples
### Example 1: Create a Data Fetching Hook
User asks: "Create a hook to fetch and cache user profiles"
Response approach:
1. Create `useUser(id)` and `useUsers(filters)` hooks using React Query
2. Add `useCreateUser()` mutation with cache invalidation
3. Add toast notifications for success/error states
4. Show usage in a container component

### Example 2: Build a Feature Module
User asks: "Create the orders feature with list, detail, and create form"
Response approach:
1. Create `useOrders()` and `useCreateOrder()` hooks
2. Build `OrderList` presenter and `OrderListContainer`
3. Build `CreateOrderForm` with Zod validation
4. Wrap in `ErrorBoundary`
5. Add route entries and test with `npm run dev`

## Notes
- Prefer composition (children, render props) over configuration (boolean props)
- Never duplicate API data in Zustand -- use React Query for server state
- Keep presenters pure: no hooks, no side effects, just props and JSX
- Always type props with TypeScript interfaces, not `any`
- Use `enabled: !!id` in useQuery to prevent fetching with empty IDs
