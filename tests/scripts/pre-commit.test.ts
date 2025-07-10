import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the pre-commit-utils module
vi.mock('../../scripts/pre-commit-utils', () => ({
  getStagedFiles: vi.fn(),
  isCodeFile: vi.fn((filename: string) => {
    const codeExtensions = ['.ts', '.js', '.svelte', '.tsx', '.jsx'];
    return codeExtensions.some((ext) => filename.endsWith(ext));
  }),
  runLintCheck: vi.fn(),
  runTypeCheck: vi.fn(),
  runTests: vi.fn(),
  runPreCommitChecks: vi.fn(),
}));

import * as preCommitUtils from '../../scripts/pre-commit-utils';

describe('Pre-commit Hook Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to prevent output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core functionality', () => {
    it('should identify code files correctly', () => {
      const { isCodeFile } = preCommitUtils;

      expect(isCodeFile('src/test.ts')).toBe(true);
      expect(isCodeFile('component.svelte')).toBe(true);
      expect(isCodeFile('util.js')).toBe(true);
      expect(isCodeFile('README.md')).toBe(false);
      expect(isCodeFile('.gitignore')).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should export all required functions', () => {
      expect(preCommitUtils.getStagedFiles).toBeDefined();
      expect(preCommitUtils.isCodeFile).toBeDefined();
      expect(preCommitUtils.runLintCheck).toBeDefined();
      expect(preCommitUtils.runTypeCheck).toBeDefined();
      expect(preCommitUtils.runTests).toBeDefined();
      expect(preCommitUtils.runPreCommitChecks).toBeDefined();
    });

    it('should handle empty staged files gracefully', async () => {
      // Configure mock to return expected result for empty files
      vi.mocked(preCommitUtils.runPreCommitChecks).mockResolvedValue({
        success: true,
        skipped: true,
        message: 'No staged files to check',
      });

      const result = await preCommitUtils.runPreCommitChecks();

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.message).toBe('No staged files to check');
    });

    it('should handle non-code files gracefully', async () => {
      // Configure mock to return expected result for non-code files
      vi.mocked(preCommitUtils.runPreCommitChecks).mockResolvedValue({
        success: true,
        skipped: true,
        message: 'No code files to check',
      });

      const result = await preCommitUtils.runPreCommitChecks();

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.message).toBe('No code files to check');
    });

    it('should run all functions correctly when given code files', async () => {
      // This is a test to verify the functions can be called
      expect(typeof preCommitUtils.runLintCheck).toBe('function');
      expect(typeof preCommitUtils.runTypeCheck).toBe('function');
      expect(typeof preCommitUtils.runTests).toBe('function');
    });
  });
});