---
name: integration-api
description: Integrate React frontend with backend APIs using Axios, React Query, and WebSocket for real-time updates. Use when you need to connect frontend to backend, consume REST APIs, set up HTTP clients, or implement real-time communication.
version: 1.0.0
author: Maestro
---

# API Integration

Connect a React frontend to backend APIs using Axios for HTTP, React Query for caching, and Socket.IO for real-time updates.

## When to Use
- User needs to set up an HTTP client with Axios
- User wants to create a service layer for API calls
- User needs React Query hooks for data fetching and mutations
- User wants to add real-time WebSocket updates
- User needs to handle API errors, retries, and loading states

## Available Operations
1. Configure Axios client with base URL, timeouts, and interceptors
2. Create a typed service layer for API endpoints
3. Build React Query hooks with cache management
4. Set up WebSocket connections with Socket.IO
5. Handle error states, retries, and optimistic updates

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
npm install axios @tanstack/react-query socket.io-client
npm install -D @tanstack/react-query-devtools
```

### Step 2: Configure Axios HTTP Client
```typescript
// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap response data and handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

Add the API URL to your environment:
```bash
# .env.local
VITE_API_URL=http://localhost:8000/api/v1
```

### Step 3: Create Typed Service Layer
```typescript
// src/services/itemApi.ts
import { api } from '@/lib/api';

export interface Item {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface CreateItemDto {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export const itemApi = {
  list: (params?: { page?: number; size?: number; status?: string }) =>
    api.get<PaginatedResponse<Item>>('/items', { params }),

  get: (id: string) =>
    api.get<Item>(`/items/${id}`),

  create: (data: CreateItemDto) =>
    api.post<Item>('/items', data),

  update: (id: string, data: Partial<CreateItemDto>) =>
    api.put<Item>(`/items/${id}`, data),

  delete: (id: string) =>
    api.delete(`/items/${id}`),
};
```

### Step 4: Build React Query Hooks
```typescript
// src/hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemApi, type CreateItemDto } from '@/services/itemApi';
import { toast } from 'sonner';

export function useItems(params?: { page?: number; status?: string }) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => itemApi.list(params),
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemDto) => itemApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create item');
    },
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateItemDto> }) =>
      itemApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['items', id] });
      toast.success('Item updated');
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted');
    },
  });
}
```

### Step 5: Use Hooks in Components
```tsx
// src/features/items/ItemListPage.tsx
import { useItems, useDeleteItem } from '@/hooks/useItems';

export function ItemListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useItems({ page });
  const deleteItem = useDeleteItem();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div>
      <h1>Items</h1>
      {data?.items.map((item) => (
        <div key={item.id} className="flex justify-between p-4 border-b">
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
          <button onClick={() => deleteItem.mutate(item.id)}>Delete</button>
        </div>
      ))}
      <Pagination page={page} total={data?.total ?? 0} onChange={setPage} />
    </div>
  );
}
```

### Step 6: Add WebSocket for Real-Time Updates
```typescript
// src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useAgentEvents(onEvent: (event: TrackingEvent) => void) {
  useEffect(() => {
    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000');
    socket.on('tracking:event', onEvent);

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [onEvent]);
}

// Usage:
// useAgentEvents((event) => {
//   console.log('New event:', event);
//   queryClient.invalidateQueries({ queryKey: ['items'] });
// });
```

### Step 7: Verify Integration
```bash
# Start backend
uvicorn src.main:app --reload --port 8000

# Start frontend
npm run dev

# Verify in browser:
# 1. Open http://localhost:5173
# 2. Open DevTools Network tab
# 3. Check API calls are going to correct URL
# 4. Check Authorization header is present
# 5. Verify data loads and displays correctly
# 6. Test create/update/delete operations
# 7. Check error handling (stop backend, verify error states)
```

## Resources
- `references/api-patterns.md` - REST API integration patterns and conventions

## Examples
### Example 1: Connect to a New API Endpoint
User asks: "Add API integration for the orders feature"
Response approach:
1. Create `orderApi.ts` service with typed endpoints
2. Create `useOrders()`, `useCreateOrder()`, `useUpdateOrder()` hooks
3. Add toast notifications for mutations
4. Show usage in an `OrderListPage` component
5. Verify with `npm run dev`

### Example 2: Add Real-Time Updates
User asks: "Show live updates when agents complete tasks"
Response approach:
1. Set up Socket.IO connection with `useAgentEvents` hook
2. Listen for `task:completed` events
3. Invalidate relevant React Query caches on events
4. Show a toast notification for each completed task
5. Test by triggering events from the backend

## Notes
- Always type API request/response DTOs with TypeScript interfaces
- Use React Query for all server state -- never store API data in useState or Zustand
- Add error handling to every mutation (onError with toast)
- Set up interceptors once in api.ts -- do not add auth headers in individual calls
- Use `enabled: !!id` to prevent queries with empty/null parameters
- Keep the service layer thin: just API call definitions, no business logic
