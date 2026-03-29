# REST API Integration Patterns

## Service Layer Structure
```
src/
  services/
    itemApi.ts        # API endpoint definitions
  hooks/
    useItems.ts       # React Query hooks
  lib/
    api.ts            # Axios instance + interceptors
  types/
    item.ts           # TypeScript interfaces
```

## Naming Conventions
| API Method | Service Function | Hook Name |
|---|---|---|
| GET /items | `itemApi.list()` | `useItems()` |
| GET /items/:id | `itemApi.get(id)` | `useItem(id)` |
| POST /items | `itemApi.create(data)` | `useCreateItem()` |
| PUT /items/:id | `itemApi.update(id, data)` | `useUpdateItem()` |
| DELETE /items/:id | `itemApi.delete(id)` | `useDeleteItem()` |

## Error Handling Pattern
```typescript
// In mutation hook
useMutation({
  mutationFn: api.create,
  onSuccess: (data) => {
    qc.invalidateQueries({ queryKey: ['items'] });
    toast.success('Created successfully');
    navigate(`/items/${data.id}`);
  },
  onError: (error: ApiError) => {
    if (error.status === 422) {
      toast.error('Validation failed: ' + error.detail);
    } else {
      toast.error('Something went wrong');
    }
  },
});
```

## Pagination Pattern
```typescript
// Hook
function useItems(page: number, size = 20) {
  return useQuery({
    queryKey: ['items', { page, size }],
    queryFn: () => itemApi.list({ page, size }),
    keepPreviousData: true, // smooth pagination
  });
}

// Component
const [page, setPage] = useState(1);
const { data } = useItems(page);
```

## Optimistic Update Pattern
```typescript
useMutation({
  mutationFn: api.update,
  onMutate: async (updated) => {
    await qc.cancelQueries({ queryKey: ['items'] });
    const previous = qc.getQueryData(['items']);
    qc.setQueryData(['items'], (old) =>
      old?.map(item => item.id === updated.id ? { ...item, ...updated } : item)
    );
    return { previous };
  },
  onError: (_, __, context) => {
    qc.setQueryData(['items'], context?.previous);
    toast.error('Update failed, reverting changes');
  },
  onSettled: () => {
    qc.invalidateQueries({ queryKey: ['items'] });
  },
});
```
