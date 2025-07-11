import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Button from '$lib/components/Button.svelte';
import { createMockButtonProps } from '$lib/test-utils/factories';
import { ButtonPropsSchema } from '$lib/schemas';

describe('Button component behavior', () => {
  it('should render with default props', () => {
    render(Button);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary', 'btn-medium');
    expect(button).not.toBeDisabled();
  });

  it('should apply variant and size classes', () => {
    const props = createMockButtonProps({
      variant: 'danger',
      size: 'large',
    });

    render(Button, props);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-danger', 'btn-large');
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    const props = createMockButtonProps({ onclick });

    render(Button, props);
    const button = screen.getByRole('button');

    await user.click(button);

    expect(onclick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    const props = createMockButtonProps({ disabled: true });

    render(Button, props);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not fire click events when disabled', async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    const props = createMockButtonProps({
      disabled: true,
      onclick,
    });

    render(Button, props);
    const button = screen.getByRole('button');

    await user.click(button);

    expect(onclick).not.toHaveBeenCalled();
  });

  it('should apply custom CSS classes', () => {
    const props = createMockButtonProps({
      class: 'custom-class another-class',
    });

    render(Button, props);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class', 'another-class');
  });

  it('should render slot content', async () => {
    const ButtonWithSlot = await import('./ButtonWithSlot.svelte');

    render(ButtonWithSlot.default, {
      props: { buttonProps: createMockButtonProps() },
    });

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me!');
  });

  it('should validate props with schema at runtime', () => {
    const props = {
      variant: 'primary',
      size: 'medium',
    };

    const result = ButtonPropsSchema.safeParse(props);
    expect(result.success).toBe(true);
  });

  it('should accept all valid button HTML attributes through passthrough', () => {
    const props = createMockButtonProps({
      type: 'submit',
      name: 'submitBtn',
      form: 'myForm',
    });

    render(Button, props);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'submitBtn');
    expect(button).toHaveAttribute('form', 'myForm');
  });
});
