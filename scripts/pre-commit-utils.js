import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const getStagedFiles = async () => {
  try {
    const { stdout } = await execAsync('git diff --cached --name-only --diff-filter=ACM');
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
};

export const isCodeFile = (filename) => {
  const codeExtensions = ['.ts', '.js', '.svelte', '.tsx', '.jsx'];
  return codeExtensions.some(ext => filename.endsWith(ext));
};

export const runLintCheck = async (files) => {
  const codeFiles = files.filter(isCodeFile);
  if (codeFiles.length === 0) return { success: true, skipped: true };

  try {
    await execAsync(`pnpm eslint ${codeFiles.join(' ')}`);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Linting failed',
      details: error.stderr || error.message 
    };
  }
};

export const runTypeCheck = async () => {
  try {
    await execAsync('pnpm run check');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Type checking failed',
      details: error.stderr || error.message 
    };
  }
};

export const runTests = async (files) => {
  const testableFiles = files.filter(f => 
    isCodeFile(f) && !f.includes('.test.') && !f.includes('.spec.')
  );

  if (testableFiles.length === 0) return { success: true, skipped: true };

  try {
    // Run tests related to changed files
    const testPattern = testableFiles
      .map(f => f.replace(/\.(ts|js|svelte)$/, ''))
      .join('|');
    
    await execAsync(`pnpm test:unit --run --reporter=verbose --grep="${testPattern}"`);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Tests failed',
      details: error.stderr || error.message 
    };
  }
};

export const runPreCommitChecks = async () => {
  const stagedFiles = await getStagedFiles();
  
  if (stagedFiles.length === 0) {
    return { 
      success: true, 
      skipped: true, 
      message: 'No staged files to check' 
    };
  }

  const codeFiles = stagedFiles.filter(isCodeFile);
  
  if (codeFiles.length === 0) {
    return { 
      success: true, 
      skipped: true, 
      message: 'No code files to check' 
    };
  }

  console.log('🔍 Running pre-commit checks...');
  
  // Run checks in parallel for better performance
  const [lintResult, typeResult, testResult] = await Promise.all([
    runLintCheck(codeFiles),
    runTypeCheck(),
    runTests(codeFiles)
  ]);

  const checks = {
    lint: lintResult.success,
    typecheck: typeResult.success,
    tests: testResult.success
  };

  const errors = [];
  if (!lintResult.success) errors.push(lintResult.error);
  if (!typeResult.success) errors.push(typeResult.error);
  if (!testResult.success) errors.push(testResult.error);

  const success = lintResult.success && typeResult.success && testResult.success;

  if (success) {
    console.log('✅ All checks passed!');
  } else {
    console.error('❌ Pre-commit checks failed:');
    errors.forEach(err => console.error(`  - ${err}`));
  }

  return { 
    success, 
    checks, 
    errors: errors.join(', '),
    details: {
      lint: lintResult,
      typecheck: typeResult,
      tests: testResult
    }
  };
};