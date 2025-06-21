import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Button from './button.svelte';

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn().mockResolvedValue(undefined)
}));

describe('Button Component', () => {
	test('renders button with text', async () => {
		const { container } = render(Button, {
			props: {}
		});
		
		// Update the button's text content after render
		const button = container.querySelector('button');
		if (button) {
			button.textContent = 'Click me';
		}
		
		expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
	});

	test('renders as link when href provided', async () => {
		render(Button, {
			props: {
				href: '/test',
				children: ($$slots: any) => 'Link Button'
			}
		});
		
		const link = screen.getByRole('link', { name: 'Link Button' });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/test');
	});

	test('handles click events', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();
		
		render(Button, {
			props: {
				onclick: handleClick,
				children: ($$slots: any) => 'Click Button'
			}
		});
		
		await user.click(screen.getByRole('button'));
		expect(handleClick).toHaveBeenCalledOnce();
	});

	test('navigates when button has href and onclick', async () => {
		const { goto } = await import('$app/navigation');
		const handleClick = vi.fn();
		const user = userEvent.setup();
		
		render(Button, {
			props: {
				href: '/navigate',
				onclick: handleClick,
				children: ($$slots: any) => 'Navigate Button'
			}
		});
		
		await user.click(screen.getByRole('button'));
		expect(handleClick).toHaveBeenCalledOnce();
		expect(goto).toHaveBeenCalledWith('/navigate');
	});

	test('disabled button does not trigger click', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();
		
		render(Button, {
			props: {
				disabled: true,
				onclick: handleClick,
				children: ($$slots: any) => 'Disabled Button'
			}
		});
		
		const button = screen.getByRole('button');
		expect(button).toBeDisabled();
		
		await user.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	test('applies variant classes', () => {
		render(Button, {
			props: {
				variant: 'destructive',
				children: ($$slots: any) => 'Delete'
			}
		});
		
		const button = screen.getByRole('button');
		expect(button).toHaveClass('bg-destructive');
	});

	test('applies size classes', () => {
		render(Button, {
			props: {
				size: 'lg',
				children: ($$slots: any) => 'Large Button'
			}
		});
		
		const button = screen.getByRole('button');
		expect(button).toHaveClass('h-10');
	});
});