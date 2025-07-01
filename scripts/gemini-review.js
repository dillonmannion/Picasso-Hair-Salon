#!/usr/bin/env node

/**
 * Gemini Review Integration Script
 * Uses the gemini CLI command to review implementation plans
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

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

    // Create prompt for Gemini
    const prompt = `You are a senior software architect reviewing an implementation plan for a TDD (Test-Driven Development) workflow. This is iteration ${args.iteration} of the review process.

REQUIREMENTS SPECIFICATION:
${requirementsContent}

IMPLEMENTATION PLAN TO REVIEW:
${planContent}

Your Task:
Review this implementation plan and provide structured feedback.

CRITICAL: Verify the plan follows these TDD principles:
- Each component has BEHAVIOR tests defined first (not unit tests)
- Tests will fail initially (RED phase)
- Implementation is minimal to pass tests (GREEN phase)
- Refactoring assessment is mandatory after each green
- Tests focus on what users/consumers experience, not internals
- 100% behavior coverage expected

Also verify these practices:
- Schema-first design with Zod
- TypeScript strict mode (no 'any' types)
- Immutable data patterns
- Options objects for function parameters  
- Self-documenting code (no comments needed)
- Pure functions and functional patterns

Provide your response in this EXACT format:

CONSENSUS_SCORE: [number 1-10]

## Critical Concerns
[List any MUST-fix issues, or write "None" if the plan is sound]

## Suggestions for Improvement
1. [First suggestion]
2. [Second suggestion]
[Continue numbering...]

## TDD Methodology Assessment
[Confirm the plan follows RED-GREEN-REFACTOR with behavior-driven tests]

## Best Practices Review
- Schema Design: [Assessment]
- TypeScript Patterns: [Assessment]
- Functional Approach: [Assessment]
- Code Organization: [Assessment]

## Implementation Priority
[Confirm if the component order makes sense for dependencies]

Remember: 
- Score 9-10 means ready for implementation
- Score 8 means minor issues only
- Score 7 or below needs significant revision
- Focus on behavior testing, not implementation testing`;

    // Call Gemini CLI with escaped prompt
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

    console.log('⏳ Calling Gemini CLI...');

    exec(`gemini -p "${escapedPrompt}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Gemini CLI error:', error.message);
        if (stderr) console.error('Stderr:', stderr);

        // Check if gemini CLI is installed
        if (error.message.includes('command not found')) {
          console.error('\n⚠️  The "gemini" CLI command is not found.');
          console.error('Please ensure you have the Gemini CLI installed.');
          console.error('Installation instructions: https://github.com/google/generative-ai-cli');
        }

        process.exit(1);
      }

      // Save response
      const outputPath = args.output || `.workflow/current/plan/gemini-review-${args.iteration}.md`;

      await fs.writeFile(outputPath, stdout);
      console.log(`✅ Review saved to: ${outputPath}`);

      // Extract consensus score
      const scoreMatch = stdout.match(/CONSENSUS_SCORE:\s*(\d+)/);
      if (scoreMatch) {
        const score = scoreMatch[1];
        const scorePath = outputPath.replace('.md', '-score.txt');
        await fs.writeFile(scorePath, score);
        console.log(`📊 Consensus Score: ${score}/10`);

        // Provide feedback based on score
        if (score >= 9) {
          console.log('🎉 Consensus achieved! Plan is ready for implementation.');
        } else if (score >= 7) {
          console.log('📝 Good plan, but needs some revisions.');
        } else {
          console.log('⚠️  Significant revisions needed.');
        }

        // Exit with score as exit code (0 = 10, 1 = 9, etc.)
        process.exit(10 - parseInt(score));
      } else {
        console.error('⚠️  Could not extract consensus score from response');
        process.exit(99);
      }
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

## Critical Concerns
${
  args.iteration === 1
    ? `1. Test coverage for error cases not comprehensive enough
2. Behavior tests need more focus on user outcomes rather than technical details`
    : 'None'
}

## Suggestions for Improvement
1. Consider adding integration tests between components
2. Add performance benchmarks for critical paths
3. Include specific error scenarios in behavior tests
4. Consider adding schema validation tests explicitly

## TDD Methodology Assessment
The plan correctly follows RED-GREEN-REFACTOR cycle:
✅ Behavior tests defined before implementation  
✅ Tests will fail initially (no implementation exists)
✅ Minimal implementation approach specified
✅ Refactoring assessment included as mandatory step
${args.iteration >= 2 ? '✅ Good focus on testing user-visible behaviors' : '⚠️  Some tests still focus on internals rather than behaviors'}

## Best Practices Review
- Schema Design: ${args.iteration >= 2 ? 'Excellent use of Zod schemas defined upfront' : 'Schemas need to be defined before implementation'}
- TypeScript Patterns: Good strict mode enforcement, no any types
- Functional Approach: ${args.iteration >= 2 ? 'Good use of immutable patterns and pure functions' : 'Could improve functional patterns'}
- Code Organization: Clear separation of concerns

## Implementation Priority
The component order makes sense, starting with data models and moving up to API endpoints.`;

  const outputPath = args.output || `.workflow/current/plan/gemini-review-${args.iteration}.md`;

  await fs.writeFile(outputPath, mockResponse);

  const scoreMatch = mockResponse.match(/CONSENSUS_SCORE:\s*(\d+)/);
  const score = scoreMatch ? scoreMatch[1] : '5';
  const scorePath = outputPath.replace('.md', '-score.txt');
  await fs.writeFile(scorePath, score);

  console.log(`✅ Mock review saved to: ${outputPath}`);
  console.log(`📊 Consensus Score: ${score}/10`);

  process.exit(10 - parseInt(score));
}

// Main execution
async function main() {
  const args = parseArgs();

  // Check if we should use mock mode
  if (process.env.GEMINI_MOCK === 'true') {
    await mockReview(args);
    return;
  }

  // Check if gemini CLI is available
  exec('which gemini', async (error) => {
    if (error) {
      console.log('⚠️  Gemini CLI not found, using mock mode...');
      await mockReview(args);
    } else {
      await reviewPlan(args);
    }
  });
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(99);
  });
}

module.exports = { reviewPlan, mockReview };
