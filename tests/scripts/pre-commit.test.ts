import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { exec as execCallback } from 'child_process';

// Mock child_process module
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

const mockExec = execCallback as unknown as Mock;

describe('Pre-commit Hook Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('Core functionality', () => {
    it('should get staged files from git', async () => {
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'git diff --cached --name-only --diff-filter=ACM') {
          callback(null, 'src/test.ts\nsrc/lib/Button.svelte', '');
        }
      });

      const { getStagedFiles } = await import('../../scripts/pre-commit-utils.js');
      const files = await getStagedFiles();
      
      expect(files).toEqual(['src/test.ts', 'src/lib/Button.svelte']);
    });

    it('should identify code files correctly', async () => {
      const { isCodeFile } = await import('../../scripts/pre-commit-utils.js');
      
      expect(isCodeFile('src/test.ts')).toBe(true);
      expect(isCodeFile('component.svelte')).toBe(true);
      expect(isCodeFile('util.js')).toBe(true);
      expect(isCodeFile('README.md')).toBe(false);
      expect(isCodeFile('.gitignore')).toBe(false);
    });
  });

  describe('Linting', () => {
    it('should run ESLint on staged TypeScript and Svelte files', async () => {
      let eslintCommand = '';
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd.startsWith('pnpm eslint')) {
          eslintCommand = cmd;
          callback(null, '', '');
        }
      });

      const { runLintCheck } = await import('../../scripts/pre-commit-utils.js');
      const result = await runLintCheck(['src/test.ts', 'Button.svelte', 'README.md']);
      
      expect(result.success).toBe(true);
      expect(eslintCommand).toBe('pnpm eslint src/test.ts Button.svelte');
    });

    it('should return error when ESLint fails', async () => {
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd.startsWith('pnpm eslint')) {
          const error = new Error('ESLint failed');
          error.stderr = 'Use of "any" type is forbidden';
          callback(error, '', error.stderr);
        }
      });

      const { runLintCheck } = await import('../../scripts/pre-commit-utils.js');
      const result = await runLintCheck(['src/test.ts']);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Linting failed');
      expect(result.details).toContain('Use of "any" type is forbidden');
    });
  });

  describe('Type checking', () => {
    it('should run type check command', async () => {
      let checkCommand = '';
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'pnpm run check') {
          checkCommand = cmd;
          callback(null, '', '');
        }
      });

      const { runTypeCheck } = await import('../../scripts/pre-commit-utils.js');
      const result = await runTypeCheck();
      
      expect(result.success).toBe(true);
      expect(checkCommand).toBe('pnpm run check');
    });

    it('should return error when type check fails', async () => {
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'pnpm run check') {
          const error = new Error('Type check failed');
          error.stderr = "Type 'string' is not assignable to type 'number'";
          callback(error, '', error.stderr);
        }
      });

      const { runTypeCheck } = await import('../../scripts/pre-commit-utils.js');
      const result = await runTypeCheck();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Type checking failed');
      expect(result.details).toContain('not assignable');
    });
  });

  describe('Test execution', () => {
    it('should run tests for changed source files', async () => {
      let testCommand = '';
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd.includes('pnpm test:unit')) {
          testCommand = cmd;
          callback(null, 'All tests passed', '');
        }
      });

      const { runTests } = await import('../../scripts/pre-commit-utils.js');
      const result = await runTests(['src/lib/utils/math.ts', 'src/lib/Button.svelte']);
      
      expect(result.success).toBe(true);
      expect(testCommand).toContain('math|Button');
    });

    it('should skip test files themselves', async () => {
      const { runTests } = await import('../../scripts/pre-commit-utils.js');
      const result = await runTests(['src/lib/math.test.ts', 'Button.spec.ts']);
      
      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should run all checks successfully', async () => {
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'git diff --cached --name-only --diff-filter=ACM') {
          callback(null, 'src/test.ts', '');
        } else if (cmd.includes('eslint') || cmd.includes('check') || cmd.includes('test')) {
          callback(null, '', '');
        }
      });

      const { runPreCommitChecks } = await import('../../scripts/pre-commit-utils.js');
      const result = await runPreCommitChecks();
      
      expect(result.success).toBe(true);
      expect(result.checks.lint).toBe(true);
      expect(result.checks.typecheck).toBe(true);
      expect(result.checks.tests).toBe(true);
    });

    it('should fail when any check fails', async () => {
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'git diff --cached --name-only --diff-filter=ACM') {
          callback(null, 'src/test.ts', '');
        } else if (cmd.includes('eslint')) {
          const error = new Error('Lint failed');
          callback(error, '', 'ESLint error');
        } else {
          callback(null, '', '');
        }
      });

      const { runPreCommitChecks } = await import('../../scripts/pre-commit-utils.js');
      const result = await runPreCommitChecks();
      
      expect(result.success).toBe(false);
      expect(result.checks.lint).toBe(false);
      expect(result.errors).toContain('Linting failed');
    });
  });
});