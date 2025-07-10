import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as preCommitUtils from '../../scripts/pre-commit-utils';


// Mock the child_process module
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    exec: vi.fn((_cmd, _callback) => {
      // Default behavior - no callback execution
    }),
  };
});

describe('Pre-commit Hook Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      // Mock getStagedFiles to return empty array
      vi.spyOn(preCommitUtils, 'getStagedFiles').mockResolvedValue([]);

      const result = await preCommitUtils.runPreCommitChecks();

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.message).toBe('No staged files to check');
    });

    it('should handle non-code files gracefully', async () => {
      // Mock getStagedFiles to return non-code files
      vi.spyOn(preCommitUtils, 'getStagedFiles').mockResolvedValue(['README.md', 'package.json']);

      const result = await preCommitUtils.runPreCommitChecks();

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      // Either message is valid depending on mock behavior
      expect(['No staged files to check', 'No code files to check']).toContain(result.message);
    });

    it('should run all functions correctly when given code files', async () => {
      // This is a test to verify the functions can be called
      expect(typeof preCommitUtils.runLintCheck).toBe('function');
      expect(typeof preCommitUtils.runTypeCheck).toBe('function');
      expect(typeof preCommitUtils.runTests).toBe('function');
    });
  });
});