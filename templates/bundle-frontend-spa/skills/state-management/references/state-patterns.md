# State Patterns and Anti-Patterns

## Pattern: Selector-Based Zustand Access
```tsx
// GOOD: only re-renders when sidebarOpen changes
const sidebarOpen = useAppStore((s) => s.sidebarOpen);

// BAD: re-renders on ANY store change
const { sidebarOpen } = useAppStore();
```

## Pattern: Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: api.update,
  onMutate: async (newData) => {
    await qc.cancelQueries({ queryKey: ['items'] });
    const previous = qc.getQueryData(['items']);
    qc.setQueryData(['items'], (old) => ({ ...old, ...newData }));
    return { previous };
  },
  onError: (_, __, context) => {
    qc.setQueryData(['items'], context?.previous);
  },
  onSettled: () => {
    qc.invalidateQueries({ queryKey: ['items'] });
  },
});
```

## Anti-Pattern: Duplicating Server State
```tsx
// BAD: duplicating API data in Zustand
const useStore = create((set) => ({
  users: [],
  fetchUsers: async () => {
    const users = await api.getUsers();
    set({ users });
  },
}));

// GOOD: use React Query for server state
function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: api.getUsers });
}
```

## Anti-Pattern: Mega Store
```tsx
// BAD: one store for everything
const useMegaStore = create((set) => ({
  sidebar: true,
  theme: 'light',
  users: [],
  notifications: [],
  // ...50 more fields
}));

// GOOD: separate stores by domain
const useUIStore = create(/* UI state */);
const useNotificationStore = create(/* notification state */);
// Server state in React Query hooks
```

## Pattern: Persisted Zustand Store
```tsx
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'settings-storage' }
  )
);
```
