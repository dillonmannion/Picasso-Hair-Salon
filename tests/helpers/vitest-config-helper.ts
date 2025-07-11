import { readFileSync } from 'fs';
import { resolve } from 'path';

export type CoverageThresholds = {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
};

export type CoverageConfig = {
  provider: string;
  reporter: string[];
  thresholds: CoverageThresholds;
  exclude: string[];
  include: string[];
};

const VITEST_CONFIG_PATH = 'vitest.config.ts';
const COVERAGE_METRICS = ['branches', 'functions', 'lines', 'statements'] as const;

const extractThresholdValue = (content: string, metric: string): number => {
  const match = content.match(new RegExp(`${metric}:\\s*(\\d+)`));
  return match ? parseInt(match[1]) : 0;
};

export const readVitestConfig = (): { coverage: CoverageConfig } => {
  const configPath = resolve(process.cwd(), VITEST_CONFIG_PATH);
  const configContent = readFileSync(configPath, 'utf-8');

  const thresholds = COVERAGE_METRICS.reduce(
    (acc, metric) => ({
      ...acc,
      [metric]: extractThresholdValue(configContent, metric),
    }),
    {} as CoverageThresholds
  );

  return {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds,
      exclude: [],
      include: [],
    },
  };
};

export const updateCoverageThresholds = (thresholds: CoverageThresholds): string => {
  const configPath = resolve(process.cwd(), VITEST_CONFIG_PATH);
  const configContent = readFileSync(configPath, 'utf-8');

  return COVERAGE_METRICS.reduce(
    (content, metric) =>
      content.replace(new RegExp(`${metric}:\\s*\\d+`), `${metric}: ${thresholds[metric]}`),
    configContent
  );
};
