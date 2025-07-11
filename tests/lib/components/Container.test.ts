import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Container from '$lib/components/Container.svelte';
import TestWrapper from './TestWrapper.svelte';

describe('Container', () => {
  it('should render children content', () => {
    const { getByText } = render(TestWrapper, {
      props: {
        component: Container,
        content: 'Test content'
      }
    });

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('should apply default max-width and padding classes', () => {
    const { container } = render(Container);
    const containerDiv = container.firstElementChild;

    expect(containerDiv).toHaveClass('mx-auto');
    expect(containerDiv).toHaveClass('px-4');
    expect(containerDiv).toHaveClass('sm:px-6');
    expect(containerDiv).toHaveClass('lg:px-8');
    expect(containerDiv).toHaveClass('max-w-7xl');
  });

  it('should apply full size variant classes', () => {
    const { container } = render(Container, {
      props: { size: 'full' }
    });
    const containerDiv = container.firstElementChild;

    expect(containerDiv).toHaveClass('max-w-[1600px]');
    expect(containerDiv).not.toHaveClass('max-w-7xl');
    expect(containerDiv).not.toHaveClass('max-w-4xl');
  });

  it('should apply narrow size variant classes', () => {
    const { container } = render(Container, {
      props: { size: 'narrow' }
    });
    const containerDiv = container.firstElementChild;

    expect(containerDiv).toHaveClass('max-w-4xl');
    expect(containerDiv).not.toHaveClass('max-w-7xl');
    expect(containerDiv).not.toHaveClass('max-w-[1600px]');
  });

  it('should apply custom CSS classes', () => {
    const { container } = render(Container, {
      props: { class: 'mt-8 mb-4' }
    });
    const containerDiv = container.firstElementChild;

    expect(containerDiv).toHaveClass('mt-8');
    expect(containerDiv).toHaveClass('mb-4');
  });

  it('should maintain responsive padding with all size variants', () => {
    const sizes = ['full', 'default', 'narrow'] as const;
    
    sizes.forEach(size => {
      const { container } = render(Container, {
        props: { size }
      });
      const containerDiv = container.firstElementChild;

      expect(containerDiv).toHaveClass('px-4');
      expect(containerDiv).toHaveClass('sm:px-6');
      expect(containerDiv).toHaveClass('lg:px-8');
    });
  });

  it('should pass through HTML attributes', () => {
    const { container } = render(Container, {
      props: { 
        id: 'main-container',
        'data-testid': 'container'
      }
    });
    const containerDiv = container.firstElementChild;

    expect(containerDiv).toHaveAttribute('id', 'main-container');
    expect(containerDiv).toHaveAttribute('data-testid', 'container');
  });
});