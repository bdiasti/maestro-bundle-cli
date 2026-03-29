---
name: state-management
description: Manage application state with Zustand for global UI state and React Query for server state. Use when you need to manage global state, cache API data, sync real-time WebSocket data, or decide which state solution to use.
version: 1.0.0
author: Maestro
---

# State Management

Choose and implement the right state management solution for each type of state using Zustand, React Query, and React Hook Form.

## When to Use
- User needs to decide between Zustand, React Query, or useState
- User wants to create a global UI store (sidebar, theme, selections)
- User needs to set up server state caching with React Query
- User wants to add real-time WebSocket state
- User needs to manage complex form state

## Available Operations
1. Set up React Query provider and hooks for server state
2. Create Zustand stores for global UI state
3. Build WebSocket-connected stores for real-time data
4. Configure React Hook Form for form state
5. Diagnose and fix state management anti-patterns

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers zod socket.io-client
npm install -D @tanstack/react-query-devtools
```

### Step 2: Understand the State Decision Matrix

| State Type | Solution | Example |
|---|---|---|
| Server data (API) | React Query | List of items, user profiles, search results |
| Global UI state | Zustand | Sidebar open/closed, theme, selected item ID |
| Local UI state | useState | Modal visibility, input value, toggle |
| Form state | React Hook Form | Form inputs, validation, submission |
| Real-time data | Zustand + WebSocket | Live agent status, event feed |

### Step 3: Set Up React Query Provider
```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30 seconds
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Step 4: Create API Service and Query Hooks
```tsx
// src/services/itemApi.ts
import { api } from '@/lib/api';

export const itemApi = {
  list: (filters?: ItemFilters) =>
    api.get<PaginatedResponse<Item>>('/api/v1/items', { params: filters }),
  get: (id: string) =>
    api.get<Item>(`/api/v1/items/${id}`),
  create: (data: CreateItemDto) =>
    api.post<Item>('/api/v1/items', data),
};

// src/hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useItems(filters?: ItemFilters) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemApi.list(filters),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: itemApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}
```

### Step 5: Create Zustand Store for UI State
```tsx
// src/stores/useAppStore.ts
import { create } from 'zustand';

interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedItemId: string | null;
  selectItem: (id: string | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectedItemId: null,
  selectItem: (id) => set({ selectedItemId: id }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

// Usage in components:
// const { sidebarOpen, toggleSidebar } = useAppStore();
// Or with selector for performance:
// const sidebarOpen = useAppStore((s) => s.sidebarOpen);
```

### Step 6: Add Real-Time WebSocket Store
```tsx
// src/stores/useRealtimeStore.ts
import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';

interface RealtimeStore {
  agentStatuses: Record<string, AgentStatus>;
  events: TrackingEvent[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useRealtimeStore = create<RealtimeStore>((set) => {
  let socket: Socket | null = null;

  return {
    agentStatuses: {},
    events: [],
    connected: false,

    connect: () => {
      socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000');
      socket.on('connect', () => set({ connected: true }));
      socket.on('disconnect', () => set({ connected: false }));
      socket.on('agent:status', (data) =>
        set((s) => ({ agentStatuses: { ...s.agentStatuses, [data.agentId]: data.status } }))
      );
      socket.on('tracking:event', (event) =>
        set((s) => ({ events: [event, ...s.events].slice(0, 100) }))
      );
    },

    disconnect: () => {
      socket?.disconnect();
      socket = null;
      set({ connected: false });
    },
  };
});
```

### Step 7: Verify State Management
```bash
npm run dev
# Open http://localhost:5173
# Open React Query DevTools (floating button in bottom-right)
# Verify: queries are cached, mutations invalidate correctly

npx tsc --noEmit
# Check for TypeScript errors in stores and hooks
```

## Resources
- `references/state-patterns.md` - Common state patterns and anti-patterns
- `references/react-query-config.md` - React Query configuration reference

## Examples
### Example 1: Add a Global Store
User asks: "Create a store for managing the notification panel state"
Response approach:
1. Create `useNotificationStore` with Zustand
2. Add state: `isOpen`, `unreadCount`, `notifications[]`
3. Add actions: `toggle()`, `markRead(id)`, `addNotification()`
4. Show usage in the NotificationPanel component
5. Use selector pattern for performance

### Example 2: Fix State Duplication
User asks: "We have user data in both Zustand and React Query, which should we keep?"
Response approach:
1. Identify that server data belongs in React Query, not Zustand
2. Remove user data from Zustand store
3. Create `useCurrentUser()` hook with React Query
4. Keep only the auth token in Zustand (UI state)
5. Update components to use the new hook

## Notes
- Never duplicate API data in Zustand -- React Query is the source of truth for server state
- Use selectors with Zustand to prevent unnecessary re-renders: `useAppStore(s => s.sidebarOpen)`
- React Query DevTools are essential for debugging cache behavior
- Keep Zustand stores small and focused -- one store per domain, not one mega-store
- For WebSocket stores, always handle disconnect cleanup
