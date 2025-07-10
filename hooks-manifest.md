# TDD Workflow Hooks Manifest

This document describes all active hooks enforcing TDD principles in this project.

## Pre-Write Validations

### check-tdd-compliance.py

- **Trigger**: Before any Write/Edit/MultiEdit to `/src/` files
- **Action**: Blocks implementation without corresponding test
- **Exception**: Allows writes during workflow implementation phase

### validate-schema-first.js

- **Trigger**: Before any Write/Edit to TypeScript files
- **Action**: Blocks type definitions not derived from Zod schemas
- **Enforcement**: `type X = z.infer<typeof XSchema>` pattern

### no-comments-validator.py

- **Trigger**: Before any Write/Edit to TypeScript files
- **Action**: Blocks code containing comments
- **Exception**: JSDoc for public APIs

### enforce-test-location.py

- **Trigger**: Before Write operations
- **Action**: Ensures test files go in `/tests/` directory

## Post-Write Actions

### auto-test-runner.sh

- **Trigger**: After any Write/Edit/MultiEdit to `/src/` files
- **Action**: Automatically runs corresponding test file

### format-typescript.sh

- **Trigger**: After any Write/Edit/MultiEdit to .ts/.svelte files
- **Action**: Runs Prettier and ESLint fix

### workflow-progress-notify.sh

- **Trigger**: After writes to implementation-plan.md
- **Action**: Shows completion progress notification

## Session Controls

### check-tests-passing.py

- **Trigger**: When Claude Code session tries to stop
- **Action**: Blocks stop if tests are failing

## Notifications

### tdd-workflow-notifier.py

- **Trigger**: On Claude Code notifications
- **Action**: Custom notifications for workflow events

## Disabling Hooks

To disable hooks temporarily:

1. Comment out hooks in `~/.claude/settings.json`
2. Restart Claude Code
3. Remember to re-enable for TDD compliance

## Testing Hooks

Test a hook manually:

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"src/test.ts","content":"type X = {}"}}' | python3 ~/.claude/scripts/validate-schema-first.js
```
