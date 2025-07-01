import { runPreCommitChecks } from './pre-commit-utils.js';

// Run if called directly
if (process.argv[1] === import.meta.url.slice(7)) {
  runPreCommitChecks().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}