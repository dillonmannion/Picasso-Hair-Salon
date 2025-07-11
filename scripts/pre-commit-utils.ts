import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CheckResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  details?: string;
  message?: string;
}

interface PreCommitResult {
  success: boolean;
  skipped?: boolean;
  message?: string;
  checks?: {
    lint: boolean;
    typecheck: boolean;
    tests: boolean;
  };
  errors?: string;
  details?: {
    lint: CheckResult;
    typecheck: CheckResult;
    tests: CheckResult;
  };
}

interface ExecError extends Error {
  stderr?: string;
}

export const getStagedFiles = async (): Promise<string[]> => {
  try {
    const { stdout } = await execAsync('git diff --cached --name-only --diff-filter=ACM');
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

export const isCodeFile = (filename: string): boolean => {
  const codeExtensions = ['.ts', '.js', '.svelte', '.tsx', '.jsx'];
  return codeExtensions.some((ext) => filename.endsWith(ext));
};

export const runLintCheck = async (files: string[]): Promise<CheckResult> => {
  const codeFiles = files.filter(isCodeFile);
  if (codeFiles.length === 0) return { success: true, skipped: true };

  try {
    await execAsync(`pnpm eslint ${codeFiles.join(' ')}`);
    return { success: true };
  } catch (error) {
    const execError = error as ExecError;
    return {
      success: false,
      error: 'Linting failed',
      details: execError.stderr || execError.message,
    };
  }
};

export const runTypeCheck = async (): Promise<CheckResult> => {
  try {
    await execAsync('pnpm run check');
    return { success: true };
  } catch (error) {
    const execError = error as ExecError;
    return {
      success: false,
      error: 'Type checking failed',
      details: execError.stderr || execError.message,
    };
  }
};

export const runTests = async (files: string[]): Promise<CheckResult> => {
  const testableFiles = files.filter(
    (f) => isCodeFile(f) && !f.includes('.test.') && !f.includes('.spec.')
  );

  if (testableFiles.length === 0) return { success: true, skipped: true };

  try {
    // Run tests related to changed files
    const testPattern = testableFiles.map((f) => f.replace(/\.(ts|js|svelte)$/, '')).join('|');

    await execAsync(`pnpm test:unit --run --reporter=verbose --grep="${testPattern}"`);
    return { success: true };
  } catch (error) {
    const execError = error as ExecError;
    return {
      success: false,
      error: 'Tests failed',
      details: execError.stderr || execError.message,
    };
  }
};

export const runPreCommitChecks = async (): Promise<PreCommitResult> => {
  const stagedFiles = await getStagedFiles();

  if (stagedFiles.length === 0) {
    return {
      success: true,
      skipped: true,
      message: 'No staged files to check',
    };
  }

  const codeFiles = stagedFiles.filter(isCodeFile);

  if (codeFiles.length === 0) {
    return {
      success: true,
      skipped: true,
      message: 'No code files to check',
    };
  }

  console.log('🔍 Running pre-commit checks...');

  // Run checks in parallel for better performance
  const [lintResult, typeResult, testResult] = await Promise.all([
    runLintCheck(codeFiles),
    runTypeCheck(),
    runTests(codeFiles),
  ]);

  const checks = {
    lint: lintResult.success,
    typecheck: typeResult.success,
    tests: testResult.success,
  };

  const errors: string[] = [];
  if (!lintResult.success && lintResult.error) errors.push(lintResult.error);
  if (!typeResult.success && typeResult.error) errors.push(typeResult.error);
  if (!testResult.success && testResult.error) errors.push(testResult.error);

  const success = lintResult.success && typeResult.success && testResult.success;

  if (success) {
    console.log('✅ All checks passed!');
  } else {
    console.error('❌ Pre-commit checks failed:');
    errors.forEach((err) => console.error(`  - ${err}`));
  }

  return {
    success,
    checks,
    errors: errors.join(', '),
    details: {
      lint: lintResult,
      typecheck: typeResult,
      tests: testResult,
    },
  };
};
