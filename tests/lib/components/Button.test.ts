import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Button from '$lib/components/Button.svelte';

describe('Button', () => {
  it('should render with primary variant styling by default', () => {
    render(Button);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
    expect(button).toHaveClass('hover:bg-primary-hover');
  });

  it('should apply outline variant styling when specified', () => {
    render(Button, { props: { variant: 'outline' } });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-input');
    expect(button).toHaveClass('bg-background');
    expect(button).toHaveClass('hover:bg-accent');
    expect(button).toHaveClass('hover:text-accent-foreground');
  });

  it('should apply ghost variant styling when specified', () => {
    render(Button, { props: { variant: 'ghost' } });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
    expect(button).toHaveClass('hover:text-accent-foreground');
    expect(button).not.toHaveClass('bg-primary');
    expect(button).not.toHaveClass('border');
  });

  it('should apply small size styling when specified', () => {
    render(Button, { props: { size: 'small' } });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('text-xs');
  });

  it('should apply default size styling by default', () => {
    render(Button);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  it('should apply large size styling when specified', () => {
    render(Button, { props: { size: 'large' } });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('px-8');
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(Button, { props: { onclick: handleClick } });
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should apply transition for hover effects', () => {
    render(Button);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-colors');
  });

  it('should render slot content', async () => {
    const TestButtonWithSlot = await import('./TestButtonWithSlot.svelte');
    render(TestButtonWithSlot.default);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me');
  });

  it('should apply common button styling', () => {
    render(Button);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('inline-flex');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('justify-center');
    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('text-sm');
    expect(button).toHaveClass('font-medium');
    expect(button).toHaveClass('ring-offset-background');
    expect(button).toHaveClass('focus-visible:outline-none');
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-ring');
    expect(button).toHaveClass('focus-visible:ring-offset-2');
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });
});
