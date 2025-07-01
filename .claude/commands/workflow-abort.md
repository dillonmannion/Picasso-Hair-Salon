# Workflow Abort Command

**⚠️ USER-ONLY COMMAND**: This command is designed to be run by users only. Claude should never attempt to execute this command via Bash. If a user needs to abort a workflow, they will run this command themselves.

Safely abort the current workflow and optionally archive partial work.

## Command: /workflow-abort

## Aliases: /wa, /abort, /cancel

## Purpose

Safely terminate an active workflow at any stage, preserving work for potential future reference.

## For Claude

When working within the TDD workflow:
- Do NOT attempt to run this command via Bash
- If issues arise that might warrant aborting, inform the user and suggest they run this command
- Continue with TDD work unless the user explicitly aborts the workflow
- Always respect the current workflow state

## Implementation

### 1. Confirm Abort Intent

```bash
if [ ! -f ".workflow/state.yaml" ]; then
  echo "❌ No active workflow to abort."
  exit 0
fi

# Get workflow details
feature=$(grep "^feature:" .workflow/state.yaml | cut -d'"' -f2)
phase=$(grep "^phase:" .workflow/state.yaml | cut -d'"' -f2)

echo "⚠️  ABORT WORKFLOW: $feature?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current Phase: $phase"
echo ""

# Show work that will be affected
if [ "$phase" = "implementation" ]; then
  completed=$(grep -c 'status: "complete"' .workflow/current/plan/implementation-plan.md 2>/dev/null || echo 0)
  total=$(grep -c '## COMPONENT' .workflow/current/plan/implementation-plan.md 2>/dev/null || echo 0)
  echo "Work to be archived/discarded:"
  echo "- Implemented components: $completed / $total"
  echo "- Any uncommitted code in src/ and tests/."
fi

echo ""
echo "Options:"
echo "1. Archive and abort (preserves all work in 'completed/.aborted')"
echo "2. Discard and abort (deletes all workflow artifacts)"
echo "3. Cancel (return to workflow)"
echo ""
read -p "Choose option (1/2/3): " choice

case $choice in
    1) archive_and_abort ;;
    2) discard_and_abort ;;
    3) cancel_abort ;;
    *) echo "Invalid option." ;;
esac
```

### 2. Handle User Choice

#### Option 1: Archive and Abort

```bash
archive_and_abort() {
  echo ""
  echo "📦 Archiving partial work..."

  # Create abort archive
  timestamp=$(date +%Y-%m-%d-%H%M)
  abort_dir="completed/.aborted/${timestamp}-${feature}"
  mkdir -p "$abort_dir"

  # Copy current state
  cp -r .workflow/current/* "$abort_dir/" 2>/dev/null
  cp .workflow/state.yaml "$abort_dir/state-at-abort.yaml"

  # Create abort summary
  cat > "$abort_dir/ABORT-SUMMARY.md" << EOF
# Aborted Workflow

**Feature:** $feature
**Aborted at:** $phase phase
**Date:** $(date)
**Duration:** $duration

## Reason for Abort
[User initiated abort]

## Work Completed
$(summarize_completed_work)

## To Resume
To potentially resume this work:
1. Review the state-at-abort.yaml
2. Copy relevant files to a new workflow
3. Start fresh with: /workflow-init $feature

## Files Preserved
$(find . -type f -name "*.md" -o -name "*.ts" -o -name "*.js" | wc -l) files archived
EOF

  echo "✅ Work archived to: $abort_dir"

  # Clean workspace
  clean_workspace
}
```

#### Option 2: Discard and Abort

```bash
discard_and_abort() {
  echo ""
  echo "🗑️  Discarding all work..."

  # Confirm destruction
  echo "⚠️  This will permanently delete all work. Are you sure? (yes/no)"
  read confirm

  if [ "$confirm" = "yes" ]; then
    # Log the abort
    echo "$(date): Workflow '$feature' discarded at $phase phase" >> .workflow/abort.log

    # Clean workspace
    clean_workspace

    echo "✅ Workflow aborted and work discarded"
  else
    echo "❌ Abort cancelled"
    exit 0
  fi
}
```

#### Option 3: Cancel Abort

```bash
cancel_abort() {
  echo ""
  echo "✅ Abort cancelled - returning to workflow"
  echo "Continue with: /workflow-continue"
  echo "Check status: /workflow-status"
  exit 0
}
```

### 3. Cleanup Function

```bash
clean_workspace() {
  # Remove current work
  rm -rf .workflow/current/*

  # Remove state file
  rm .workflow/state.yaml

  # Create abort marker
  echo "$(date): Aborted '$feature' at $phase" > .workflow/.last-abort
}
```

## Special Cases

### Abort During Context Analysis

```bash
if [ "$phase" = "requirements" ] && [ "$subphase" = "context" ]; then
  echo ""
  echo "⚠️  Note: Context analysis is autonomous and nearly complete."
  echo "Consider waiting for it to finish before aborting."
  echo ""
  echo "Continue with abort? (yes/no)"
fi
```

### Abort During Gemini Review

```bash
if [ "$phase" = "planning" ] && [ "$subphase" = "review" ]; then
  echo ""
  echo "⚠️  Note: Gemini review is in progress."
  echo "The review may complete even after abort."
  echo ""
  echo "Continue with abort? (yes/no)"
fi
```

### Abort with Uncommitted Changes

```bash
if [ -d ".git" ]; then
  uncommitted=$(git status --porcelain | wc -l)
  if [ $uncommitted -gt 0 ]; then
    echo ""
    echo "⚠️  Warning: You have uncommitted changes"
    echo "These may include workflow-generated files"
    echo ""
    echo "Review changes with: git status"
  fi
fi
```

## Post-Abort Summary

```bash
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   WORKFLOW ABORTED                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$choice" = "1" ]; then
  echo "📦 Partial work archived to: $abort_dir"
  echo "📄 See ABORT-SUMMARY.md for details"
  echo ""
fi

echo "🆕 Start a new workflow with: /workflow-init <feature>"
echo "📋 View aborted workflows: ls completed/.aborted/"
echo ""
echo "Thank you for using the TDD workflow system!"
```

## Quick Abort (Force)

For emergency situations, provide force flag:

```bash
# /workflow-abort --force
if [ "$1" = "--force" ]; then
  echo "🚨 Force abort initiated"

  # Minimal archive
  if [ -f ".workflow/state.yaml" ]; then
    feature=$(grep "^feature:" .workflow/state.yaml | cut -d'"' -f2)
    timestamp=$(date +%Y-%m-%d-%H%M)

    # Quick backup
    mkdir -p "completed/.aborted/${timestamp}-${feature}-FORCE"
    cp -r .workflow/* "completed/.aborted/${timestamp}-${feature}-FORCE/" 2>/dev/null
  fi

  # Immediate cleanup
  rm -rf .workflow/current/*
  rm -f .workflow/state.yaml

  echo "✅ Force abort complete"
  exit 0
fi
```

## Helper Functions

```bash
summarize_completed_work() {
  # Summarize what was completed before abort
  case "$phase" in
    "requirements")
      echo "- Discovery questions: $(count_answered_questions)/5"
      echo "- Technical questions: $(count_technical_questions)/5"
      echo "- Context analysis: $(check_if_exists 'context-analysis.md')"
      ;;

    "planning")
      echo "- Initial plan: $(check_if_exists 'implementation-plan.md')"
      echo "- Gemini reviews: $(count_gemini_reviews)"
      echo "- Best score: $(get_best_score)/10"
      ;;

    "implementation")
      echo "- Components completed: $(count_completed_components)"
      echo "- Tests written: $(count_test_files)"
      echo "- Implementation files: $(count_implementation_files)"
      ;;
  esac
}

check_if_exists() {
  local filename=$1
  if [ -f ".workflow/current/*/$filename" ]; then
    echo "✅ Created"
  else
    echo "❌ Not created"
  fi
}
```

## Important Notes

1. **Safe by Default**: Always prompts for confirmation
2. **Work Preservation**: Option to archive partial work
3. **Clean State**: Ensures no orphaned files
4. **Audit Trail**: Logs all aborts
5. **Force Option**: Available for emergencies only
