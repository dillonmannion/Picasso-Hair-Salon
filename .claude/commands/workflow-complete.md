# Workflow Complete Command

**📋 PROMPT COMMAND**: This command prompts Claude to perform workflow completion actions step-by-step. When the user runs `/workflow-complete`, Claude will be prompted to execute each action in sequence.

Finalize the workflow, generate reports, and archive all artifacts.

## Command: /workflow-complete

## Aliases: /wf, /finalize

## Purpose

Formally close a completed workflow by having Claude run final validations, generate documentation, and archive all process artifacts.

## When User Runs This Command

Claude will be prompted to perform the following actions in sequence:

### 1. Pre-Completion Validation

**Claude Action Required:**

- First, verify the workflow is in the 'complete' phase by checking `.workflow/state.yaml`
- Run the final test suite: `pnpm test`
  - **Note**: The `check-tests-passing.py` hook prevents completion with failing tests
  - If tests fail, stop and report the failures to the user
  - If tests pass, continue to next step
- Run the linter: `pnpm run lint`
  - Report any linting issues but continue even if there are warnings
  - **Note**: The `format-typescript.sh` hook should have already formatted code
- Verify all hooks passed during development:
  - Check for any files that might have bypassed TDD
  - Ensure no schema-first violations remain

**Claude Action Required:**

- First, verify the workflow is in the 'complete' phase by checking `.workflow/state.yaml`
- Run the final test suite: `pnpm test`
  - If tests fail, stop and report the failures to the user
  - If tests pass, continue to next step
- Run the linter: `pnpm run lint`
  - Report any linting issues but continue even if there are warnings

### 2. Generate Final Summary Report

**Claude Action Required:**

- Extract the feature name from `.workflow/state.yaml`
- Create an archive directory with timestamp: `completed/YYYY-MM-DD-HHMM-{feature-name}`
- Generate an `IMPLEMENTATION-SUMMARY.md` file in the archive directory containing:
  - Completion date
  - Archive location
  - List of implemented components (from implementation plan)
  - List of files created/modified (from git status)
  - Final validation status
  - Context7 Library References:
    - List all libraries that were looked up via Context7 during the workflow
    - Include the specific topics/patterns that were referenced
    - Note any library versions that were consulted
    - This helps track which documentation versions were used for implementation

### 3. Archive Workflow Artifacts

**Claude Action Required:**

- Copy all files from `.workflow/current/` to the archive directory
- Copy `.workflow/state.yaml` to the archive directory as `workflow-state-at-completion.yaml`
- Preserve the directory structure when copying

### 4. Cleanup and Final Git Commit

**Claude Action Required:**

- Remove the `.workflow` directory entirely
- Stage all changes: `git add .`
- Create a final commit with message:

  ```
  feat({feature-name}): complete feature via TDD workflow

  All components implemented and tests are passing.
  Workflow artifacts archived to: {archive-location}
  ```

- Display completion message to user confirming:
  - Feature is complete and committed
  - Archive location
  - Feature is ready for pull request

## Expected Claude Response Pattern

When the user runs `/workflow-complete`, Claude should:

1. Acknowledge the completion request
2. Execute each action step-by-step, reporting progress
3. Stop if any validation fails
4. Confirm successful completion with archive location
