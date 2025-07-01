# Workflow Init Command

Initialize a new feature workflow with unified state tracking.

## Command: /workflow-init [feature-description]

## Aliases: /wi, /start

## Purpose

Start a new feature implementation workflow with a single state file tracking all phases.

## Implementation Instructions

### 1. Validate Environment

```bash
# Check for existing active workflow
if [ -f ".workflow/state.yaml" ]; then
  status=$(grep "status:" .workflow/state.yaml | cut -d' ' -f2)
  if [ "$status" = "active" ] || [ "$status" = "paused" ]; then
    echo "❌ Active workflow detected. Complete or abort it first."
    echo "   Use: /workflow-status to see current state"
    echo "   Use: /workflow-abort to safely abort"
    exit 1
  fi
fi

# Ensure clean workspace
mkdir -p .workflow/current/{requirements,plan,tests,implementation}
mkdir -p completed
mkdir -p scripts
```

### 2. Initialize State File

Create `.workflow/state.yaml`:

```yaml
feature: '[extracted-feature-name]'
description: '[full-feature-description]'
phase: 'requirements'
subphase: 'discovery'
status: 'active'
started: '[ISO-timestamp]'
last_updated: '[ISO-timestamp]'
checkpoints:
  requirements_complete: false
  context_validated: false
  plan_consensus: false
  implementation_started: false
  tests_passing: false
  implementation_complete: false
current_context:
  question_index: 0
  questions_answered: []
  iteration_count: 0
  test_cycle: 0
  completed_files: []
  pending_files: []
metadata:
  estimated_complexity: 'unknown' # small|medium|large
  technologies: []
  gemini_reviews: 0
  context7_validations: 0
```

### 3. Initial Requirements Setup

Create `.workflow/current/requirements/discovery-questions.md`:

```markdown
# Discovery Questions for [feature-name]

These questions help understand the scope and constraints of the feature.
All questions are yes/no with smart defaults if unknown.

## Q1: Will this feature have a user-facing interface?

**Default if unknown:** Yes
**Why we ask:** Determines if we need frontend components and UX considerations.
**Your answer:** [pending]

## Q2: Does this feature need to integrate with existing authentication/authorization?

**Default if unknown:** Yes
**Why we ask:** Security considerations affect architecture decisions.
**Your answer:** [pending]

## Q3: Will this feature handle sensitive or personal data?

**Default if unknown:** Yes (safer to assume yes)
**Why we ask:** Determines encryption, audit, and compliance requirements.
**Your answer:** [pending]

## Q4: Should this feature work offline or in low-connectivity scenarios?

**Default if unknown:** No
**Why we ask:** Affects data synchronization and caching strategies.
**Your answer:** [pending]

## Q5: Do you need real-time updates (live data push to users)?

**Default if unknown:** No
**Why we ask:** Determines if we need WebSocket or polling infrastructure.
**Your answer:** [pending]
```

### 4. Display Initial Status

```
🚀 Feature workflow initialized!

Feature: [feature-name]
Phase: Requirements Gathering
Status: Active

📋 Starting with 5 discovery questions to understand your needs.
Each question has a smart default if you're unsure.

Ready for first question? Use: /workflow-continue
```

### 5. Log Initial Context Analysis

Create `.workflow/current/requirements/initial-analysis.md`:

```markdown
# Initial Codebase Analysis

## Detected Project Type

[Analyze package.json, tech stack]

## Relevant Existing Patterns

[Search for similar features]

## Available MCP Servers

[Check /mcp status]

## Preliminary Technology List

[For context7 validation later]
```

## Error Handling

### Missing Feature Description

```
❌ Please provide a feature description
Usage: /workflow-init <feature-description>
Example: /workflow-init add user authentication with OAuth
```

### Invalid Characters in Feature Name

```
❌ Feature name contains invalid characters
Please use only letters, numbers, spaces, and hyphens
```

### Workspace Not Clean

```
⚠️  Existing workflow artifacts detected
Run /workflow-cleanup to archive old work
Or manually review .workflow/ directory
```

## State Transitions

After initialization:

- Phase: requirements
- Subphase: discovery
- Next Command: /workflow-continue (to start questions)

## Important Implementation Notes

1. **Feature Name Extraction**: Convert description to slug
   - "Add user authentication" → "user-authentication"
   - Remove special characters, lowercase, hyphenate

2. **Atomic Operations**: State file updates must be atomic
   - Write to temp file first
   - Move to replace existing

3. **Validation First**: Always validate before state changes
   - Check file permissions
   - Verify required tools (jq, yq if available)
   - Ensure scripts directory exists

4. **Context Persistence**: Save everything for resume capability
   - User answers
   - Discovered patterns
   - Technology choices
