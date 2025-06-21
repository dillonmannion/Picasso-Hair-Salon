import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Button from './button.svelte';

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

describe('Button Component Basic Tests', () => {
	test('renders a button element', () => {
		const { container } = render(Button, {
			props: {}
		});
		
		const button = container.querySelector('button');
		expect(button).toBeTruthy();
		expect(button?.tagName).toBe('BUTTON');
	});

	test('renders with default type button', () => {
		const { container } = render(Button, {
			props: {}
		});
		
		const button = container.querySelector('button');
		expect(button?.getAttribute('type')).toBe('button');
	});

	test('applies default classes', () => {
		const { container } = render(Button, {
			props: {}
		});
		
		const button = container.querySelector('button');
		expect(button?.className).toContain('bg-primary');
		expect(button?.className).toContain('h-9');
	});

	test('renders as link when href provided', () => {
		const { container } = render(Button, {
			props: {
				href: '/test'
			}
		});
		
		const link = container.querySelector('a');
		expect(link).toBeTruthy();
		expect(link?.getAttribute('href')).toBe('/test');
	});

	test('applies disabled state', () => {
		const { container } = render(Button, {
			props: {
				disabled: true
			}
		});
		
		const button = container.querySelector('button');
		expect(button?.disabled).toBe(true);
	});

	test('applies variant classes', () => {
		const { container } = render(Button, {
			props: {
				variant: 'destructive'
			}
		});
		
		const button = container.querySelector('button');
		expect(button?.className).toContain('bg-destructive');
	});

	test('applies size classes', () => {
		const { container } = render(Button, {
			props: {
				size: 'lg'
			}
		});
		
		const button = container.querySelector('button');
		expect(button?.className).toContain('h-10');
	});

	test('calls onclick handler', async () => {
		const handleClick = vi.fn();
		const { container } = render(Button, {
			props: {
				onclick: handleClick
			}
		});
		
		const button = container.querySelector('button');
		button?.click();
		
		expect(handleClick).toHaveBeenCalled();
	});
});