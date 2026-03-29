---
name: responsive-layout
description: Create responsive layouts with Tailwind CSS including sidebar navigation, dashboard grids, and mobile-first design. Use when you need to build page layouts, dashboards, responsive grids, or navigation structures.
version: 1.0.0
author: Maestro
---

# Responsive Layout

Build mobile-first responsive layouts using Tailwind CSS with sidebar navigation, dashboard grids, and adaptive content areas.

## When to Use
- User needs to create a page layout with sidebar and header
- User wants to build a responsive dashboard with metric cards
- User needs a mobile-first grid that adapts to screen sizes
- User wants to add responsive navigation (sidebar + mobile menu)
- User needs to structure a page with proper spacing and overflow handling

## Available Operations
1. Create a full app layout (sidebar + header + main content)
2. Build responsive dashboard grids with metric cards
3. Implement collapsible sidebar with mobile drawer
4. Set up responsive content grids
5. Add proper scroll areas and overflow handling

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
npm install clsx tailwind-merge lucide-react
```

Verify Tailwind is configured:
```bash
npx tailwindcss --help
# If not installed: npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
```

### Step 2: Create the App Shell Layout
```tsx
// src/layouts/AppLayout.tsx
import { useAppStore } from '@/stores/useAppStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Step 3: Build the Sidebar
```tsx
// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { Home, List, Users, Settings, X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/items', label: 'Items', icon: List },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open }: { open: boolean }) {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">App Name</h1>
          <button onClick={toggleSidebar} className="lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                  isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
```

### Step 4: Build a Dashboard Grid
```tsx
// src/pages/Dashboard.tsx
import { Activity, Users, Shield, CheckCircle } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Metric cards: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Items" value={12} icon={<Activity className="w-5 h-5" />} />
        <MetricCard title="Team Members" value={8} icon={<Users className="w-5 h-5" />} />
        <MetricCard title="Compliance" value="94%" icon={<Shield className="w-5 h-5" />} />
        <MetricCard title="Tasks Today" value={47} icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      {/* Two-column layout: 2/3 + 1/3 on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <RecentItemsList />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{title}</span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
```

### Step 5: Verify Responsive Behavior
```bash
npm run dev
# Open http://localhost:5173

# Test responsive breakpoints:
# 1. Resize browser window through breakpoints (640px, 768px, 1024px, 1280px)
# 2. Use browser DevTools device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
# 3. Check sidebar collapses on mobile and shows overlay
# 4. Check grid columns adjust at each breakpoint
```

## Resources
- `references/breakpoint-guide.md` - Tailwind breakpoints and responsive patterns

## Examples
### Example 1: Create a Dashboard Layout
User asks: "Build a dashboard page with stats cards and an activity feed"
Response approach:
1. Create AppLayout with sidebar and header
2. Build MetricCard component for stats
3. Use responsive grid: 1->2->4 columns
4. Add two-column section for feed + sidebar content
5. Test at all breakpoints with `npm run dev`

### Example 2: Add Mobile Navigation
User asks: "Make the sidebar work on mobile devices"
Response approach:
1. Make sidebar fixed/absolute on mobile with transform transition
2. Add overlay backdrop that closes sidebar on tap
3. Add hamburger menu button in Header (visible only on mobile: `lg:hidden`)
4. Connect to Zustand toggleSidebar action
5. Test on mobile viewport in DevTools

## Notes
- Always design mobile-first: write base styles for mobile, then add `sm:`, `md:`, `lg:` overrides
- Use `overflow-hidden` on the app shell and `overflow-y-auto` on scrollable content areas
- Use `fixed` positioning for mobile sidebar/drawer, `static` for desktop
- Add `transition-transform` for smooth sidebar open/close animations
- Test at every Tailwind breakpoint: 640px, 768px, 1024px, 1280px
