# Component Quality Checklist

## Before Shipping a Component
- [ ] Props are typed with a TypeScript interface (not `any`)
- [ ] Component has a single, clear responsibility
- [ ] Loading, error, and empty states are handled
- [ ] Accessible: has aria-labels, keyboard navigation where needed
- [ ] No business logic in presenter components
- [ ] Uses composition (children/slots) over boolean prop flags
- [ ] All event handlers are properly typed
- [ ] No inline styles -- uses Tailwind classes or CSS modules

## Performance
- [ ] Lists use unique `key` props (not array index)
- [ ] Heavy computations wrapped in `useMemo`
- [ ] Callbacks passed to children wrapped in `useCallback` when needed
- [ ] Large components are code-split with `React.lazy()`

## Testing
- [ ] Presenter components have unit tests with React Testing Library
- [ ] Custom hooks have tests using `renderHook`
- [ ] Edge cases tested: empty data, error states, loading states
