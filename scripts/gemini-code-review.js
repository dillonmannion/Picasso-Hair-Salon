#!/usr/bin/env node

/**
 * Gemini Code Review Script
 * Uses the gemini CLI command to review code and determine if refactoring is needed
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

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
  if (!args.file || !args.component) {
    console.error(
      'Usage: gemini-code-review.js --file=<file> --component=<name> [--guidelines=<file>]'
    );
    process.exit(1);
  }

  return args;
}

/**
 * Main review function
 */
async function reviewCode(args) {
  console.log('🤖 Starting Gemini code review...');
  console.log(`📄 File: ${args.file}`);
  console.log(`🧩 Component: ${args.component}`);
  console.log('');

  try {
    // Read input files
    const codeContent = await fs.readFile(args.file, 'utf8');
    const guidelinesContent = args.guidelines 
      ? await fs.readFile(args.guidelines, 'utf8')
      : getDefaultGuidelines();

    // Create prompt for Gemini
    const prompt = `You are a senior software engineer reviewing code that was just written following TDD principles. The tests are passing, and now you need to assess if the code needs refactoring.

REFACTORING GUIDELINES:
${guidelinesContent}

CODE TO REVIEW (Component: ${args.component}):
${codeContent}

Your Task:
Review this code and determine if refactoring is needed based on the guidelines.

IMPORTANT: Code that is already clean and follows best practices should NOT be refactored. Only suggest refactoring if there are clear improvements to be made.

Provide your response in this EXACT format:

REFACTOR_SCORE: [number 0-10]

## Assessment Summary
[One paragraph summary of code quality]

## Refactoring Needed
[List specific issues that need refactoring, or write "None - code is already clean"]

## Specific Improvements
[If score >= 7, list specific refactoring suggestions with examples]
[If score < 7, write "No refactoring needed"]

Remember:
- Score 0-3: Code is already clean, no refactoring needed
- Score 4-6: Minor improvements possible but not critical  
- Score 7-10: Refactoring strongly recommended`;

    // Call Gemini CLI with escaped prompt
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

    console.log('⏳ Calling Gemini CLI...');

    exec(`gemini -p "${escapedPrompt}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Gemini CLI error:', error.message);
        if (stderr) console.error('Stderr:', stderr);

        // Use mock review if Gemini CLI is not available
        if (error.message.includes('command not found')) {
          console.log('⚠️  Gemini CLI not found, using mock review...');
          await mockReview(args, codeContent);
          return;
        }

        process.exit(1);
      }

      // Output the review
      console.log(stdout);

      // Extract refactor score
      const scoreMatch = stdout.match(/REFACTOR_SCORE:\s*(\d+)/);
      if (scoreMatch) {
        const score = parseInt(scoreMatch[1]);
        // Exit with score as exit code (0 = no refactor, 10 = must refactor)
        process.exit(score);
      } else {
        console.error('⚠️  Could not extract refactor score from response');
        process.exit(5); // Default to middle score
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(99);
  }
}

/**
 * Get default refactoring guidelines
 */
function getDefaultGuidelines() {
  return `## Scoring Criteria (0-10)

Score 0-3: Code is already clean, no refactoring needed
Score 4-6: Minor improvements possible but not critical
Score 7-10: Refactoring strongly recommended

## Assessment Checklist

### Naming and Clarity (Weight: 30%)
- Are all variable and function names descriptive and clear?
- Do names express intent without needing comments?
- Are there any abbreviations that should be expanded?

### Code Structure (Weight: 25%)
- Are there magic numbers that should be named constants?
- Is there duplicated knowledge (not just code)?
- Are functions focused on a single responsibility?
- Is nesting kept to a maximum of 2 levels?

### TypeScript Best Practices (Weight: 20%)
- Are there any 'any' types that can be made specific?
- Are type assertions avoided where possible?
- Are utility types used effectively?

### Functional Programming (Weight: 15%)
- Is data kept immutable throughout?
- Are functions pure where possible?
- Are array methods used instead of imperative loops?

### API Design (Weight: 10%)
- Are options objects used for functions with optional parameters?
- Is the public API minimal and focused?

## Automatic Refactoring Triggers

MUST refactor if:
- Magic numbers exist without named constants
- Functions exceed 20 lines
- Nesting depth exceeds 3 levels
- 'any' type is used
- Duplicated logic spans more than 3 lines`;
}

/**
 * Mock review for testing without Gemini CLI
 */
async function mockReview(args, codeContent) {
  console.log('🧪 Running mock code review...');

  // Simple heuristics for mock scoring
  let score = 0;
  const issues = [];

  // Check for magic numbers
  if (/\b\d{2,}\b/.test(codeContent) && !/const\s+\w+\s*=\s*\d+/.test(codeContent)) {
    score += 3;
    issues.push('Magic numbers detected');
  }

  // Check for any types
  if (/:\s*any\b/.test(codeContent)) {
    score += 3;
    issues.push('Use of "any" type detected');
  }

  // Check for long functions (crude check)
  const functionMatches = codeContent.match(/\{[^}]{500,}/g);
  if (functionMatches) {
    score += 2;
    issues.push('Long functions detected');
  }

  // Check for deep nesting
  if (/\s{12,}/.test(codeContent)) {
    score += 2;
    issues.push('Deep nesting detected');
  }

  const mockResponse = `REFACTOR_SCORE: ${score}

## Assessment Summary
Mock review detected ${issues.length} potential issues in the code.

## Refactoring Needed
${issues.length > 0 ? issues.join('\n') : 'None - code is already clean'}

## Specific Improvements
${score >= 7 ? 'Refactoring recommended to address the issues listed above.' : 'No refactoring needed'}`;

  console.log(mockResponse);
  process.exit(score);
}

// Main execution
async function main() {
  const args = parseArgs();

  // Check if we should use mock mode
  if (process.env.GEMINI_MOCK === 'true') {
    const codeContent = await fs.readFile(args.file, 'utf8');
    await mockReview(args, codeContent);
    return;
  }

  // Check if gemini CLI is available
  exec('which gemini', async (error) => {
    if (error) {
      console.log('⚠️  Gemini CLI not found, using mock mode...');
      const codeContent = await fs.readFile(args.file, 'utf8');
      await mockReview(args, codeContent);
    } else {
      await reviewCode(args);
    }
  });
}

// Run the script
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(99);
});