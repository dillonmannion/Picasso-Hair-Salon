import { vi, expect, type Mock } from 'vitest';
import { render as baseRender, type RenderResult } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { goto, pushState } from '$app/navigation';
import type { ComponentProps, ComponentType, SvelteComponent } from 'svelte';

// Mock navigation functions
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn()
}));

// Helper to get mocked navigation functions
export const getNavigationMocks = () => ({
	goto: goto as Mock,
	pushState: pushState as Mock
});

// Enhanced render function with user event setup
export function render<T extends SvelteComponent>(
	Component: ComponentType<T>,
	options?: ComponentProps<T>
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
	const user = userEvent.setup();
	const result = baseRender(Component, options);
	return Object.assign(result, { user });
}

// Helper to create mock event handlers with proper typing
export function createMockHandler() {
	return vi.fn((event?: Event) => {
		// Prevent default to avoid navigation in tests
		event?.preventDefault?.();
	});
}

// Helper to wait for async operations
export async function waitForLoadingToFinish(getByRole: RenderResult['getByRole'], timeout = 3000) {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		try {
			// Check if any loading indicators are present
			getByRole('progressbar');
			await new Promise((resolve) => setTimeout(resolve, 50));
		} catch {
			// No loading indicators found, we're done
			break;
		}
	}
}

// Helper to test button states
export function expectButtonState(
	button: HTMLElement,
	state: {
		disabled?: boolean;
		ariaDisabled?: string;
		ariaPressed?: string;
		ariaExpanded?: string;
		ariaChecked?: string;
		className?: string;
	}
) {
	if (state.disabled !== undefined) {
		if (state.disabled) {
			expect(button).toBeDisabled();
		} else {
			expect(button).not.toBeDisabled();
		}
	}

	if (state.ariaDisabled !== undefined) {
		expect(button).toHaveAttribute('aria-disabled', state.ariaDisabled);
	}

	if (state.ariaPressed !== undefined) {
		expect(button).toHaveAttribute('aria-pressed', state.ariaPressed);
	}

	if (state.ariaExpanded !== undefined) {
		expect(button).toHaveAttribute('aria-expanded', state.ariaExpanded);
	}

	if (state.ariaChecked !== undefined) {
		expect(button).toHaveAttribute('aria-checked', state.ariaChecked);
	}

	if (state.className !== undefined) {
		expect(button).toHaveClass(state.className);
	}
}

// Helper to test keyboard interactions
export async function testKeyboardInteraction(
	element: HTMLElement,
	key: 'Enter' | 'Space' | 'Escape' | 'Tab',
	expectedAction: () => void
) {
	element.focus();
	expect(element).toHaveFocus();

	const keyMap = {
		Enter: '{Enter}',
		Space: ' ',
		Escape: '{Escape}',
		Tab: '{Tab}'
	};

	await userEvent.keyboard(keyMap[key]);
	expectedAction();
}

// Helper to test button with loading state
export async function testButtonLoadingState(
	button: HTMLElement,
	clickAction: () => Promise<void>,
	options?: {
		loadingText?: string;
		loadingClass?: string;
		disabledDuringLoading?: boolean;
	}
) {
	const originalText = button.textContent;

	// Start the async action
	const actionPromise = clickAction();

	// Check loading state
	if (options?.loadingText) {
		expect(button).toHaveTextContent(options.loadingText);
	}

	if (options?.loadingClass) {
		expect(button).toHaveClass(options.loadingClass);
	}

	if (options?.disabledDuringLoading) {
		expect(button).toBeDisabled();
	}

	// Wait for action to complete
	await actionPromise;

	// Check restored state
	if (originalText && options?.loadingText) {
		expect(button).toHaveTextContent(originalText);
	}

	if (options?.disabledDuringLoading) {
		expect(button).not.toBeDisabled();
	}
}

// Helper to test navigation buttons
export async function testNavigationButton(
	button: HTMLElement,
	expectedRoute: string,
	user: ReturnType<typeof userEvent.setup>
) {
	const { goto } = getNavigationMocks();
	goto.mockClear();

	await user.click(button);

	expect(goto).toHaveBeenCalledWith(expectedRoute);
	expect(goto).toHaveBeenCalledTimes(1);
}

// Helper to test form submission buttons
export async function testFormSubmitButton(
	button: HTMLElement,
	form: HTMLFormElement,
	user: ReturnType<typeof userEvent.setup>
) {
	const submitHandler = vi.fn((e: Event) => e.preventDefault());
	form.addEventListener('submit', submitHandler);

	await user.click(button);

	expect(submitHandler).toHaveBeenCalled();

	form.removeEventListener('submit', submitHandler);
}

// Helper for testing button variants
export const buttonVariants = {
	default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
	destructive: 'bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20',
	outline: 'bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
	secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
	ghost: 'hover:bg-accent hover:text-accent-foreground',
	link: 'text-primary underline-offset-4 hover:underline'
};

// Helper for testing button sizes
export const buttonSizes = {
	default: 'h-9 px-4 py-2',
	sm: 'h-8 gap-1.5 rounded-md px-3',
	lg: 'h-10 rounded-md px-6',
	icon: 'size-9'
};

// Mock Supabase client for auth tests
export function createMockSupabaseClient() {
	return {
		auth: {
			signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
			signOut: vi.fn().mockResolvedValue({ error: null }),
			getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
		}
	};
}
