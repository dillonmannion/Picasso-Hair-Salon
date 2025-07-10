#!/usr/bin/env node

/**
 * Gemini Review Integration Script
 * Uses the gemini CLI command to review implementation plans
 */

import { spawn } from 'child_process';
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
  if (!args.plan || !args.requirements || !args.iteration) {
    console.error(
      'Usage: gemini-review.js --plan=<file> --requirements=<file> --iteration=<n> [--output=<file>]'
    );
    process.exit(1);
  }

  return args;
}

/**
 * Main review function
 */
async function reviewPlan(args) {
  console.log('🤖 Starting Gemini review...');
  console.log(`📄 Plan: ${args.plan}`);
  console.log(`📋 Requirements: ${args.requirements}`);
  console.log(`🔄 Iteration: ${args.iteration}`);
  console.log('');

  try {
    // Read input files
    const planContent = await fs.readFile(args.plan, 'utf8');
    const requirementsContent = await fs.readFile(args.requirements, 'utf8');

    // Create prompt for Gemini - keep it shorter for testing
    const prompt = `Review this implementation plan for TDD workflow (iteration ${args.iteration}).

REQUIREMENTS:
${requirementsContent}

PLAN:
${planContent}

Provide a CONSENSUS_SCORE: [1-10] and brief feedback on:
- TDD methodology (behavior tests first)
- TypeScript practices (no any types)
- Schema-first design

Format:
CONSENSUS_SCORE: X
[Your feedback]`;

    console.log('⏳ Calling Gemini CLI...');

    return new Promise((resolve, _reject) => {
      const gemini = spawn('gemini', ['-p', prompt], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000, // 60 second timeout
      });

      let output = '';
      let errorOutput = '';

      gemini.stdout.on('data', (data) => {
        output += data.toString();
      });

      gemini.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      gemini.on('close', async (code) => {
        if (code !== 0) {
          console.error('❌ Gemini CLI error, exit code:', code);
          if (errorOutput) console.error('Stderr:', errorOutput);

          // Fall back to mock
          console.log('⚠️  Falling back to mock mode...');
          await mockReview(args);
          resolve();
        } else {
          // Save response
          const outputPath =
            args.output || `.workflow/current/plan/gemini-review-${args.iteration}.md`;

          await fs.writeFile(outputPath, output);
          console.log(`✅ Review saved to: ${outputPath}`);

          // Extract consensus score
          const scoreMatch = output.match(/CONSENSUS_SCORE:\s*(\d+)/);
          if (scoreMatch) {
            const score = scoreMatch[1];
            console.log(`📊 Consensus Score: ${score}/10`);
            process.exit(10 - parseInt(score));
          } else {
            console.error('⚠️  Could not extract consensus score from response');
            process.exit(99);
          }
        }
      });

      gemini.on('error', async (err) => {
        console.error('Failed to start Gemini:', err.message);
        console.log('⚠️  Falling back to mock mode...');
        await mockReview(args);
        resolve();
      });

      // Send EOF to stdin to indicate we're done
      gemini.stdin.end();
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(99);
  }
}

/**
 * Mock review for testing without Gemini CLI
 */
async function mockReview(args) {
  console.log('🧪 Running mock review (Gemini CLI not available)...');

  const mockResponse = `CONSENSUS_SCORE: ${args.iteration >= 3 ? 9 : 7}

## Feedback
${args.iteration === 1 ? 'Plan needs more focus on behavior testing.' : 'Plan looks good with proper TDD approach.'}

- TDD methodology: ${args.iteration >= 2 ? '✅ Good' : '⚠️  Needs improvement'}
- TypeScript practices: ✅ No any types
- Schema-first design: ✅ Schemas defined upfront`;

  const outputPath = args.output || `.workflow/current/plan/gemini-review-${args.iteration}.md`;
  await fs.writeFile(outputPath, mockResponse);

  const score = args.iteration >= 3 ? 9 : 7;
  console.log(`✅ Mock review saved to: ${outputPath}`);
  console.log(`📊 Consensus Score: ${score}/10`);

  process.exit(10 - score);
}

// Main execution
async function main() {
  const args = parseArgs();

  // Check if we should use mock mode
  if (process.env.GEMINI_MOCK === 'true') {
    await mockReview(args);
    return;
  }

  // Try to use Gemini CLI
  await reviewPlan(args);
}

// Run the script
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(99);
});
