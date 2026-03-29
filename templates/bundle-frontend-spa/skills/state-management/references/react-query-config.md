# React Query Configuration Reference

## QueryClient Defaults
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // how long data is "fresh" (ms)
      gcTime: 5 * 60_000,         // garbage collection time (was cacheTime)
      retry: 2,                   // retry failed requests
      refetchOnWindowFocus: false, // disable refetch on tab focus
      refetchOnReconnect: true,    // refetch on network reconnect
    },
    mutations: {
      retry: 0,                   // don't retry mutations
    },
  },
});
```

## Common Query Patterns
```tsx
// Basic query
useQuery({ queryKey: ['items'], queryFn: api.list })

// Query with parameters
useQuery({ queryKey: ['items', filters], queryFn: () => api.list(filters) })

// Conditional query
useQuery({ queryKey: ['item', id], queryFn: () => api.get(id), enabled: !!id })

// Polling
useQuery({ queryKey: ['status'], queryFn: api.getStatus, refetchInterval: 5000 })
```

## Query Key Conventions
```tsx
// Entity list
['items']
['items', { status: 'active', page: 1 }]

// Single entity
['items', itemId]

// Nested resource
['items', itemId, 'comments']
```

## Cache Invalidation
```tsx
const qc = useQueryClient();

// Invalidate all items queries
qc.invalidateQueries({ queryKey: ['items'] });

// Invalidate specific item
qc.invalidateQueries({ queryKey: ['items', itemId] });

// Set data directly (optimistic update)
qc.setQueryData(['items', itemId], updatedItem);

// Remove from cache
qc.removeQueries({ queryKey: ['items', itemId] });
```
