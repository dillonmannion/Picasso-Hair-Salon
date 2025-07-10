#!/usr/bin/env node

/**
 * Gemini Refactor Script
 * Uses the gemini CLI command to apply refactoring suggestions to code
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';

/**
 * Parse command line arguments in format --key=value
 */
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.split('=');
    args[key.replace('--', '')] = value;
  });

  // Validate required args
  if (!args.file || !args.suggestions) {
    console.error('Usage: gemini-refactor.js --file=<file> --suggestions=<review-output>');
    process.exit(1);
  }

  return args;
}

/**
 * Main refactor function
 */
async function refactorCode(args) {
  console.log('🔧 Starting Gemini refactoring...');
  console.log(`📄 File: ${args.file}`);
  console.log('');

  try {
    // Read the current code
    const codeContent = await fs.readFile(args.file, 'utf8');

    // Create prompt for Gemini
    const prompt = `You are a senior software engineer tasked with refactoring code based on review suggestions. You must maintain the exact same external behavior while improving the internal structure.

CURRENT CODE:
${codeContent}

REVIEW SUGGESTIONS:
${args.suggestions}

Your Task:
Apply the suggested refactorings to improve the code structure while maintaining identical behavior.

CRITICAL RULES:
1. The external API and behavior must remain EXACTLY the same
2. All existing tests must continue to pass without modification
3. Follow TypeScript strict mode (no 'any', no type assertions unless necessary)
4. Use descriptive names for everything
5. Keep functions small and focused
6. Use immutable data patterns
7. Apply functional programming principles where appropriate
8. Extract magic numbers to named constants
9. Use options objects for complex parameters

Return ONLY the refactored code, no explanations or comments. The code should be complete and ready to save.`;

    // Call Gemini CLI with escaped prompt
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

    console.log('⏳ Calling Gemini CLI for refactoring...');

    exec(`gemini -p "${escapedPrompt}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Gemini CLI error:', error.message);
        if (stderr) console.error('Stderr:', stderr);

        // Use mock refactor if Gemini CLI is not available
        if (error.message.includes('command not found')) {
          console.log('⚠️  Gemini CLI not found, using mock refactoring...');
          const refactored = await mockRefactor(args, codeContent);
          console.log(refactored);
          return;
        }

        process.exit(1);
      }

      // Extract code from response (remove any markdown code blocks if present)
      let refactoredCode = stdout;

      // Remove markdown code blocks if present
      refactoredCode = refactoredCode.replace(/```typescript\n/g, '');
      refactoredCode = refactoredCode.replace(/```\n/g, '');
      refactoredCode = refactoredCode.replace(/```$/g, '');
      refactoredCode = refactoredCode.trim();

      // Output the refactored code
      console.log(refactoredCode);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Mock refactor for testing without Gemini CLI
 */
async function mockRefactor(args, codeContent) {
  console.log('🧪 Running mock refactoring...');

  // Simple mock refactoring based on common patterns
  let refactoredCode = codeContent;

  // Extract magic numbers to constants
  const magicNumbers = refactoredCode.match(/\b\d{2,}\b/g);
  if (magicNumbers) {
    const uniqueNumbers = [...new Set(magicNumbers)];
    let constants = '';

    uniqueNumbers.forEach((num) => {
      if (num.length === 4 && num.startsWith('20')) {
        // Likely a year
        constants += `const DEFAULT_YEAR = ${num};\n`;
        refactoredCode = refactoredCode.replace(new RegExp(`\\b${num}\\b`, 'g'), 'DEFAULT_YEAR');
      } else if (num === '100') {
        constants += `const PERCENTAGE_MAX = ${num};\n`;
        refactoredCode = refactoredCode.replace(/\b100\b/g, 'PERCENTAGE_MAX');
      }
    });

    if (constants) {
      // Add constants at the top of the file
      refactoredCode = constants + '\n' + refactoredCode;
    }
  }

  // Replace any types with unknown
  refactoredCode = refactoredCode.replace(/:\s*any\b/g, ': unknown');

  // Add basic formatting improvements
  refactoredCode = refactoredCode.replace(/\)\s*{/g, ') {');
  refactoredCode = refactoredCode.replace(/}\s*else\s*{/g, '} else {');

  return refactoredCode;
}

// Main execution
async function main() {
  const args = parseArgs();

  // Check if we should use mock mode
  if (process.env.GEMINI_MOCK === 'true') {
    const codeContent = await fs.readFile(args.file, 'utf8');
    const refactored = await mockRefactor(args, codeContent);
    console.log(refactored);
    return;
  }

  // Check if gemini CLI is available
  exec('which gemini', async (error) => {
    if (error) {
      console.log('⚠️  Gemini CLI not found, using mock mode...');
      const codeContent = await fs.readFile(args.file, 'utf8');
      const refactored = await mockRefactor(args, codeContent);
      console.log(refactored);
    } else {
      await refactorCode(args);
    }
  });
}

// Run the script
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
