# Custom Hook Patterns

## Data Fetching Hook (React Query)
```tsx
export function useItems(filters?: Filters) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => api.list(filters),
    staleTime: 30_000,         // cache for 30s
    retry: 2,                  // retry failed requests twice
    enabled: filters !== undefined, // conditional fetching
  });
}
```

## Mutation Hook with Cache Invalidation
```tsx
export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      toast.success('Created');
    },
    onError: (err) => toast.error(err.message),
  });
}
```

## Debounced Value Hook
```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

## Local Storage Hook
```tsx
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## Anti-Patterns to Avoid
1. Do NOT call hooks conditionally (`if (x) useEffect(...)`)
2. Do NOT duplicate server state in useState -- use React Query
3. Do NOT create hooks that do too many things -- split them
4. Do NOT forget cleanup in useEffect return functions
