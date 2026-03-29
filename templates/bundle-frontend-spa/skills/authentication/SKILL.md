---
name: authentication
description: Implement JWT authentication with login, refresh tokens, route protection, and Axios interceptors for both frontend and backend. Use when you need to add login, JWT auth, protected routes, or token refresh to an application.
version: 1.0.0
author: Maestro
---

# Authentication

Implement complete JWT authentication flow covering backend token generation, frontend auth state, Axios interceptors, and protected routes.

## When to Use
- User needs to implement login/logout functionality
- User wants to protect routes requiring authentication
- User needs JWT token generation and validation (backend)
- User wants to add automatic token refresh
- User needs to set up Axios interceptors for auth headers

## Available Operations
1. Create JWT token generation and validation (FastAPI backend)
2. Build login/logout flow with Zustand auth store
3. Set up Axios interceptors for automatic Bearer token headers
4. Implement protected route wrappers
5. Add refresh token rotation

## Multi-Step Workflow

### Step 1: Install Backend Dependencies
```bash
pip install fastapi python-jose[cryptography] passlib[bcrypt] python-multipart
```

### Step 2: Create JWT Token Utilities (Backend)
```python
# src/auth/jwt.py
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = timedelta(hours=1)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + ACCESS_TOKEN_EXPIRE,
        "type": "access",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + REFRESH_TOKEN_EXPIRE,
        "type": "refresh",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await user_repo.find_by_id(payload["sub"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Step 3: Create Auth Endpoints (Backend)
```python
# src/auth/routes.py
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(data: LoginRequest):
    user = await user_repo.find_by_email(data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": create_access_token(str(user.id)),
        "refresh_token": create_refresh_token(str(user.id)),
        "user": UserResponse.from_entity(user),
    }

@router.post("/refresh")
async def refresh(data: RefreshRequest):
    try:
        payload = jwt.decode(data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return {"access_token": create_access_token(payload["sub"])}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.from_entity(user)
```

Test the backend:
```bash
# Start the API server
uvicorn src.main:app --reload --port 8000

# Test login
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Step 4: Install Frontend Dependencies
```bash
npm install axios zustand
```

### Step 5: Create Auth Store (Frontend)
```tsx
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { authApi } from '@/services/authApi';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const { access_token, refresh_token, user } = await authApi.login(email, password);
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    set({ token: access_token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
}));
```

### Step 6: Set Up Axios Interceptors
```tsx
// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
});

// Add auth header to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses: try refresh, then logout
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { access_token } = await authApi.refresh(refreshToken);
          useAuthStore.getState().setToken(access_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api(error.config);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

### Step 7: Create Protected Route Wrapper
```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage in router:
// <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

### Step 8: Verify the Auth Flow
```bash
npm run dev
# 1. Navigate to /login
# 2. Enter credentials and submit
# 3. Verify redirect to /dashboard
# 4. Verify protected routes redirect to /login when not authenticated
# 5. Verify token is in localStorage
# 6. Verify API calls include Authorization header (check Network tab)
```

## Resources
- `references/jwt-security.md` - JWT security best practices and common vulnerabilities

## Examples
### Example 1: Add Login to an Existing App
User asks: "Add authentication to our React app with a login page"
Response approach:
1. Create backend auth endpoints (login, refresh, me)
2. Create useAuthStore with Zustand
3. Set up Axios interceptors for token management
4. Create LoginPage component with form
5. Wrap routes in ProtectedRoute
6. Test the full flow end-to-end

### Example 2: Fix Token Expiry Issues
User asks: "Users keep getting logged out, how do I add token refresh?"
Response approach:
1. Add refresh token endpoint to backend
2. Store refresh token in localStorage alongside access token
3. Add 401 interceptor that tries refresh before logging out
4. Set retry flag to prevent infinite refresh loops
5. Test by setting short access token expiry and verifying refresh works

## Notes
- Never store tokens in cookies without httpOnly + secure + sameSite flags
- Set a reasonable access token expiry (1 hour) and longer refresh token (7 days)
- Always validate token type ("access" vs "refresh") server-side
- Use environment variables for JWT_SECRET, never hardcode
- Implement rate limiting on login endpoints to prevent brute force
- Clear all stored tokens on logout
