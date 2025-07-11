import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Environment Example File', () => {
  it('should exist in the project root', () => {
    const envExamplePath = resolve(process.cwd(), '.env.example');
    expect(existsSync(envExamplePath)).toBe(true);
  });

  it('should document all required environment variables with descriptions', () => {
    const envExamplePath = resolve(process.cwd(), '.env.example');
    const content = readFileSync(envExamplePath, 'utf-8');

    // Check for required Supabase variables
    expect(content).toMatch(/^# .*Supabase URL.*\nPUBLIC_SUPABASE_URL=/m);
    expect(content).toMatch(/^# .*Supabase anon.*key.*\nPUBLIC_SUPABASE_ANON_KEY=/m);

    // Check for database connection string
    expect(content).toMatch(/^# .*Database.*connection.*\nDATABASE_URL=/m);

    // Check for environment mode
    expect(content).toMatch(/^# .*Environment.*mode.*\nNODE_ENV=/m);

    // Check for rate limiting configuration
    expect(content).toMatch(/^# .*Rate limit.*window.*\nRATE_LIMIT_WINDOW_MS=/m);
    expect(content).toMatch(/^# .*Rate limit.*max.*requests.*\nRATE_LIMIT_MAX_REQUESTS=/m);

    // Check for session configuration
    expect(content).toMatch(/^# .*Session.*duration.*\nSESSION_DURATION_HOURS=/m);
  });

  it('should provide example values for each variable', () => {
    const envExamplePath = resolve(process.cwd(), '.env.example');
    const content = readFileSync(envExamplePath, 'utf-8');

    // Verify example values are provided
    expect(content).toMatch(/PUBLIC_SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/);
    expect(content).toMatch(/PUBLIC_SUPABASE_ANON_KEY=eyJ[a-zA-Z0-9._-]+/);
    expect(content).toMatch(
      /DATABASE_URL=postgresql:\/\/postgres:password@localhost:54322\/postgres/
    );
    expect(content).toMatch(/NODE_ENV=development/);
    expect(content).toMatch(/RATE_LIMIT_WINDOW_MS=900000/);
    expect(content).toMatch(/RATE_LIMIT_MAX_REQUESTS=100/);
    expect(content).toMatch(/SESSION_DURATION_HOURS=24/);
  });

  it('should include security warnings where appropriate', () => {
    const envExamplePath = resolve(process.cwd(), '.env.example');
    const content = readFileSync(envExamplePath, 'utf-8');

    // Check for security warnings
    expect(content).toMatch(/# WARNING: Never commit.*real.*credentials/i);
    expect(content).toMatch(/# IMPORTANT:.*anon key.*public.*safe/i);
  });

  it('should be properly formatted with clear sections', () => {
    const envExamplePath = resolve(process.cwd(), '.env.example');
    const content = readFileSync(envExamplePath, 'utf-8');

    // Check for section headers
    expect(content).toMatch(/# Supabase Configuration/);
    expect(content).toMatch(/# Database Configuration/);
    expect(content).toMatch(/# Application Settings/);
    expect(content).toMatch(/# Security Settings/);
  });
});
