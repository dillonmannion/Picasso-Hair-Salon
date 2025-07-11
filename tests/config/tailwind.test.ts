import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

type TailwindConfig = {
  content: string[];
  theme: {
    extend: {
      animation: Record<string, string>;
      keyframes: Record<string, Record<string, Record<string, string>>>;
      animationDelay: Record<string, string>;
      fontFamily: Record<string, string[]>;
      colors: {
        atelier: Record<string, string>;
      };
    };
  };
  plugins: unknown[];
};

describe('Tailwind CSS Configuration', () => {
  const configPath = resolve(__dirname, '../../tailwind.config.js');
  let config: TailwindConfig;

  beforeAll(async () => {
    const module = await import(pathToFileURL(configPath).href);
    config = module.default;
  });

  it('should export a valid Tailwind configuration', () => {
    expect(config).toBeDefined();
    expect(config.content).toBeDefined();
    expect(config.theme).toBeDefined();
    expect(config.theme.extend).toBeDefined();
  });

  it('should include custom animations', () => {
    const animations = config.theme.extend.animation;
    
    expect(animations).toBeDefined();
    expect(animations.slideBottom).toBe('slideBottom 0.5s ease-out');
    expect(animations.slideLeft).toBe('slideLeft 0.5s ease-out');
    expect(animations.slideRight).toBe('slideRight 0.5s ease-out');
    expect(animations.zoom).toBe('zoom 0.5s ease-out');
    expect(animations.fadeInBottom).toBe('fadeInBottom 1s ease-out');
  });

  it('should include keyframes for custom animations', () => {
    const keyframes = config.theme.extend.keyframes;
    
    expect(keyframes).toBeDefined();
    
    // Check slideBottom keyframes
    expect(keyframes.slideBottom).toEqual({
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    });
    
    // Check slideLeft keyframes
    expect(keyframes.slideLeft).toEqual({
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    });
    
    // Check slideRight keyframes
    expect(keyframes.slideRight).toEqual({
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    });
    
    // Check zoom keyframes
    expect(keyframes.zoom).toEqual({
      '0%': { transform: 'scale(0.5)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    });
    
    // Check fadeInBottom keyframes
    expect(keyframes.fadeInBottom).toEqual({
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    });
  });

  it('should include animation delays', () => {
    const animationDelay = config.theme.extend.animationDelay;
    
    expect(animationDelay).toBeDefined();
    expect(animationDelay['200']).toBe('200ms');
    expect(animationDelay['400']).toBe('400ms');
    expect(animationDelay['600']).toBe('600ms');
    expect(animationDelay['800']).toBe('800ms');
    expect(animationDelay['1000']).toBe('1000ms');
  });

  it('should include custom fonts', () => {
    const fontFamily = config.theme.extend.fontFamily;
    
    expect(fontFamily).toBeDefined();
    expect(fontFamily.zen).toEqual(['Zen Old Mincho', 'serif']);
    expect(fontFamily.prata).toEqual(['Prata', 'serif']);
    expect(fontFamily.montserrat).toEqual(['Montserrat', 'sans-serif']);
  });

  it('should include atelier color palette', () => {
    const colors = config.theme.extend.colors;
    
    expect(colors).toBeDefined();
    expect(colors.atelier).toBeDefined();
    
    // Check primary colors
    expect(colors.atelier.cream).toBe('#F5EDE4');
    expect(colors.atelier.charcoal).toBe('#2B2B2B');
    expect(colors.atelier.gold).toBe('#D4A574');
    expect(colors.atelier.sage).toBe('#9CAF88');
    expect(colors.atelier.blush).toBe('#E8C5B8');
    
    // Check neutral colors
    expect(colors.atelier.stone).toBe('#8B8680');
    expect(colors.atelier.mist).toBe('#E0DDD9');
    expect(colors.atelier.dust).toBe('#F9F7F5');
  });


  it('should scan correct content paths', () => {
    
    expect(config.content).toContain('./src/**/*.{html,js,svelte,ts}');
  });

  it('should include plugins if any', () => {
    
    expect(config.plugins).toBeDefined();
    expect(Array.isArray(config.plugins)).toBe(true);
  });
});