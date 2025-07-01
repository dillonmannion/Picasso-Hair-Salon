# Workflow Abort Command

**📋 PROMPT COMMAND**: This command prompts Claude to safely abort the current workflow. When the user runs `/workflow-abort`, Claude will be prompted to terminate the workflow and handle archival of partial work.

Safely abort the current workflow and optionally archive partial work.

## Command: /workflow-abort

## Aliases: /wa, /abort, /cancel

## Purpose

Safely terminate an active workflow at any stage by having Claude preserve work for potential future reference.

## When User Runs This Command

Claude will be prompted to perform the following actions:

### 1. Confirm Workflow Exists

**Claude Action Required:**
- Check if `.workflow/state.yaml` exists
- If not, inform user there's no active workflow to abort
- If yes, extract feature name and current phase

### 2. Present Abort Options

**Claude Action Required:**
- Display current workflow information:
  - Feature name
  - Current phase
  - Work completed (if in implementation phase)
- Present three options to the user:
  1. **Archive and abort** - Preserves all work in `completed/.aborted/`
  2. **Discard and abort** - Deletes all workflow artifacts
  3. **Cancel** - Return to workflow without aborting
- Wait for user's choice

### 3. Handle User's Choice

#### If User Chooses "Archive and abort"

**Claude Action Required:**
- Create archive directory: `completed/.aborted/YYYY-MM-DD-HHMM-{feature}/`
- Copy all files from `.workflow/current/` to archive
- Copy `.workflow/state.yaml` as `state-at-abort.yaml`
- Create `ABORT-SUMMARY.md` containing:
  - Feature name
  - Phase when aborted
  - Date and time
  - Summary of completed work
  - Instructions for potential resumption
- Remove `.workflow/` directory
- Confirm archival location to user

#### If User Chooses "Discard and abort"

**Claude Action Required:**
- Ask for final confirmation (require "yes" response)
- If confirmed:
  - Log abort to `.workflow/abort.log` (create if needed)
  - Remove entire `.workflow/` directory
  - Confirm complete removal
- If not confirmed, cancel the abort

#### If User Chooses "Cancel"

**Claude Action Required:**
- Inform user the abort was cancelled
- Suggest next actions (`/workflow-continue` or `/workflow-status`)
- Leave workflow intact

### 4. Special Considerations

**Claude Action Required:**
Check for these conditions and warn user if applicable:

- **Uncommitted changes**: Run `git status` and warn if uncommitted files exist
- **Implementation in progress**: Show count of completed vs total components
- **Context analysis running**: Warn if aborting during autonomous phases

### 5. Post-Abort Summary

**Claude Action Required:**
Display final summary based on action taken:
- If archived: Show archive location
- If discarded: Confirm complete removal
- Always suggest `/workflow-init` for starting new workflow

## Force Abort Option

If user runs `/workflow-abort --force`:

**Claude Action Required:**
- Skip confirmation dialogs
- Quick archive to `completed/.aborted/YYYY-MM-DD-HHMM-{feature}-FORCE/`
- Immediately remove `.workflow/` directory
- Confirm force abort completion

## Expected Claude Response Pattern

When the user runs `/workflow-abort`, Claude should:

1. Check for active workflow
2. Present clear options with current status
3. Execute chosen option carefully
4. Provide clear confirmation of actions taken

## Example Interaction

```
User: /workflow-abort

Claude: I'll help you abort the current workflow. Let me check the status first.

⚠️  ABORT WORKFLOW: codebase-alignment-with-claude-md?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Phase: implementation

Work to be affected:
- Implemented components: 5 / 8
- Any uncommitted code in src/ and tests/

Options:
1. Archive and abort (preserves all work in 'completed/.aborted')
2. Discard and abort (deletes all workflow artifacts)
3. Cancel (return to workflow)

Please choose an option (1/2/3):
```

```
User: 1

Claude: 📦 Archiving partial work...

I've archived your work to: completed/.aborted/2025-01-01-1045-codebase-alignment-with-claude-md/

✅ Workflow aborted and work preserved

🆕 Start a new workflow with: /workflow-init <feature>
📋 View aborted workflows in: completed/.aborted/
```