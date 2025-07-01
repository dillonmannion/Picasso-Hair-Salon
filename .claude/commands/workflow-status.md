# Workflow Status Command

**📋 PROMPT COMMAND**: This command prompts Claude to display the current workflow status. When the user runs `/workflow-status`, Claude will be prompted to read workflow files and present a comprehensive status report.

Display comprehensive workflow status with clear next actions.

## Command: /workflow-status

## Aliases: /ws, /status

## Purpose

Show the current workflow state, progress, and available actions in a clear, actionable format.

## When User Runs This Command

Claude will be prompted to perform the following actions:

### 1. Check for Active Workflow

**Claude Action Required:**
- Check if `.workflow/state.yaml` exists
- If not, inform user no active workflow exists and suggest `/workflow-init`
- If yes, continue to parse and display status

### 2. Parse and Display Header

**Claude Action Required:**
- Extract from state.yaml:
  - feature name
  - current phase
  - start time
  - calculate duration since start
- Display formatted header with this information

### 3. Display Phase-Specific Details

**Claude Action Required:**
Based on the current phase, show relevant information:

#### If Phase = "requirements"
- Show that workflow is gathering requirements
- Check discovery-questions.md to see which question is next
- Display progress (e.g., "Question 3 of 5")

#### If Phase = "planning"
- Show that workflow is ready to generate implementation plan
- Check if specification exists

#### If Phase = "implementation"
- Read implementation-plan.md
- Count total components and completed components
- Show progress (e.g., "3 / 7 components complete")
- Display name of next pending component
- If all complete, indicate ready for finalization

#### If Phase = "complete"
- Show that implementation is finished
- Indicate workflow is ready for archival

### 4. Display Checkpoints & Next Actions

**Claude Action Required:**
- Read checkpoints from state.yaml and display status
- Based on phase and progress, suggest next action:
  - Requirements/Planning: `/workflow-continue`
  - Implementation with pending components: `/workflow-continue`
  - Implementation with all complete: `/workflow-complete`
  - Complete phase: `/workflow-complete`
- Always show `/workflow-abort` as an option

## Expected Claude Response Pattern

When the user runs `/workflow-status`, Claude should:

1. Check for active workflow
2. Parse current state
3. Display formatted status report
4. Suggest appropriate next actions

## Example Output

```
╔════════════════════════════════════════════════════════════════╗
║                        WORKFLOW STATUS                         ║
╚════════════════════════════════════════════════════════════════╝

Feature: codebase-alignment-with-claude-md
Phase:   IMPLEMENTATION
Age:     2 hours 15 minutes

🔨 TDD IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━
Progress: 5 / 8 components complete.
[■■■■■□□□] 62%

Next up: Implement 'Auth Guard Hook'

✓ CHECKPOINTS
━━━━━━━━━━━━━
✅ Requirements complete
✅ Plan generated
⏳ Implementation in progress

➡️  NEXT ACTIONS
━━━━━━━━━━━━━━━
Implement next component: /workflow-continue
Abort workflow: /workflow-abort
View this status: /workflow-status
```