# Tailwind Breakpoint Guide

## Breakpoints
| Prefix | Min-width | Device Target |
|---|---|---|
| (none) | 0px | Mobile phones (portrait) |
| `sm:` | 640px | Mobile phones (landscape) |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops / small desktops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large monitors |

## Mobile-First Pattern
```html
<!-- Start with mobile, add overrides -->
<div class="
  grid grid-cols-1    /* mobile: 1 column */
  sm:grid-cols-2      /* 640px+: 2 columns */
  lg:grid-cols-4      /* 1024px+: 4 columns */
  gap-4
">
```

## Common Responsive Patterns

### Sidebar Layout
```html
<!-- Hidden on mobile, visible on desktop -->
<aside class="hidden lg:block w-64">

<!-- Full-width on mobile, fixed width on desktop -->
<aside class="fixed lg:static w-64 -translate-x-full lg:translate-x-0">
```

### Content Padding
```html
<main class="p-4 md:p-6 lg:p-8">
```

### Text Sizing
```html
<h1 class="text-xl md:text-2xl lg:text-3xl">
```

### Show/Hide Elements
```html
<!-- Mobile only -->
<button class="lg:hidden">Menu</button>

<!-- Desktop only -->
<nav class="hidden lg:flex">
```

### Container
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

## Testing Responsive Design
1. Browser DevTools device toolbar (Ctrl+Shift+M)
2. Drag browser edge to resize manually
3. Test at exact breakpoints: 639px, 640px, 767px, 768px, 1023px, 1024px
4. Test with actual mobile devices if possible
