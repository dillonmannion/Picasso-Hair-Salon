# Component Dependencies

## Dependency Tree

### Zero Dependencies (Leaf Components)

These components can be migrated first as they don't depend on other Atelier components:

#### Core Components

- `AtelierBadge.svelte` ✓
- `AtelierButton.svelte` ✓
- `AtelierCard.svelte` ✓
- `AtelierTooltip.svelte` ✓

#### Form Components (Base)

- `form/AtelierInput.svelte` ✓
- `form/AtelierSelect.svelte` ✓
- `form/AtelierTextarea.svelte` ✓

#### Feedback Components

- `feedback/AtelierLoader.svelte` ✓
- `feedback/AtelierSkeleton.svelte` ✓

#### Utility Components

- `utility/OptimizedImage.svelte` ✓
- `utility/ScrollToTop.svelte` ✓

#### Interactive Components

- `interactive/AtelierAccordion.svelte` ✓
- `interactive/AtelierTabs.svelte` ✓
- `interactive/ImageOverlay.svelte` ✓
- `interactive/TextHoverHighlight.svelte` ✓

#### Navigation

- `navigation/AtelierHeader.svelte` ✓

#### Content Components

- `content/ServiceGrid.svelte` ✓
- `content/MasonryGallery.svelte` ✓

### First Level Dependencies

#### Depends on AtelierButton

- `content/HeroSection.svelte` → `AtelierButton.svelte`
- `interactive/AtelierSidebar.svelte` → `AtelierButton.svelte`
- `interactive/AtelierDataTable.svelte` → `AtelierButton.svelte`
- `feedback/AtelierNotification.svelte` → `AtelierButton.svelte`

#### Depends on Validation Utils

- `forms/AtelierInput.svelte` → `utils/validation.ts`
- `forms/AtelierSelect.svelte` → `utils/validation.ts`
- `forms/AtelierTextarea.svelte` → `utils/validation.ts`

#### Depends on Stores

- `AtelierModal.svelte` → `stores/atelierModal.ts`
- `AtelierThemeProvider.svelte` → `stores/atelierTheme.ts`
- `feedback/AtelierNotification.svelte` → `stores/atelierNotifications.ts`

### Second Level Dependencies

#### Depends on Feedback Components

- `utils/AtelierAsyncWrapper.svelte` → `feedback/AtelierLoader.svelte`
- `utils/AtelierLoadingStates.svelte` → `feedback/AtelierSkeleton.svelte`
- `utils/AtelierPageTransition.svelte` → `feedback/AtelierLoader.svelte`, `utils/transitions.ts`

## Migration Order

### Phase 1: Utilities & Stores

1. `utils/validation.ts`
2. `utils/transitions.ts`
3. `stores/atelierModal.ts`
4. `stores/atelierTheme.ts`
5. `stores/atelierNotifications.ts`

### Phase 2: Leaf Components

Migration order within leaf components (prioritize by error count):

1. `AtelierButton.svelte` (foundation for many components)
2. `AtelierBadge.svelte`
3. `feedback/AtelierLoader.svelte`
4. `utility/ScrollToTop.svelte`
5. `utility/OptimizedImage.svelte`
6. `AtelierCard.svelte`
7. `AtelierTooltip.svelte`
8. `form/AtelierInput.svelte`
9. `form/AtelierTextarea.svelte`
10. `form/AtelierSelect.svelte`
11. `feedback/AtelierSkeleton.svelte`
12. `interactive/AtelierAccordion.svelte`
13. `interactive/AtelierTabs.svelte`
14. `interactive/ImageOverlay.svelte`
15. `interactive/TextHoverHighlight.svelte`
16. `navigation/AtelierHeader.svelte`
17. `content/ServiceGrid.svelte`
18. `content/MasonryGallery.svelte`

### Phase 3: First Level Dependencies

19. `forms/AtelierInput.svelte` (enhanced version)
20. `forms/AtelierSelect.svelte` (enhanced version)
21. `forms/AtelierTextarea.svelte` (enhanced version)
22. `content/HeroSection.svelte`
23. `interactive/AtelierSidebar.svelte`
24. `interactive/AtelierDataTable.svelte`
25. `AtelierModal.svelte`
26. `AtelierThemeProvider.svelte`
27. `feedback/AtelierNotification.svelte`

### Phase 4: Second Level Dependencies

28. `utils/AtelierAsyncWrapper.svelte`
29. `utils/AtelierLoadingStates.svelte`
30. `utils/AtelierPageTransition.svelte`

## Notes

- Components marked with ✓ have no Atelier dependencies
- Migration should follow dependency order to avoid breaking functionality
- Stores and utilities should be migrated first as they're used throughout
- Test each component after migration before proceeding to dependents
