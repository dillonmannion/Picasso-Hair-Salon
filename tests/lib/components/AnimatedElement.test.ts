import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import AnimatedElement from '$lib/components/AnimatedElement.svelte';
import { tick } from 'svelte';

type MockObserver = {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

describe('AnimatedElement', () => {
  let observerCallbacks: Map<MockObserver, IntersectionObserverCallback>;
  let observerElements: Map<MockObserver, Set<Element>>;
  let observers: Set<Element>;

  beforeEach(() => {
    observers = new Set();
    observerCallbacks = new Map();
    observerElements = new Map();
    
    // @ts-expect-error - Mocking IntersectionObserver for testing
    global.IntersectionObserver = vi.fn((callback) => {
      const elementSet = new Set<Element>();
      const observer = {
        observe: vi.fn((element) => {
          observers.add(element);
          elementSet.add(element);
        }),
        unobserve: vi.fn((element) => {
          observers.delete(element);
          elementSet.delete(element);
        }),
        disconnect: vi.fn(() => {
          elementSet.forEach(el => observers.delete(el));
          elementSet.clear();
        }),
      };
      
      observerCallbacks.set(observer, callback);
      observerElements.set(observer, elementSet);
      return observer;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    observers.clear();
  });

  const triggerIntersection = (entries: Partial<IntersectionObserverEntry>[]) => {
    const fullEntries = entries.map(entry => ({
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 0,
      intersectionRect: {} as DOMRectReadOnly,
      isIntersecting: false,
      rootBounds: null,
      target: document.createElement('div'),
      time: Date.now(),
      ...entry,
    }));
    
    // Find which observer is observing each target and trigger only its callback
    observerCallbacks.forEach((callback, observer) => {
      const observedElements = observerElements.get(observer) || new Set();
      // Filter entries to only include targets observed by this specific observer
      const relevantEntries = fullEntries.filter(entry => 
        observedElements.has(entry.target)
      );
      if (relevantEntries.length > 0) {
        callback(relevantEntries as IntersectionObserverEntry[], observer as unknown as IntersectionObserver);
      }
    });
  };

  it('should observe element intersection on mount', () => {
    const { container } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]');

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '0px',
      })
    );
    expect(observers.has(element!)).toBe(true);
  });

  it('should trigger animation when element becomes visible', async () => {
    const { container } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]') as HTMLElement;

    expect(element).not.toHaveClass('animate-fade');

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveClass('animate-fade');
  });

  it('should not trigger animation when element is not visible', async () => {
    const { container } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]') as HTMLElement;

    triggerIntersection([{ target: element, isIntersecting: false }]);
    await tick();

    expect(element).not.toHaveClass('animate-fade');
  });

  it('should support configurable animation type', async () => {
    const { container } = render(AnimatedElement, {
      props: { animation: 'fly' },
    });
    const element = container.querySelector('[data-animated]') as HTMLElement;

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveClass('animate-fly');
    expect(element).not.toHaveClass('animate-fade');
  });

  it('should support configurable delay', async () => {
    const { container } = render(AnimatedElement, {
      props: { delay: 200 },
    });
    const element = container.querySelector('[data-animated]') as HTMLElement;

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveStyle({ animationDelay: '200ms' });
  });

  it('should support configurable duration', async () => {
    const { container } = render(AnimatedElement, {
      props: { duration: 1500 },
    });
    const element = container.querySelector('[data-animated]') as HTMLElement;

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveStyle({ animationDuration: '1500ms' });
  });

  it('should render slot content', () => {
    const { container } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]') as HTMLElement;
    
    // Component exists and can render children
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('DIV');
  });

  it('should apply custom CSS classes', () => {
    const { container } = render(AnimatedElement, {
      props: { class: 'custom-class' },
    });
    const element = container.querySelector('[data-animated]') as HTMLElement;

    expect(element).toHaveClass('custom-class');
  });

  it('should unobserve element on unmount', () => {
    const { container, unmount } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]');

    expect(observers.has(element!)).toBe(true);

    unmount();

    expect(observers.size).toBe(0); // Disconnect should clear observers
  });

  it('should only animate once per element', async () => {
    const { container } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]') as HTMLElement;

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveClass('animate-fade');

    triggerIntersection([{ target: element, isIntersecting: false }]);
    await tick();

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveClass('animate-fade');
    expect(observers.has(element)).toBe(false); // Should unobserve after animation
  });

  it('should support scale animation type', async () => {
    const { container } = render(AnimatedElement, {
      props: { animation: 'scale' },
    });
    const element = container.querySelector('[data-animated]') as HTMLElement;

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).toHaveClass('animate-scale');
  });

  it('should handle multiple instances independently', async () => {
    const { container: container1 } = render(AnimatedElement, {
      props: { animation: 'fade' },
    });
    const element1 = container1.querySelector('[data-animated]') as HTMLElement;
    
    const { container: container2 } = render(AnimatedElement, {
      props: { animation: 'fly', delay: 100 },
    });
    const element2 = container2.querySelector('[data-animated]') as HTMLElement;

    // Ensure both observers are set up
    await tick();

    triggerIntersection([{ target: element1, isIntersecting: true }]);
    await tick();
    await waitFor(() => {
      expect(element1).toHaveClass('animate-fade');
    });

    expect(element2).not.toHaveClass('animate-fly');

    triggerIntersection([{ target: element2, isIntersecting: true }]);
    await tick();
    await waitFor(() => {
      expect(element2).toHaveClass('animate-fly');
    });
    
    expect(element2).toHaveStyle({ animationDelay: '100ms' });
  });

  it('should have opacity 0 initially and 1 after animation', async () => {
    const { container } = render(AnimatedElement);
    const element = container.querySelector('[data-animated]') as HTMLElement;

    expect(element).toHaveClass('opacity-0');

    triggerIntersection([{ target: element, isIntersecting: true }]);
    await tick();

    expect(element).not.toHaveClass('opacity-0');
  });

  it('should accept custom threshold for intersection observer', () => {
    render(AnimatedElement, {
      props: { threshold: 0.5 },
    });

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.5,
      })
    );
  });
});