import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SvelteKit Configuration', () => {
  const configPath = resolve(process.cwd(), 'svelte.config.js');

  it('should have route splitting enabled in the Vercel adapter configuration', () => {
    const configContent = readFileSync(configPath, 'utf-8');
    
    expect(configContent).toContain('@sveltejs/adapter-vercel');
    
    const adapterRegex = /adapter\s*\(\s*\{[^}]*split\s*:\s*true[^}]*\}/s;
    const hasRouteSplitting = adapterRegex.test(configContent);
    
    expect(hasRouteSplitting).toBe(true);
  });

  it('should maintain existing adapter configuration while having split enabled', () => {
    const configContent = readFileSync(configPath, 'utf-8');
    
    const adapterCallMatch = configContent.match(/adapter\s*\(\s*(\{[^}]+\})\s*\)/s);
    expect(adapterCallMatch).toBeTruthy();
    
    if (adapterCallMatch) {
      const adapterConfig = adapterCallMatch[1];
      expect(adapterConfig).toContain('split: true');
    }
  });

  it('should export a valid SvelteKit configuration', () => {
    const configContent = readFileSync(configPath, 'utf-8');
    
    expect(configContent).toMatch(/export\s+default\s+/);
    expect(configContent).toContain('kit:');
    expect(configContent).toContain('adapter:');
  });
});