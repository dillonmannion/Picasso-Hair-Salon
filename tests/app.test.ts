import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('App CSS', () => {
  let cssContent: string;

  beforeEach(() => {
    const cssPath = resolve(__dirname, '../src/app.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  it('should import Tailwind directives', () => {
    expect(cssContent).toContain('@tailwind base;');
    expect(cssContent).toContain('@tailwind components;');
    expect(cssContent).toContain('@tailwind utilities;');
  });

  it('should include custom animation keyframes', () => {
    expect(cssContent).toContain('@keyframes slideBottom');
    expect(cssContent).toContain('@keyframes slideLeft');
    expect(cssContent).toContain('@keyframes slideRight');
    expect(cssContent).toContain('@keyframes zoom');
    expect(cssContent).toContain('@keyframes fadeInBottom');
  });

  it('should import Google Fonts', () => {
    expect(cssContent).toContain('@import url');
    expect(cssContent).toContain('Zen+Old+Mincho');
    expect(cssContent).toContain('Prata');
    expect(cssContent).toContain('Montserrat');
  });

  it('should set up CSS custom properties for animations', () => {
    expect(cssContent).toContain(':root');
    expect(cssContent).toContain('--animation-duration');
    expect(cssContent).toContain('--animation-delay');
    expect(cssContent).toContain('--animation-ease');
  });

  it('should define animation classes', () => {
    expect(cssContent).toContain('.animate-slideBottom');
    expect(cssContent).toContain('.animate-slideLeft');
    expect(cssContent).toContain('.animate-slideRight');
    expect(cssContent).toContain('.animate-zoom');
    expect(cssContent).toContain('.animate-fadeInBottom');
  });

  it('should include global style resets', () => {
    expect(cssContent).toContain('html');
    expect(cssContent).toContain('scroll-behavior: smooth');
    expect(cssContent).toContain('body');
    expect(cssContent).toContain('antialiased');
  });
});