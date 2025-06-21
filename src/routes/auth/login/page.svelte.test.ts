import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import LoginPage from './+page.svelte';

// Mock SvelteKit forms
vi.mock('$app/forms', () => ({
	enhance: vi.fn(() => {
		return (node: HTMLFormElement) => {
			const handleSubmit = async (event: Event) => {
				event.preventDefault();
				const form = event.target as HTMLFormElement;
				const enhanceFunc = (form as any).__enhance;
				if (enhanceFunc) {
					await enhanceFunc();
				}
			};
			node.addEventListener('submit', handleSubmit);
			// Store the enhance function on the form element for testing
			(node as any).__enhance = arguments[0];
			return {
				destroy() {
					node.removeEventListener('submit', handleSubmit);
				}
			};
		};
	})
}));

describe('Login Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset window location search
		delete (window as any).location;
		(window as any).location = { search: '' };
	});

	test('renders login page with Google sign-in button', () => {
		render(LoginPage, {
			props: {
				data: { supabase: {} },
				form: null
			}
		});

		expect(screen.getByText('Welcome to Picasso Hair Salon')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
	});

	test('displays form error when provided', () => {
		render(LoginPage, {
			props: {
				data: { supabase: {} },
				form: { error: 'Authentication failed' }
			}
		});

		expect(screen.getByText('Authentication failed')).toBeInTheDocument();
	});

	test('button is enabled by default', () => {
		render(LoginPage, {
			props: {
				data: { supabase: {} },
				form: null
			}
		});

		const button = screen.getByRole('button', { name: /Continue with Google/i });
		expect(button).not.toBeDisabled();
		expect(button).toHaveAttribute('type', 'submit');
	});

	test('form has correct action', () => {
		render(LoginPage, {
			props: {
				data: { supabase: {} },
				form: null
			}
		});

		const form = screen.getByRole('button', { name: /Continue with Google/i }).closest('form');
		expect(form).toHaveAttribute('action', '?/google');
		expect(form).toHaveAttribute('method', 'POST');
	});

	test('handles form submission', async () => {
		const user = userEvent.setup();
		const { container } = render(LoginPage, {
			props: {
				data: { supabase: {} },
				form: null
			}
		});

		const button = screen.getByRole('button', { name: /Continue with Google/i });
		const form = button.closest('form')!;

		let formSubmitted = false;
		(form as any).__enhance = async () => {
			formSubmitted = true;
			return { update: vi.fn() };
		};

		await user.click(button);
		expect(formSubmitted).toBe(true);
	});
});