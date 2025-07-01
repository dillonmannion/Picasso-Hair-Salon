# Workflow Status Command

Display comprehensive workflow status with clear next actions.

## Command: /workflow-status

## Aliases: /ws, /status

## Purpose

Show current workflow state, progress, and available actions in a clear, actionable format.

## Implementation

### 1. Check for Active Workflow

```bash
if [ ! -f ".workflow/state.yaml" ]; then
  echo "📭 No active workflow"
  echo ""
  echo "Recent completed workflows:"
  ls -1dt completed/*/ 2>/dev/null | head -5 | while read dir; do
    feature=$(basename "$dir" | cut -d'-' -f3-)
    date=$(basename "$dir" | cut -d'-' -f1-2)
    echo "  - $feature (completed $date)"
  done
  echo ""
  echo "To start a new workflow: /workflow-init <feature-description>"
  exit 0
fi
```

### 2. Parse Current State

```bash
# Extract state values
feature=$(grep "^feature:" .workflow/state.yaml | cut -d'"' -f2)
phase=$(grep "^phase:" .workflow/state.yaml | cut -d'"' -f2)
subphase=$(grep "^subphase:" .workflow/state.yaml | cut -d'"' -f2)
status=$(grep "^status:" .workflow/state.yaml | cut -d'"' -f2)
started=$(grep "^started:" .workflow/state.yaml | cut -d'"' -f2)

# Calculate duration
duration=$(calculate_duration "$started" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")
```

### 3. Display Header

```
╔════════════════════════════════════════════════════════════════╗
║                    WORKFLOW STATUS                              ║
╚════════════════════════════════════════════════════════════════╝

Feature: $feature
Status:  $status
Phase:   $phase > $subphase
Started: $duration ago
```

### 4. Display Phase-Specific Progress

#### Requirements Phase

```bash
if [ "$phase" = "requirements" ]; then
  echo ""
  echo "📋 REQUIREMENTS GATHERING"
  echo "━━━━━━━━━━━━━━━━━━━━━━━"

  case "$subphase" in
    "discovery")
      questions_answered=$(grep -c "Your answer: \(yes\|no\|idk\)" .workflow/current/requirements/discovery-questions.md 2>/dev/null || echo 0)
      echo "Discovery Questions: $questions_answered/5 answered"

      if [ $questions_answered -lt 5 ]; then
        next_q=$((questions_answered + 1))
        echo ""
        echo "Next question preview:"
        sed -n "/## Q${next_q}:/,/^##/p" .workflow/current/requirements/discovery-questions.md | head -3
      fi
      ;;

    "context")
      echo "🤖 Autonomous context analysis in progress..."
      echo ""
      echo "Activities:"
      echo "  ✓ Analyzing project structure"
      echo "  ✓ Querying context7 for best practices"
      echo "  ✓ Searching for similar patterns"
      echo "  → Generating technical questions"
      ;;

    "specification")
      tech_answered=$(grep -c "Your answer: \(yes\|no\|idk\)" .workflow/current/requirements/technical-questions.md 2>/dev/null || echo 0)
      echo "Technical Questions: $tech_answered/5 answered"

      if [ $tech_answered -eq 5 ]; then
        echo "✅ Ready to generate specification"
      fi
      ;;
  esac
fi
```

#### Planning Phase

```bash
if [ "$phase" = "planning" ]; then
  echo ""
  echo "📐 PLANNING & CONSENSUS"
  echo "━━━━━━━━━━━━━━━━━━━━━"

  iteration=$(grep "iteration_count:" .workflow/state.yaml | cut -d' ' -f2)
  gemini_reviews=$(grep "gemini_reviews:" .workflow/state.yaml | cut -d' ' -f2)

  echo "Iteration: $iteration"
  echo "Gemini Reviews: $gemini_reviews"

  case "$subphase" in
    "initial")
      echo "Status: Generating implementation plan"
      ;;

    "review")
      echo "Status: Awaiting Gemini review"
      if [ -f ".workflow/current/plan/gemini-review-$iteration.md" ]; then
        score=$(grep "CONSENSUS_SCORE:" .workflow/current/plan/gemini-review-$iteration.md | cut -d' ' -f2)
        echo "Latest Score: $score/10"
      fi
      ;;

    "consensus")
      echo "Status: ✅ Consensus achieved!"
      echo "Ready to begin TDD implementation"
      ;;
  esac
fi
```

#### Implementation Phase

```bash
if [ "$phase" = "implementation" ]; then
  echo ""
  echo "🔨 TDD IMPLEMENTATION"
  echo "━━━━━━━━━━━━━━━━━━━━"

  test_cycle=$(grep "test_cycle:" .workflow/state.yaml | cut -d' ' -f2)
  completed_files=$(grep -c "  -" .workflow/state.yaml | grep -A20 "completed_files:")
  total_components=$(count_total_components_from_plan)

  echo "Progress: Component $test_cycle/$total_components"
  echo ""

  # Progress bar
  draw_progress_bar $test_cycle $total_components

  echo ""
  case "$subphase" in
    "test")
      echo "🔴 RED Phase: Writing failing test"
      echo "Current component: $(get_current_component_name)"
      ;;

    "code")
      echo "🟢 GREEN Phase: Writing minimal code"
      echo "Test written, implementing to pass"
      ;;

    "verify")
      echo "✅ VERIFY Phase: Running tests"
      echo "Checking if implementation passes test"
      ;;
  esac

  # Show completed and pending files
  if [ $completed_files -gt 0 ]; then
    echo ""
    echo "Completed:"
    grep -A$completed_files "completed_files:" .workflow/state.yaml | grep "  -" | head -3
    if [ $completed_files -gt 3 ]; then
      echo "  ... and $((completed_files - 3)) more"
    fi
  fi
fi
```

### 5. Display Checkpoints

```bash
echo ""
echo "✓ CHECKPOINTS"
echo "━━━━━━━━━━━━━"

# Read all checkpoints
while IFS=: read -r checkpoint value; do
  checkpoint=$(echo $checkpoint | xargs)
  value=$(echo $value | xargs)

  if [ "$value" = "true" ]; then
    icon="✅"
  else
    icon="⬜"
  fi

  case "$checkpoint" in
    "requirements_complete")
      echo "$icon Requirements specification complete"
      ;;
    "context_validated")
      echo "$icon Context7 validation complete"
      ;;
    "plan_consensus")
      echo "$icon Planning consensus achieved (≥9/10)"
      ;;
    "implementation_started")
      echo "$icon Implementation started"
      ;;
    "tests_passing")
      echo "$icon All tests passing"
      ;;
    "implementation_complete")
      echo "$icon Implementation complete"
      ;;
  esac
done < <(grep -A10 "^checkpoints:" .workflow/state.yaml | grep "  " | grep -v "^checkpoints:")
```

### 6. Display Next Actions

```bash
echo ""
echo "➡️  NEXT ACTIONS"
echo "━━━━━━━━━━━━━━━"

case "$status" in
  "active")
    echo "Continue workflow: /workflow-continue"
    if [ "$phase" != "requirements" ] || [ "$subphase" != "context" ]; then
      echo "Pause workflow:    /workflow-pause"
    fi
    ;;

  "paused")
    echo "Resume workflow:   /workflow-continue"
    echo "Abort workflow:    /workflow-abort"
    ;;

  "blocked")
    reason=$(grep "blocked_reason:" .workflow/state.yaml | cut -d'"' -f2)
    echo "⚠️  Workflow blocked: $reason"
    echo "Resolve issue and use: /workflow-continue"
    ;;

  "complete")
    echo "Finalize & archive: /workflow-complete"
    ;;
esac

echo "View this status:  /workflow-status"
```

### 7. Show Contextual Help

```bash
echo ""
echo "💡 CURRENT CONTEXT"
echo "━━━━━━━━━━━━━━━━"

case "$phase.$subphase" in
  "requirements.discovery")
    echo "You're answering basic questions about your feature."
    echo "Answer yes/no/idk - defaults will be used for 'idk'."
    ;;

  "requirements.context")
    echo "Claude is analyzing your codebase automatically."
    echo "This will complete without your input."
    ;;

  "requirements.specification")
    echo "You're answering technical questions based on your codebase."
    echo "These questions are more specific to implementation."
    ;;

  "planning.initial")
    echo "Claude is creating a TDD implementation plan."
    echo "Each component will have test-first instructions."
    ;;

  "planning.review")
    echo "Gemini is reviewing the plan for best practices."
    echo "Iterations continue until consensus ≥9/10."
    ;;

  "implementation.test")
    echo "Time to write a FAILING test for the next component."
    echo "The test should fail because the code doesn't exist yet."
    ;;

  "implementation.code")
    echo "Write the MINIMAL code to make the test pass."
    echo "Don't add extra features - just make it green!"
    ;;

  "implementation.verify")
    echo "Running tests to ensure your implementation works."
    echo "If tests pass, we move to the next component."
    ;;

  "complete.review")
    echo "All implementation is done! Final checks running."
    echo "Review the summary before archiving."
    ;;
esac
```

### 8. Display File Locations

```bash
if [ "$VERBOSE" = "true" ] || [ "$1" = "-v" ]; then
  echo ""
  echo "📁 FILE LOCATIONS"
  echo "━━━━━━━━━━━━━━━"
  echo "State:          .workflow/state.yaml"
  echo "Requirements:   .workflow/current/requirements/"
  echo "Plan:           .workflow/current/plan/"
  echo "Tests:          .workflow/current/tests/"
  echo "Implementation: .workflow/current/implementation/"
fi
```

## Helper Functions

```bash
calculate_duration() {
  # Calculate human-readable duration
  # Input: start_time, end_time (ISO format)
  # Output: "2 hours", "3 days", etc.
}

draw_progress_bar() {
  # Draw ASCII progress bar
  # Input: current, total
  # Output: [████████░░░░░░░░] 50%
}

count_total_components_from_plan() {
  # Parse implementation plan for total components
}

get_current_component_name() {
  # Extract current component name from plan
}
```

## Visual Examples

### Active Requirements Phase

```
╔════════════════════════════════════════════════════════════════╗
║                    WORKFLOW STATUS                              ║
╚════════════════════════════════════════════════════════════════╝

Feature: user-authentication
Status:  active
Phase:   requirements > discovery
Started: 15 minutes ago

📋 REQUIREMENTS GATHERING
━━━━━━━━━━━━━━━━━━━━━━━
Discovery Questions: 3/5 answered

Next question preview:
## Q4: Should this feature work offline or in low-connectivity scenarios?
**Default if unknown:** No

✓ CHECKPOINTS
━━━━━━━━━━━━━
⬜ Requirements specification complete
⬜ Context7 validation complete
⬜ Planning consensus achieved (≥9/10)
⬜ Implementation started
⬜ All tests passing
⬜ Implementation complete

➡️  NEXT ACTIONS
━━━━━━━━━━━━━━━
Continue workflow: /workflow-continue
Pause workflow:    /workflow-pause
View this status:  /workflow-status

💡 CURRENT CONTEXT
━━━━━━━━━━━━━━━━
You're answering basic questions about your feature.
Answer yes/no/idk - defaults will be used for 'idk'.
```

### Active Implementation Phase

```
╔════════════════════════════════════════════════════════════════╗
║                    WORKFLOW STATUS                              ║
╚════════════════════════════════════════════════════════════════╝

Feature: user-authentication
Status:  active
Phase:   implementation > test
Started: 2 hours ago

🔨 TDD IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━
Progress: Component 3/7

[████████████░░░░░░░░░░░░] 43%

🔴 RED Phase: Writing failing test
Current component: AuthMiddleware

Completed:
  - src/auth/user.model.ts
  - src/auth/auth.service.ts

✓ CHECKPOINTS
━━━━━━━━━━━━━
✅ Requirements specification complete
✅ Context7 validation complete
✅ Planning consensus achieved (≥9/10)
✅ Implementation started
⬜ All tests passing
⬜ Implementation complete

➡️  NEXT ACTIONS
━━━━━━━━━━━━━━━
Continue workflow: /workflow-continue
Pause workflow:    /workflow-pause
View this status:  /workflow-status

💡 CURRENT CONTEXT
━━━━━━━━━━━━━━━━
Time to write a FAILING test for the next component.
The test should fail because the code doesn't exist yet.
```

## Error Handling

### Corrupted State File

```
❌ State file appears corrupted
Attempting to recover from backup...
If this persists, you may need to:
1. Check .workflow/state.yaml.backup
2. Run /workflow-abort to start fresh
```

### Missing Required Files

```
⚠️  Missing expected files for current phase
Expected: .workflow/current/requirements/discovery-questions.md
This might indicate an interrupted operation.
Try: /workflow-continue to regenerate
```
