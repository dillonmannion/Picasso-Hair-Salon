# Workflow Complete Command

**⚠️ USER-ONLY COMMAND**: This command is designed to be run by users only. Claude should never attempt to execute this command via Bash. When all components are implemented and tests are passing, inform the user they can run this command to finalize the workflow.

Finalize the workflow, generate reports, and archive all artifacts.

## Command: /workflow-complete

## Aliases: /wf, /finalize

## Purpose

Formally close a completed workflow by running final validations, generating documentation, and archiving all process artifacts.

## For Claude

When working within the TDD workflow:
- Do NOT attempt to run this command via Bash
- When all components are implemented and tests pass, inform the user they can finalize with this command
- Focus on completing the TDD cycle for all components first
- Ensure all tests are passing before suggesting workflow completion

## Implementation

### 1. Pre-Completion Validation

```bash
# Verify the workflow is in the 'complete' phase
# ... (logic remains the same) ...

# Run final test suite on the entire project
echo "🧪 Running final validation suite..."
if ! pnpm test; then
    echo "❌ Final test suite failed. Please fix tests before completing."
    exit 1
fi
echo "✅ All tests passing."

if ! pnpm run lint; then
    echo "⚠️  Linting issues found. Please review."
fi
echo "✅ Code style check passed."
```

### 2. Generate Final Summary Report

```bash
feature=$(grep "^feature:" .workflow/state.yaml | cut -d'"' -f2)
archive_dir="completed/$(date +%Y-%m-%d-%H%M)-${feature}"
mkdir -p "$archive_dir"

echo "📝 Generating implementation summary..."
cat > "$archive_dir/IMPLEMENTATION-SUMMARY.md" << EOF
# Implementation Summary: $feature

## Overview
- **Completion Date:** $(date)
- **Archive Location:** $archive_dir

## Implemented Components
$(awk -F'"' '/name:/ {print "- "$2}' .workflow/current/plan/implementation-plan.md)

## Files Created/Modified
$(git status --porcelain | awk '{print "- " $2}')

## Final Validation
- All project tests: ✅ Passing
- Linter: ✅ Passing
EOF
```

### 3. Archive Workflow Artifacts

```bash
echo "📦 Archiving workflow artifacts to $archive_dir..."

# The production code is already in src/ and tests/, so we just archive the 'process' files.
cp -r .workflow/current/* "$archive_dir/"
cp .workflow/state.yaml "$archive_dir/workflow-state-at-completion.yaml"
```

### 4. Cleanup and Final Git Commit

```bash
echo "🧹 Cleaning up working directory..."
rm -rf .workflow

# Final commit of all changes
echo "📝 Committing final feature..."
git add .
git commit -m "feat($feature): complete feature via TDD workflow

All components implemented and tests are passing.
Workflow artifacts archived to: $archive_dir"

# Final output message
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 WORKFLOW COMPLETED SUCCESSFULLY                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Feature '$feature' is complete and committed."
echo "📦 Process artifacts archived to: $archive_dir"
echo "🚀 The feature is ready for pull request and deployment."
echo ""
echo "Start a new workflow with: /workflow-init <feature>"
```
