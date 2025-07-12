import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Grid from '$lib/components/Grid.svelte';
import GridTestWrapper from './GridTestWrapper.svelte';

describe('Grid', () => {
  it('should render children in a grid layout', () => {
    const { getByTestId } = render(GridTestWrapper);

    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
    expect(getByTestId('child-3')).toBeInTheDocument();
  });

  it('should apply default responsive grid columns', () => {
    const { container } = render(Grid, {
      props: {},
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('should apply custom column configuration', () => {
    const { container } = render(Grid, {
      props: {
        cols: {
          default: 2,
          md: 3,
          lg: 4,
          xl: 5,
        },
      },
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('md:grid-cols-3');
    expect(grid).toHaveClass('lg:grid-cols-4');
    expect(grid).toHaveClass('xl:grid-cols-5');
  });

  it('should apply default gap spacing', () => {
    const { container } = render(Grid, {
      props: {},
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('gap-6');
  });

  it('should apply custom gap spacing', () => {
    const { container } = render(Grid, {
      props: {
        gap: 8,
      },
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('gap-8');
  });

  it('should apply responsive gap spacing', () => {
    const { container } = render(Grid, {
      props: {
        gap: {
          default: 4,
          md: 6,
          lg: 8,
        },
      },
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('gap-4');
    expect(grid).toHaveClass('md:gap-6');
    expect(grid).toHaveClass('lg:gap-8');
  });

  it('should apply custom CSS classes', () => {
    const { container } = render(Grid, {
      props: {
        class: 'custom-grid-class',
      },
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('custom-grid-class');
  });

  it('should handle single column layout', () => {
    const { container } = render(Grid, {
      props: {
        cols: 1,
      },
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).not.toHaveClass('md:grid-cols-2');
    expect(grid).not.toHaveClass('lg:grid-cols-3');
  });

  it('should handle fixed column count across all breakpoints', () => {
    const { container } = render(Grid, {
      props: {
        cols: 4,
      },
    });

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-4');
    expect(grid).not.toHaveClass('md:grid-cols-2');
    expect(grid).not.toHaveClass('lg:grid-cols-3');
  });

  it('should properly distribute multiple children', () => {
    const { container } = render(GridTestWrapper, {
      props: {
        cols: 2,
        gap: 4,
        itemCount: 6,
      },
    });

    const grid = container.querySelector('.grid');
    expect(grid?.children).toHaveLength(6);
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('gap-4');
  });
});