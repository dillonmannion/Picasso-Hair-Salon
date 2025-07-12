import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import OptimizedImage from '$lib/components/OptimizedImage.svelte';

interface MockIntersectionObserver {
  mock: {
    calls: Array<[IntersectionObserverCallback, IntersectionObserverInit?]>;
    results: Array<{ value: IntersectionObserver }>;
  };
}

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
})) as unknown as typeof IntersectionObserver & MockIntersectionObserver;

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

const createMockIntersectionObserverEntry = (
  target: Element,
  isIntersecting: boolean
): IntersectionObserverEntry => ({
  isIntersecting,
  target,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRatio: isIntersecting ? 1 : 0,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: null,
  time: Date.now(),
});

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('implements lazy loading with intersection observer', async () => {
    const { unmount } = render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
      },
    });

    expect(IntersectionObserverMock).toHaveBeenCalledTimes(1);
    expect(IntersectionObserverMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '50px',
      })
    );

    const mockObserverInstance = IntersectionObserverMock.mock.results[0].value;
    expect(mockObserverInstance.observe).toHaveBeenCalledWith(
      expect.any(HTMLElement)
    );

    unmount();
    expect(mockObserverInstance.disconnect).toHaveBeenCalled();
  });

  it('shows loading state with opacity transition', () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
      },
    });

    const container = screen.getByRole('img', { hidden: true }).parentElement;
    expect(container).toHaveClass('opacity-0');
    expect(container).toHaveClass('transition-opacity');
    expect(container).toHaveClass('duration-300');
  });

  it('supports srcset for responsive images', () => {
    const srcset = '/image-320w.jpg 320w, /image-640w.jpg 640w, /image-1280w.jpg 1280w';
    const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
        srcset,
        sizes,
      },
    });

    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveAttribute('srcset', srcset);
    expect(img).toHaveAttribute('sizes', sizes);
  });

  it('handles loading errors gracefully', async () => {
    render(OptimizedImage, {
      props: {
        src: '/invalid-image.jpg',
        alt: 'Invalid image',
      },
    });

    const calls = IntersectionObserverMock.mock.calls;
    if (!calls || calls.length === 0) return;
    const mockCallback = calls[0][0] as IntersectionObserverCallback;
    
    const mockEntry = createMockIntersectionObserverEntry(
      screen.getByRole('img', { hidden: true }),
      true
    );
    mockCallback([mockEntry], IntersectionObserverMock.mock.results[0]?.value);

    const img = screen.getByRole('img', { hidden: true });
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      const container = img.parentElement;
      expect(container).toHaveClass('opacity-100');
    });
  });

  it('transitions to loaded state when image loads successfully', async () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
      },
    });

    const calls = IntersectionObserverMock.mock.calls;
    if (!calls || calls.length === 0) return;
    const mockCallback = calls[0][0] as IntersectionObserverCallback;
    
    const mockEntry = createMockIntersectionObserverEntry(
      screen.getByRole('img', { hidden: true }),
      true
    );
    mockCallback([mockEntry], IntersectionObserverMock.mock.results[0]?.value);

    await waitFor(() => {
      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', '/image.jpg');
    });

    const img = screen.getByRole('img', { hidden: true });
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      const container = img.parentElement;
      expect(container).toHaveClass('opacity-100');
    });
  });

  it('does not load image until intersection observer triggers', () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
      },
    });

    const img = screen.getByRole('img', { hidden: true });
    expect(img).not.toHaveAttribute('src');
  });

  it('loads image when intersection observer detects visibility', async () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
      },
    });

    const calls = IntersectionObserverMock.mock.calls;
    if (!calls || calls.length === 0) return;
    const mockCallback = calls[0][0] as IntersectionObserverCallback;
    
    const mockEntry = createMockIntersectionObserverEntry(
      screen.getByRole('img', { hidden: true }),
      true
    );

    mockCallback([mockEntry], IntersectionObserverMock.mock.results[0]?.value);

    await waitFor(() => {
      const img = screen.getByRole('img', { hidden: true });
      expect(img).toHaveAttribute('src', '/image.jpg');
    });
  });

  it('applies custom CSS classes', () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
        class: 'rounded-lg shadow-xl',
      },
    });

    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveClass('rounded-lg');
    expect(img).toHaveClass('shadow-xl');
  });

  it('supports width and height attributes', () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
        width: 800,
        height: 600,
      },
    });

    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
  });

  it('supports loading attribute override', () => {
    render(OptimizedImage, {
      props: {
        src: '/image.jpg',
        alt: 'Test image',
        loading: 'eager',
      },
    });

    const img = screen.getByRole('img', { hidden: true });
    expect(img).toHaveAttribute('loading', 'eager');
  });
});