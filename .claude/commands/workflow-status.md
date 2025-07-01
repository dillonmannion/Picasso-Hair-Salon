# Workflow Status Command

**⚠️ USER-ONLY COMMAND**: This command is designed to be run by users only. Claude should never attempt to execute this command via Bash. When Claude needs to check workflow status, it should read the state files directly.

Display comprehensive workflow status with clear next actions.

## Command: /workflow-status

## Aliases: /ws, /status

## Purpose

Show the current workflow state, progress, and available actions in a clear, actionable format.

## For Claude

When working within the TDD workflow:
- Do NOT attempt to run this command via Bash
- Instead, read `.workflow/state.yaml` and other workflow files directly
- Use the information to understand the current phase and component
- Perform appropriate TDD actions based on the workflow state

## Implementation

### 1. Check for Active Workflow

```bash
if [ ! -f ".workflow/state.yaml" ]; then
  echo "📭 No active workflow."
  echo "   To start a new workflow, use: /workflow-init <feature-description>"
  exit 0
fi
```

### 2. Parse and Display Header

```bash
# Extract state values
feature=$(grep "^feature:" .workflow/state.yaml | cut -d'"' -f2)
phase=$(grep "^phase:" .workflow/state.yaml | cut -d'"' -f2)
started=$(grep "^started:" .workflow/state.yaml | cut -d'"' -f2)
duration=$(calculate_duration "$started" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                        WORKFLOW STATUS                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Feature: $feature"
echo "Phase:   $(echo "$phase" | tr '[:lower:]' '[:upper:]')"
echo "Age:     $duration"
echo ""
```

### 3. Display Phase-Specific Details

```bash
case "$phase" in
  "requirements")
    echo "📋 REQUIREMENTS GATHERING"
    echo "━━━━━━━━━━━━━━━━━━━━━━━"
    # Logic to show which question is next...
    echo "The workflow is waiting for answers to discovery questions."
    ;;

  "planning")
    echo "📐 PLANNING & DESIGN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━"
    echo "The workflow is ready to generate the implementation plan."
    ;;

  "implementation")
    echo "🔨 TDD IMPLEMENTATION"
    echo "━━━━━━━━━━━━━━━━━━━━"

    if [ -f ".workflow/current/plan/implementation-plan.md" ]; then
      total=$(grep -c '## COMPONENT' .workflow/current/plan/implementation-plan.md)
      completed=$(grep -c 'status: "complete"' .workflow/current/plan/implementation-plan.md)

      echo "Progress: $completed / $total components complete."
      draw_progress_bar $completed $total
      echo ""

      next_component_name=$(awk 'BEGIN{RS="---\n"}/status: "pending"/{print; exit}' .workflow/current/plan/implementation-plan.md | grep 'name:' | cut -d'"' -f2)
      if [ -n "$next_component_name" ]; then
        echo "Next up: Implement '$next_component_name'"
      else
        echo "All components are implemented!"
      fi
    else
      echo "Waiting for implementation plan to be generated."
    fi
    ;;

  "complete")
    echo "🏁 COMPLETION"
    echo "━━━━━━━━━━━━━━━━━━━━"
    echo "Implementation is finished. The workflow is ready for finalization."
    ;;
esac
```

### 4. Display Checkpoints & Next Actions

```bash
echo ""
echo "✓ CHECKPOINTS"
echo "━━━━━━━━━━━━━"
# Read and display checkpoints from state.yaml...

echo ""
echo "➡️  NEXT ACTIONS"
echo "━━━━━━━━━━━━━━━"
case "$phase" in
  "requirements" | "planning")
    echo "Continue: /workflow-continue"
    ;;
  "implementation")
    if [ -n "$next_component_name" ]; then
      echo "Implement next component: /workflow-continue"
    else
      echo "Finalize workflow: /workflow-complete"
    fi
    ;;
  "complete")
    echo "Finalize and archive: /workflow-complete"
    ;;
esac
echo "Abort workflow: /workflow-abort"
echo "View this status: /workflow-status"
```

---
