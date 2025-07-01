import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AtelierLoader from './AtelierLoader.svelte';

describe('AtelierLoader', () => {
	it('renders with default props', () => {
		const { container, getByRole } = render(AtelierLoader);

		const loader = getByRole('status');
		expect(loader).toBeInTheDocument();
		expect(loader).toHaveAttribute('aria-label', 'Loading...');
		expect(container).toBeTruthy();
	});

	it('renders spinner variant', () => {
		const { container } = render(AtelierLoader, {
			props: { variant: 'spinner' }
		});

		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveClass('animate-spin');
	});

	it('renders dots variant', () => {
		const { container } = render(AtelierLoader, {
			props: { variant: 'dots' }
		});

		const dots = container.querySelectorAll('.animate-bounce');
		expect(dots).toHaveLength(3);
	});

	it('renders pulse variant', () => {
		const { container } = render(AtelierLoader, {
			props: { variant: 'pulse' }
		});

		const pulse = container.querySelector('.animate-ping');
		expect(pulse).toBeInTheDocument();
	});

	it('renders shimmer variant', () => {
		const { container } = render(AtelierLoader, {
			props: { variant: 'shimmer' }
		});

		const shimmer = container.querySelector('.animate-shimmer');
		expect(shimmer).toBeInTheDocument();
	});

	it('applies size classes correctly', () => {
		const { container, rerender } = render(AtelierLoader, {
			props: { size: 'sm' }
		});

		let svg = container.querySelector('svg');
		expect(svg).toHaveClass('w-4', 'h-4');

		rerender({ size: 'lg' });
		svg = container.querySelector('svg');
		expect(svg).toHaveClass('w-12', 'h-12');
	});

	it('accepts custom label', () => {
		const { getByRole } = render(AtelierLoader, {
			props: { label: 'Please wait...' }
		});

		const loader = getByRole('status');
		expect(loader).toHaveAttribute('aria-label', 'Please wait...');
	});

	it('applies custom className', () => {
		const { getByRole } = render(AtelierLoader, {
			props: { class: 'custom-loader' }
		});

		const loader = getByRole('status');
		expect(loader).toHaveClass('custom-loader');
	});

	it('includes screen reader text', () => {
		const { getByText } = render(AtelierLoader, {
			props: { label: 'Custom loading' }
		});

		const srText = getByText('Custom loading');
		expect(srText).toHaveClass('sr-only');
	});
});
