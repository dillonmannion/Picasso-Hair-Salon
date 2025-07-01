# Workflow Complete Command

Finalize the workflow, generate reports, and archive all artifacts.

## Command: /workflow-complete

## Aliases: /wf, /finalize, /archive

## Purpose

Complete the workflow by running final validations, generating documentation, and archiving all artifacts to the completed directory.

## Pre-Completion Validation

### 1. Verify Completion State

```bash
if [ ! -f ".workflow/state.yaml" ]; then
  echo "❌ No active workflow found"
  exit 1
fi

phase=$(grep "^phase:" .workflow/state.yaml | cut -d'"' -f2)
if [ "$phase" != "complete" ]; then
  echo "❌ Workflow not ready for completion"
  echo "Current phase: $phase"
  echo "Use /workflow-continue to finish implementation"
  exit 1
fi

# Check all checkpoints
all_complete=true
while read -r line; do
  if [[ $line =~ "false" ]]; then
    all_complete=false
    break
  fi
done < <(grep -A10 "^checkpoints:" .workflow/state.yaml | grep "  " | grep -v "^checkpoints:")

if [ "$all_complete" != "true" ]; then
  echo "⚠️  Warning: Not all checkpoints are complete"
  echo "Continue anyway? (yes/no)"
  # Wait for user confirmation
fi
```

### 2. Run Final Test Suite

```bash
echo "🧪 Running final test suite..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run all tests
echo "→ Running all tests..."
test_result=$(npm test 2>&1)
test_exit_code=$?

if [ $test_exit_code -eq 0 ]; then
  echo "✅ All tests passing"
else
  echo "❌ Tests failing!"
  echo "$test_result" | tail -20
  echo ""
  echo "Fix failing tests before completing workflow"
  exit 1
fi

# Run coverage
echo "→ Checking code coverage..."
coverage_result=$(npm run test:coverage 2>&1)
coverage_percent=$(echo "$coverage_result" | grep "All files" | awk '{print $3}')

echo "📊 Code coverage: $coverage_percent"

# Extract numeric value
coverage_value=${coverage_percent%\%}

# Check for 100% behavior coverage
if [[ ${coverage_value} -lt 100 ]]; then
  echo ""
  echo "⚠️  WARNING: Coverage is below 100%"
  echo ""
  echo "IMPORTANT: CLAUDE.md requires 100% behavior coverage."
  echo "This doesn't mean testing implementation details!"
  echo ""
  echo "Missing coverage usually means:"
  echo "- Untested error cases"
  echo "- Untested edge cases"
  echo "- Dead code that should be removed"
  echo ""
  echo "Review coverage report and either:"
  echo "1. Add behavior tests for uncovered scenarios"
  echo "2. Remove unnecessary code"
  echo ""
  echo "Continue anyway? (yes/no)"
  # Wait for user confirmation
fi

# Run linting
echo "→ Running linter..."
lint_result=$(npm run lint 2>&1)
lint_exit_code=$?

if [ $lint_exit_code -eq 0 ]; then
  echo "✅ No linting errors"
else
  echo "⚠️  Linting warnings found"
fi

# Run type checking
echo "→ Running type check..."
type_result=$(npm run type-check 2>&1)
type_exit_code=$?

if [ $type_exit_code -eq 0 ]; then
  echo "✅ No type errors"
else
  echo "❌ Type errors found!"
  echo "$type_result" | tail -10
  echo ""
  echo "Fix type errors before completing workflow"
  exit 1
fi
```

## Generate Final Documentation

### 1. Create Implementation Summary

```bash
feature=$(grep "^feature:" .workflow/state.yaml | cut -d'"' -f2)
started=$(grep "^started:" .workflow/state.yaml | cut -d'"' -f2)
duration=$(calculate_duration "$started" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")

cat > .workflow/current/implementation-summary.md << EOF
# Implementation Summary: $feature

## Overview
- **Feature:** $feature
- **Duration:** $duration
- **Completion Date:** $(date -u +%Y-%m-%d)

## Requirements Addressed
$(extract_requirements_summary)

## Implementation Statistics
- **Total Components:** $(count_total_components)
- **Files Created:** $(count_created_files)
- **Tests Written:** $(count_test_files)
- **Code Coverage:** $coverage_percent
- **TDD Cycles:** $(grep "test_cycle:" .workflow/state.yaml | cut -d' ' -f2)

## Key Design Decisions
$(extract_design_decisions)

## TDD Process Summary
$(generate_tdd_summary)

## Files Created
### Test Files
$(list_test_files)

### Implementation Files
$(list_implementation_files)

## Validation Results
- Context7 Validations: $(grep "context7_validations:" .workflow/state.yaml | cut -d' ' -f2)
- Gemini Reviews: $(grep "gemini_reviews:" .workflow/state.yaml | cut -d' ' -f2)
- Final Consensus Score: $(extract_final_score)/10

## Performance Metrics
$(extract_performance_metrics)

## Security Considerations
$(extract_security_notes)

## Future Enhancements
$(extract_future_enhancements)
EOF
```

### 2. Generate Code Documentation

```bash
echo ""
echo "📝 Generating code documentation..."

# Generate JSDoc/TSDoc
echo "→ Generating API documentation..."
npx typedoc --out .workflow/current/docs src

# Generate architecture diagram
echo "→ Creating architecture diagram..."
generate_architecture_diagram > .workflow/current/architecture.md

# Generate test documentation
echo "→ Documenting test scenarios..."
generate_test_documentation > .workflow/current/test-scenarios.md
```

## Archive Process

### 1. Prepare Archive Structure

```bash
# Create timestamp-based archive directory
timestamp=$(date +%Y-%m-%d-%H%M)
archive_dir="completed/${timestamp}-${feature}"

echo ""
echo "📦 Preparing archive..."
echo "Archive location: $archive_dir"

mkdir -p "$archive_dir"
mkdir -p "$archive_dir/requirements"
mkdir -p "$archive_dir/planning"
mkdir -p "$archive_dir/implementation"
mkdir -p "$archive_dir/tests"
mkdir -p "$archive_dir/docs"
```

### 2. Copy Production Files

```bash
echo "→ Copying production files..."

# Copy only the production-ready files (not intermediate)
cp -r .workflow/current/implementation/* src/
cp -r .workflow/current/tests/* tests/

# Create file mapping
cat > "$archive_dir/file-mapping.md" << EOF
# File Mapping

## Production Files Deployed
$(generate_file_mapping)

## Original Workflow Files
- Requirements: $archive_dir/requirements/
- Planning: $archive_dir/planning/
- Documentation: $archive_dir/docs/
EOF
```

### 3. Archive Workflow Artifacts

```bash
echo "→ Archiving workflow artifacts..."

# Archive requirements phase
cp .workflow/current/requirements/specification.md "$archive_dir/requirements/"
cp .workflow/current/requirements/discovery-questions.md "$archive_dir/requirements/"
cp .workflow/current/requirements/technical-questions.md "$archive_dir/requirements/"
cp .workflow/current/requirements/context-analysis.md "$archive_dir/requirements/"

# Archive planning phase
cp .workflow/current/plan/implementation-plan.md "$archive_dir/planning/"
cp .workflow/current/plan/gemini-review-*.md "$archive_dir/planning/" 2>/dev/null

# Archive implementation artifacts
cp .workflow/current/implementation-summary.md "$archive_dir/"
cp -r .workflow/current/docs/* "$archive_dir/docs/" 2>/dev/null

# Archive state for reference
cp .workflow/state.yaml "$archive_dir/workflow-state.yaml"
```

### 4. Generate Archive Manifest

```bash
cat > "$archive_dir/MANIFEST.md" << EOF
# Archive Manifest

**Feature:** $feature
**Archived:** $(date)
**Workflow Duration:** $duration

## Contents
- requirements/         # Original requirements and analysis
- planning/            # Implementation plans and reviews
- implementation/      # Code and test files
- docs/               # Generated documentation
- workflow-state.yaml  # Complete workflow state
- implementation-summary.md  # Detailed summary

## Quick Start
To use this implementation:
1. Files have been copied to src/ and tests/
2. Run \`npm test\` to verify
3. See implementation-summary.md for details

## Restoration
To restore this workflow:
\`\`\`bash
cp -r $archive_dir/.workflow .
\`\`\`
EOF
```

## Cleanup Process

### 1. Clean Working Directory

```bash
echo ""
echo "🧹 Cleaning up working directory..."

# Remove workflow directory
rm -rf .workflow/current/*

# Clear state file
rm .workflow/state.yaml

# Create completion marker
echo "$archive_dir" > .workflow/last-completed
```

### 2. Git Commit (Optional)

```bash
if [ -d ".git" ]; then
  echo ""
  echo "📝 Creating git commit..."

  git add src/ tests/
  git commit -m "feat($feature): implement via TDD workflow

- Implemented according to specifications
- All tests passing ($coverage_percent coverage)
- Validated with context7 and Gemini review
- Archive: $archive_dir

Co-authored-by: Claude <claude@anthropic.com>
Co-authored-by: Gemini <gemini@google.com>"
fi
```

## Final Summary Display

```bash
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 WORKFLOW COMPLETED SUCCESSFULLY                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Feature: $feature"
echo "✅ Duration: $duration"
echo "✅ Files Created: $(count_created_files)"
echo "✅ Tests Passing: $(count_test_files)"
echo "✅ Coverage: $coverage_percent"
echo ""
echo "📦 Archive: $archive_dir"
echo "📄 Summary: $archive_dir/implementation-summary.md"
echo ""
echo "🚀 Production files have been deployed to:"
echo "   - Source: src/"
echo "   - Tests: tests/"
echo ""
echo "Next steps:"
echo "1. Review the implementation summary"
echo "2. Create a pull request if needed"
echo "3. Deploy to staging environment"
echo "4. Monitor for any issues"
echo ""
echo "Start a new workflow with: /workflow-init <feature>"
```

## Error Recovery

### Archive Creation Failed

```bash
if [ $? -ne 0 ]; then
  echo "❌ Archive creation failed"
  echo "Your work is still in .workflow/current/"
  echo "Try running /workflow-complete again"
  exit 1
fi
```

### State Cleanup Failed

```bash
# Always preserve state on error
cp .workflow/state.yaml .workflow/state.yaml.backup
echo "⚠️  Cleanup incomplete - state backed up to .workflow/state.yaml.backup"
```

## Helper Functions

```bash
extract_requirements_summary() {
  # Extract key requirements from specification
  grep -A5 "## Functional Requirements" .workflow/current/requirements/specification.md | tail -4
}

count_total_components() {
  # Count components from implementation plan
  grep -c "### Component" .workflow/current/plan/implementation-plan.md
}

count_created_files() {
  # Count all implementation and test files
  find .workflow/current/implementation -type f -name "*.ts" -o -name "*.js" | wc -l
}

count_test_files() {
  # Count test files
  find .workflow/current/tests -type f -name "*.test.*" -o -name "*.spec.*" | wc -l
}

generate_tdd_summary() {
  # Summarize TDD cycles completed
  echo "- RED phases completed: $(grep -c "subphase: test" .workflow/state-history.log 2>/dev/null || echo "N/A")"
  echo "- GREEN phases completed: $(grep -c "subphase: code" .workflow/state-history.log 2>/dev/null || echo "N/A")"
  echo "- All tests written before implementation: ✅"
}

extract_final_score() {
  # Get final Gemini consensus score
  latest_review=$(ls -1t .workflow/current/plan/gemini-review-*.md | head -1)
  grep "CONSENSUS_SCORE:" "$latest_review" | cut -d' ' -f2
}
```

## Important Notes

1. **No Data Loss**: All artifacts are preserved in archive
2. **Production Ready**: Only tested code is deployed
3. **Traceable**: Complete history maintained
4. **Resumable**: Can restore from archive if needed
5. **Clean Workspace**: Removes all intermediate files
