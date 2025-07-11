import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TypographyWithSlot from '../test-helpers/TypographyWithSlot.svelte';

describe('Typography Component', () => {
  describe('Text rendering', () => {
    it('should render text content', () => {
      render(TypographyWithSlot, { 
        props: { slotContent: 'Hello World' } 
      });
      
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('Variant styling', () => {
    it('should apply hero variant styles', () => {
      render(TypographyWithSlot, { 
        props: { 
          typographyProps: { variant: 'hero' },
          slotContent: 'Hero Text'
        }
      });
      
      const element = screen.getByText('Hero Text');
      expect(element.tagName).toBe('H1');
      expect(element).toHaveClass('font-zen-old-mincho');
      expect(element).toHaveClass('text-7xl');
      expect(element).toHaveClass('lg:text-8xl');
      expect(element).toHaveClass('xl:text-9xl');
    });

    it('should apply display variant styles', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { variant: 'display' },
          slotContent: 'Display Text'
        }
      });
      
      const element = screen.getByText('Display Text');
      expect(element.tagName).toBe('H2');
      expect(element).toHaveClass('font-prata');
      expect(element).toHaveClass('text-5xl');
      expect(element).toHaveClass('lg:text-6xl');
      expect(element).toHaveClass('xl:text-7xl');
    });

    it('should apply heading variant styles', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { variant: 'heading' },
          slotContent: 'Heading Text'
        }
      });
      
      const element = screen.getByText('Heading Text');
      expect(element.tagName).toBe('H3');
      expect(element).toHaveClass('font-prata');
      expect(element).toHaveClass('text-3xl');
      expect(element).toHaveClass('lg:text-4xl');
    });

    it('should apply body variant styles', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { variant: 'body' },
          slotContent: 'Body Text'
        }
      });
      
      const element = screen.getByText('Body Text');
      expect(element.tagName).toBe('P');
      expect(element).toHaveClass('font-montserrat');
      expect(element).toHaveClass('text-base');
      expect(element).toHaveClass('lg:text-lg');
    });

    it('should apply caption variant styles', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { variant: 'caption' },
          slotContent: 'Caption Text'
        }
      });
      
      const element = screen.getByText('Caption Text');
      expect(element.tagName).toBe('P');
      expect(element).toHaveClass('font-montserrat');
      expect(element).toHaveClass('text-sm');
      expect(element).toHaveClass('text-gray-600');
    });

    it('should default to body variant when no variant specified', () => {
      render(TypographyWithSlot, {
        props: {
          slotContent: 'Default Text'
        }
      });
      
      const element = screen.getByText('Default Text');
      expect(element.tagName).toBe('P');
      expect(element).toHaveClass('font-montserrat');
      expect(element).toHaveClass('text-base');
    });
  });

  describe('Custom CSS classes', () => {
    it('should accept and apply custom CSS classes', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { 
            variant: 'body',
            class: 'text-red-500 underline'
          },
          slotContent: 'Styled Text'
        }
      });
      
      const element = screen.getByText('Styled Text');
      expect(element).toHaveClass('text-red-500');
      expect(element).toHaveClass('underline');
      expect(element).toHaveClass('font-montserrat'); // Should still have variant styles
    });

    it('should merge custom classes with variant classes', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { 
            variant: 'hero',
            class: 'text-center mb-8'
          },
          slotContent: 'Centered Hero'
        }
      });
      
      const element = screen.getByText('Centered Hero');
      expect(element).toHaveClass('text-center');
      expect(element).toHaveClass('mb-8');
      expect(element).toHaveClass('font-zen-old-mincho');
      expect(element).toHaveClass('text-7xl');
    });
  });

  describe('HTML tag override', () => {
    it('should allow overriding the HTML tag with as prop', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { 
            variant: 'body',
            as: 'span'
          },
          slotContent: 'Span Text'
        }
      });
      
      const element = screen.getByText('Span Text');
      expect(element.tagName).toBe('SPAN');
      expect(element).toHaveClass('font-montserrat');
    });

    it('should respect semantic tags for hero variant with override', () => {
      render(TypographyWithSlot, {
        props: {
          typographyProps: { 
            variant: 'hero',
            as: 'div'
          },
          slotContent: 'Div Hero'
        }
      });
      
      const element = screen.getByText('Div Hero');
      expect(element.tagName).toBe('DIV');
      expect(element).toHaveClass('font-zen-old-mincho');
    });
  });
});