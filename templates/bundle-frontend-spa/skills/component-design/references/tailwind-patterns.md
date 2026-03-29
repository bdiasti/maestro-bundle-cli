# Tailwind CSS Common Patterns

## Flexbox Layouts
```html
<!-- Center content -->
<div class="flex items-center justify-center">

<!-- Space between items -->
<div class="flex items-center justify-between">

<!-- Stack vertically with gap -->
<div class="flex flex-col gap-4">

<!-- Inline items with wrap -->
<div class="flex flex-wrap gap-2">
```

## Grid Layouts
```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- Sidebar + main -->
<div class="grid grid-cols-[250px_1fr]">

<!-- Auto-fill responsive -->
<div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
```

## Common Component Patterns
```html
<!-- Card -->
<div class="rounded-lg border bg-white shadow-sm p-4">

<!-- Badge -->
<span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">

<!-- Input -->
<input class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

<!-- Overlay/Modal backdrop -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center">
```

## Animations
```html
<!-- Pulse (loading skeleton) -->
<div class="animate-pulse bg-gray-200 rounded h-4 w-3/4">

<!-- Spin (loading spinner) -->
<div class="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full">

<!-- Fade in -->
<div class="animate-in fade-in duration-200">
```

## Responsive Breakpoints
| Prefix | Min-width | Target |
|---|---|---|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Landscape mobile |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Wide desktop |
| `2xl:` | 1536px | Ultra-wide |
