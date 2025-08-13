# Atelier Luxe Theme Implementation Plan

## Executive Summary
This document outlines the comprehensive plan to transform the Picasso Hair Salon website by applying the Atelier Luxe theme (burgundy, cream, and black) across all pages and components. The showcase page will become the new homepage, and the entire site will be styled consistently with the luxe aesthetic.

## Current State Analysis

### Existing Theme Implementation
- **Location**: `/src/lib/styles/atelier.css` and `/src/routes/showcase/`
- **Color Palette**:
  - **Cream**: #fdfcfa → #dcc8a8 (various shades)
  - **Burgundy**: #fdf6f6 → #2a0b0b (light to dark)
  - **Black**: #f8f8f8 → #000000 (grays to pure black)
- **Typography**: Cormorant Garamond serif font for headings
- **Components**: Custom showcase components with polaroid effects, elegant buttons, and refined navigation

### Current Site Structure
```
src/routes/
├── +page.svelte (current homepage - to be replaced)
├── +layout.svelte (main layout)
├── showcase/
│   ├── +page.svelte (to become new homepage)
│   └── +layout.svelte (showcase-specific layout)
├── services/
├── booking/ (multi-step workflow)
│   ├── service/
│   ├── stylist/
│   ├── schedule/
│   ├── confirm/
│   ├── payment/
│   └── success/
├── profile/
├── admin/
│   ├── appointments/
│   ├── services/
│   ├── stylists/
│   └── gallery/
└── auth/
```

## Implementation Strategy

### Phase 1: Core Infrastructure Setup
1. **Create Global Theme System**
   - Extend Tailwind CSS v4 configuration with Luxe color variables
   - Implement CSS custom properties for dynamic theming
   - Create theme context for site-wide state management

2. **Establish Layout Hierarchy**
   - Modify root `+layout.svelte` to support theme switching
   - Create themed layout wrapper component
   - Implement layout breakouts for specific sections

### Phase 2: Homepage Transformation
1. **Replace Current Homepage**
   - Move showcase page to root route (`/`)
   - Archive current homepage as backup
   - Update navigation links throughout site

2. **Enhance Showcase Components**
   - Convert showcase components to be theme-aware
   - Remove theme toggle (make Luxe the default)
   - Optimize for performance and accessibility

### Phase 3: Component Library Migration
1. **Create Luxe Component Set**
   - **Buttons**: Primary, secondary, outline variants with burgundy/cream styling
   - **Cards**: Cream backgrounds with burgundy accents
   - **Forms**: Elegant input fields with cream backgrounds
   - **Navigation**: Sophisticated header with burgundy highlights
   - **Modals**: Overlay components with luxe styling

2. **Replace Existing UI Components**
   - Map current bits-ui components to luxe equivalents
   - Maintain functionality while updating aesthetics
   - Ensure consistent spacing and typography

### Phase 4: Section-by-Section Styling

#### Services Pages
- Service cards with polaroid-style image frames
- Burgundy price highlights
- Cream background sections
- Elegant service descriptions with serif typography

#### Booking Workflow
- Progress stepper with burgundy active states
- Cream form backgrounds
- Black text for clarity
- Burgundy CTA buttons
- Sophisticated calendar styling

#### Profile Pages
- User dashboard with cream panels
- Appointment history with burgundy accents
- Profile settings with elegant form styling
- Review section with star ratings in burgundy

#### Admin Dashboard
- Sidebar navigation with burgundy active states
- Data tables with cream headers
- Action buttons in burgundy
- Charts with burgundy/cream color scheme
- Status badges with theme colors

### Phase 5: Advanced Features
1. **Animations and Transitions**
   - Subtle hover effects on interactive elements
   - Smooth page transitions
   - Polaroid rotation effects on images
   - Fade-in animations for content sections

2. **Responsive Design**
   - Mobile-first approach
   - Breakpoint-specific component adjustments
   - Touch-friendly interface elements
   - Optimized mobile navigation

## Technical Implementation Details

### CSS Architecture
```css
/* Global theme variables */
:root {
  --luxe-cream-primary: #f3ede2;
  --luxe-burgundy-primary: #7d2525;
  --luxe-black-primary: #1a1a1a;
  --luxe-shadow: 0 12px 24px rgba(94, 28, 28, 0.15);
}

/* Component-specific classes */
.luxe-btn { /* Button styling */ }
.luxe-card { /* Card styling */ }
.luxe-input { /* Form input styling */ }
```

### Component Structure
```svelte
<!-- Example Luxe Button Component -->
<script>
  let { variant = 'primary', href, onclick } = $props();
</script>

<button class="luxe-btn luxe-btn-{variant}" {onclick}>
  <slot />
</button>
```

### Route Structure Changes
```
src/routes/
├── +page.svelte (new showcase homepage)
├── +layout.svelte (themed root layout)
├── (app)/ (grouped app routes)
│   ├── services/
│   ├── booking/
│   ├── profile/
│   └── +layout.svelte (app-specific layout)
├── (admin)/ (grouped admin routes)
│   ├── admin/
│   └── +layout.svelte (admin-specific layout)
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Day 1-2: Setup theme infrastructure and global styles
- [ ] Day 3-4: Create base Luxe component library
- [ ] Day 5: Replace homepage with showcase

### Week 2: Core Pages
- [ ] Day 1-2: Style services and gallery pages
- [ ] Day 3-4: Implement booking workflow theming
- [ ] Day 5: Update profile and user pages

### Week 3: Admin & Polish
- [ ] Day 1-2: Theme admin dashboard
- [ ] Day 3: Add animations and transitions
- [ ] Day 4: Mobile optimization
- [ ] Day 5: Testing and bug fixes

## Testing Strategy

### Visual Testing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness testing
- Color contrast accessibility checks
- Animation performance testing

### Functional Testing
- Booking flow end-to-end testing
- Form submission validation
- Navigation consistency
- Admin dashboard functionality

### Performance Testing
- Page load speed optimization
- CSS bundle size monitoring
- Image optimization
- Lazy loading implementation

## Risk Mitigation

### Potential Challenges
1. **Component Migration Complexity**
   - Solution: Create adapter components for gradual migration
   
2. **State Management**
   - Solution: Use SvelteKit's built-in stores for theme state
   
3. **Performance Impact**
   - Solution: Implement CSS purging and code splitting
   
4. **Browser Compatibility**
   - Solution: Use CSS fallbacks and progressive enhancement

## Success Metrics

### Design Consistency
- 100% of pages using Luxe theme
- Consistent typography across all sections
- Unified color palette implementation

### Performance
- Maintain or improve current page load times
- CSS bundle size under 50KB
- 90+ Lighthouse performance score

### User Experience
- Smooth transitions between pages
- Accessible contrast ratios (WCAG AAA)
- Mobile-friendly touch targets

## Documentation Requirements

### Developer Documentation
- Component usage guide
- Theme customization instructions
- CSS class reference
- Migration guide for future updates

### Design System Documentation
- Color palette reference
- Typography scale
- Spacing system
- Component patterns

## Conclusion

This implementation plan provides a structured approach to transforming the Picasso Hair Salon website with the Atelier Luxe theme. By following this phased approach, we ensure a smooth transition while maintaining functionality and improving the overall aesthetic appeal of the site.

## Appendix: Key SvelteKit Concepts

### Layout System
- SvelteKit uses file-based routing with `+layout.svelte` files
- Layouts can be nested and reset using `@` syntax
- Route groups with `(name)` don't affect URLs but allow layout organization

### CSS Scoping
- Styles in Svelte components are scoped by default
- Global styles require `:global()` selector or separate CSS files
- CSS custom properties enable dynamic theming

### Data Loading
- `+page.js` and `+layout.js` handle data fetching
- Data flows from layouts to pages through props
- Server-side rendering ensures fast initial loads

## Next Steps

1. Review and approve this implementation plan
2. Set up development environment with theme branch
3. Begin Phase 1 implementation
4. Schedule regular design reviews
5. Conduct user testing at each phase completion