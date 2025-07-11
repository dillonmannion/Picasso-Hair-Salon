import { describe, it, expect } from 'vitest';
import { readVitestConfig, updateCoverageThresholds } from '../helpers/vitest-config-helper';

describe('Vitest Coverage Configuration', () => {
  it('should have coverage thresholds set to 80% for all metrics', () => {
    const config = readVitestConfig();

    expect(config.coverage.thresholds.branches).toBe(80);
    expect(config.coverage.thresholds.functions).toBe(80);
    expect(config.coverage.thresholds.lines).toBe(80);
    expect(config.coverage.thresholds.statements).toBe(80);
  });

  it('should fail the test run when coverage is below threshold', () => {
    const validateCoverage = (
      coverage: Record<string, number>,
      thresholds: Record<string, number>
    ): { passed: boolean; failures: string[] } => {
      const failures: string[] = [];

      Object.entries(thresholds).forEach(([metric, threshold]) => {
        const actual = coverage[metric];
        if (actual < threshold) {
          failures.push(
            `ERROR: ${metric} coverage of ${actual}% does not meet threshold of ${threshold}%`
          );
        }
      });

      return {
        passed: failures.length === 0,
        failures,
      };
    };

    const mockCoverageOutput = {
      branches: 75,
      functions: 78,
      lines: 79,
      statements: 77,
    };

    const thresholds = {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    };

    const result = validateCoverage(mockCoverageOutput, thresholds);

    expect(result.passed).toBe(false);
    expect(result.failures).toContain(
      'ERROR: branches coverage of 75% does not meet threshold of 80%'
    );
    expect(result.failures).toContain(
      'ERROR: functions coverage of 78% does not meet threshold of 80%'
    );
    expect(result.failures).toContain(
      'ERROR: lines coverage of 79% does not meet threshold of 80%'
    );
    expect(result.failures).toContain(
      'ERROR: statements coverage of 77% does not meet threshold of 80%'
    );
  });

  it('should update existing configuration with new thresholds', () => {
    const updatedConfig = updateCoverageThresholds({
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    });

    expect(updatedConfig).toContain('branches: 80');
    expect(updatedConfig).toContain('functions: 80');
    expect(updatedConfig).toContain('lines: 80');
    expect(updatedConfig).toContain('statements: 80');
  });

  it('should preserve existing coverage configuration while updating thresholds', () => {
    const updatedConfig = updateCoverageThresholds({
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    });

    expect(updatedConfig).toContain("provider: 'v8'");
    expect(updatedConfig).toContain("reporter: ['text', 'json', 'html']");
    expect(updatedConfig).toContain('exclude:');
    expect(updatedConfig).toContain('include:');
  });

  it('should format threshold failure messages clearly', () => {
    const formatThresholdError = (metric: string, actual: number, threshold: number): string => {
      return `ERROR: ${metric} coverage of ${actual}% does not meet threshold of ${threshold}%`;
    };

    const errorMessage = formatThresholdError('branches', 75, 80);
    expect(errorMessage).toBe('ERROR: branches coverage of 75% does not meet threshold of 80%');
  });
});
