#!/usr/bin/env node

import { runPreCommitChecks } from './pre-commit-utils.js';

const main = async () => {
  try {
    const result = await runPreCommitChecks();
    
    if (!result.success) {
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running pre-commit checks:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}