# Button Testing Guide

This guide provides comprehensive documentation for testing buttons in the Picasso Hair Salon application. The testing framework ensures all buttons work correctly, handle edge cases, and provide excellent accessibility.

## Table of Contents

1. [Overview](#overview)
2. [Testing Utilities](#testing-utilities)
3. [Button Component Tests](#button-component-tests)
4. [Page-Level Button Tests](#page-level-button-tests)
5. [Common Testing Patterns](#common-testing-patterns)
6. [Edge Cases](#edge-cases)
7. [Accessibility Testing](#accessibility-testing)
8. [Best Practices](#best-practices)

## Overview

The button testing framework is built on:
- **Vitest** - Fast unit test framework
- **@testing-library/svelte** - DOM testing utilities
- **@testing-library/user-event** - User interaction simulation
- **Custom test utilities** - Helper functions for common button testing scenarios

## Testing Utilities

The framework provides several utilities in `src/lib/testing/button-test-utils.ts`:

### Enhanced Render Function

```typescript
import { render } from '$lib/testing/button-test-utils';

const { user, ...renderResult } = render(Component, { props: { /* ... */ } });
```

Automatically sets up user event handling for interaction testing.

### Navigation Mocks

```typescript
import { getNavigationMocks } from '$lib/testing/button-test-utils';

const { goto, pushState } = getNavigationMocks();
// Test navigation
expect(goto).toHaveBeenCalledWith('/target-route');
```

### Mock Handlers

```typescript
import { createMockHandler } from '$lib/testing/button-test-utils';

const handleClick = createMockHandler();
// Automatically prevents default behavior
```

### Button State Testing

```typescript
import { expectButtonState } from '$lib/testing/button-test-utils';

await expectButtonState(button, {
  disabled: true,
  ariaDisabled: 'true',
  className: 'opacity-50'
});
```

## Button Component Tests

### Basic Rendering Tests

```typescript
describe('Button Rendering', () => {
  test('renders as button by default', () => {
    render(Button, { props: { children: 'Click me' } });
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  test('renders as link when href provided', () => {
    render(Button, { props: { href: '/test', children: 'Link' } });
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/test');
  });
});
```

### Interaction Tests

```typescript
describe('Click Handling', () => {
  test('calls onclick handler', async () => {
    const handleClick = createMockHandler();
    const { user } = render(Button, {
      props: { onclick: handleClick, children: 'Click' }
    });

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test('prevents onclick when disabled', async () => {
    const handleClick = createMockHandler();
    const { user } = render(Button, {
      props: { onclick: handleClick, disabled: true, children: 'Disabled' }
    });

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Navigation Tests

```typescript
describe('Navigation', () => {
  test('navigates with href and onclick', async () => {
    const { goto } = getNavigationMocks();
    const { user } = render(Button, {
      props: { 
        href: '/services',
        onclick: () => {}, // Custom handler
        children: 'Navigate'
      }
    });

    await user.click(screen.getByRole('button'));
    expect(goto).toHaveBeenCalledWith('/services');
  });
});
```

## Page-Level Button Tests

### Authentication Page Example

```typescript
describe('Login Page', () => {
  test('shows loading state during authentication', async () => {
    const { user } = render(LoginPage, { props: { /* ... */ } });
    const button = screen.getByRole('button', { name: /Continue with Google/i });

    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Signing in.../i })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
```

### CRUD Operations Example

```typescript
describe('Admin Services', () => {
  test('delete button shows confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { user } = render(AdminServicesPage, { props: { /* ... */ } });
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this service?');
  });
});
```

## Common Testing Patterns

### Testing Loading States

```typescript
test('button shows loading state', async () => {
  const { user, rerender } = render(Button, {
    props: { disabled: false, children: 'Submit' }
  });

  const button = screen.getByRole('button');
  
  // Trigger loading
  rerender({ props: { disabled: true, children: 'Loading...' } });
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent('Loading...');

  // Complete loading
  rerender({ props: { disabled: false, children: 'Submit' } });
  expect(button).not.toBeDisabled();
});
```

### Testing Form Submissions

```typescript
test('submits form on button click', async () => {
  const handleSubmit = vi.fn(e => e.preventDefault());
  const { user } = render(Button, {
    props: { type: 'submit', children: 'Submit' }
  });

  const form = document.createElement('form');
  form.addEventListener('submit', handleSubmit);
  form.appendChild(screen.getByRole('button'));

  await user.click(screen.getByRole('button'));
  expect(handleSubmit).toHaveBeenCalled();
});
```

### Testing Keyboard Navigation

```typescript
test('button responds to Enter key', async () => {
  const handleClick = createMockHandler();
  render(Button, { props: { onclick: handleClick, children: 'Press Enter' } });
  
  const button = screen.getByRole('button');
  button.focus();
  
  await userEvent.keyboard('{Enter}');
  expect(handleClick).toHaveBeenCalled();
});
```

## Edge Cases

### Rapid Clicking

```typescript
test('handles rapid clicking', async () => {
  const handleClick = createMockHandler();
  const { user } = render(Button, {
    props: { onclick: handleClick, children: 'Rapid Click' }
  });

  const button = screen.getByRole('button');
  
  // Simulate rapid clicks
  await Promise.all([
    user.click(button),
    user.click(button),
    user.click(button)
  ]);

  // May be called multiple times unless debounced
  expect(handleClick).toHaveBeenCalledTimes(3);
});
```

### Async Operations

```typescript
test('prevents concurrent operations', async () => {
  let isProcessing = false;
  const handleClick = vi.fn(async () => {
    if (isProcessing) return;
    isProcessing = true;
    await new Promise(resolve => setTimeout(resolve, 100));
    isProcessing = false;
  });

  const { user } = render(Button, {
    props: { onclick: handleClick, children: 'Async' }
  });

  const button = screen.getByRole('button');
  await Promise.all([
    user.click(button),
    user.click(button)
  ]);

  // Implementation determines if multiple calls are allowed
  expect(handleClick.mock.calls.length).toBeGreaterThan(0);
});
```

## Accessibility Testing

### ARIA Attributes

```typescript
test('has proper ARIA attributes', () => {
  render(Button, {
    props: {
      'aria-pressed': 'false',
      'aria-label': 'Toggle feature',
      children: 'Toggle'
    }
  });
  
  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(button).toHaveAttribute('aria-label', 'Toggle feature');
});
```

### Focus Management

```typescript
test('maintains focus visibility', async () => {
  const { user } = render(Button, { props: { children: 'Focus Test' } });
  const button = screen.getByRole('button');

  await user.tab();
  expect(button).toHaveFocus();
  expect(button).toHaveClass('focus-visible:ring-ring/50');
});
```

### Screen Reader Compatibility

```typescript
test('announces button state changes', async () => {
  const { rerender } = render(Button, {
    props: { 'aria-live': 'polite', children: 'Status: Ready' }
  });

  rerender({ props: { 'aria-live': 'polite', children: 'Status: Loading' } });
  
  // Screen reader will announce the change
  expect(screen.getByRole('button')).toHaveTextContent('Status: Loading');
});
```

## Best Practices

### 1. Test User Flows, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
test('calls internal method', () => {
  expect(component._handleClick).toHaveBeenCalled();
});

// ✅ Good: Testing user behavior
test('navigates to booking page when clicked', async () => {
  await user.click(screen.getByRole('button', { name: 'Book Now' }));
  expect(goto).toHaveBeenCalledWith('/booking');
});
```

### 2. Use Semantic Queries

```typescript
// ❌ Bad: Using test IDs
const button = screen.getByTestId('submit-button');

// ✅ Good: Using accessible roles and names
const button = screen.getByRole('button', { name: 'Submit Form' });
```

### 3. Test Accessibility First

```typescript
describe('Button', () => {
  // Start with accessibility tests
  test('is keyboard accessible', async () => {
    const button = screen.getByRole('button');
    await user.tab();
    expect(button).toHaveFocus();
  });

  test('has accessible name', () => {
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName();
  });
});
```

### 4. Mock External Dependencies

```typescript
// Mock navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  pushState: vi.fn()
}));

// Mock Supabase
const mockSupabase = createMockSupabaseClient();
```

### 5. Test Error States

```typescript
test('handles errors gracefully', async () => {
  const handleClick = vi.fn().mockRejectedValue(new Error('Network error'));
  const { user } = render(Button, {
    props: { onclick: handleClick, children: 'Submit' }
  });

  await user.click(screen.getByRole('button'));
  
  // Button should remain interactive after error
  expect(screen.getByRole('button')).not.toBeDisabled();
});
```

### 6. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks();
  // Clean up any DOM modifications
  document.body.innerHTML = '';
});
```

## Running Tests

```bash
# Run all tests
pnpm test:unit

# Run tests in watch mode
pnpm test:unit:ui

# Run tests with coverage
pnpm test:unit:coverage

# Run specific test file
pnpm test:unit src/lib/components/ui/button/button.test.ts
```

## Debugging Tests

1. **Use debug utilities**:
   ```typescript
   import { screen, debug } from '@testing-library/svelte';
   
   // Print current DOM
   debug();
   
   // Print specific element
   debug(screen.getByRole('button'));
   ```

2. **Check for async issues**:
   ```typescript
   // Wait for elements to appear
   await waitFor(() => {
     expect(screen.getByRole('button')).toBeInTheDocument();
   });
   ```

3. **Verify mock calls**:
   ```typescript
   console.log('Mock calls:', mockHandler.mock.calls);
   console.log('Mock results:', mockHandler.mock.results);
   ```

## Conclusion

This testing framework ensures that all buttons in the Picasso Hair Salon app:
- Function correctly across different scenarios
- Handle edge cases gracefully
- Provide excellent accessibility
- Maintain consistent behavior

By following these patterns and best practices, you can ensure a robust and user-friendly application.