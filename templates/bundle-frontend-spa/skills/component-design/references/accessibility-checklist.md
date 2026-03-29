# Accessibility Checklist

## Interactive Elements
- [ ] All buttons have visible text or `aria-label`
- [ ] Icon-only buttons have `aria-label` describing the action
- [ ] Links have descriptive text (not "click here")
- [ ] Focus states are visible (outline or ring)
- [ ] Tab order follows visual layout

## Forms
- [ ] Every input has a `<label>` with matching `htmlFor`/`id`
- [ ] Required fields are marked with `aria-required="true"`
- [ ] Error messages are linked with `aria-describedby`
- [ ] Form validation errors are announced to screen readers

## Modals/Dialogs
- [ ] Uses `role="dialog"` and `aria-modal="true"`
- [ ] Focus is trapped inside the dialog
- [ ] Escape key closes the dialog
- [ ] Focus returns to trigger element on close

## Loading States
- [ ] Loading spinners have `aria-busy="true"` on container
- [ ] Loading announcements use `aria-live="polite"`

## Images
- [ ] Decorative images have `alt=""`
- [ ] Informative images have descriptive `alt` text

## Color
- [ ] Text contrast ratio is at least 4.5:1 (normal text)
- [ ] Information is not conveyed by color alone
- [ ] Focus indicators have 3:1 contrast ratio

## Testing
```bash
# Run axe accessibility audit
npx @axe-core/cli http://localhost:5173

# Or in browser: install axe DevTools extension
```
