# Workflow Init Command

**⚠️ USER-ONLY COMMAND**: This command is designed to be run by users only. Claude should never attempt to execute this command via Bash. When Claude needs to proceed with workflow actions, it should perform the appropriate TDD steps directly.

Initialize a new feature workflow with unified state tracking.

## Command: /workflow-init [feature-description]

## Aliases: /wi, /start

## Purpose

Start a new feature implementation workflow, creating a clean state and workspace.

## For Claude

When working within the TDD workflow:
- Do NOT attempt to run this command via Bash
- Instead, perform the appropriate TDD actions based on the current phase
- User will control workflow progression using these commands
- Focus on generating tests, implementations, and refactoring as needed

## Implementation

### 1. Validate Environment

```bash
# Check for an existing active workflow
if [ -f ".workflow/state.yaml" ]; then
  echo "❌ An active workflow already exists."
  echo "   Use /workflow-status to see its state or /workflow-abort to terminate it."
  exit 1
fi

# Ensure a feature description is provided
if [ -z "$1" ]; then
  echo "❌ Please provide a feature description."
  echo "   Usage: /workflow-init <feature-description>"
  echo "   Example: /workflow-init Add user authentication with OAuth"
  exit 1
fi

# Clean and create directory structure
mkdir -p .workflow/current/{requirements,plan}
mkdir -p completed
```

### 2. Extract Feature Name

```bash
# Convert multi-word description to a URL-friendly slug
feature_slug=$(echo "$1" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-z0-9]/-/g' -e 's/--\+/-/g' -e 's/^-//' -e 's/-$//')
```

### 3. Initialize State File (`.workflow/state.yaml`)

```bash
cat > .workflow/state.yaml << EOF
feature: "$feature_slug"
description: "$1"
phase: "requirements" # requirements -> planning -> implementation -> complete
status: "active"
started: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
last_updated: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Checkpoints track major phase completions
checkpoints:
  requirements_complete: false
  plan_generated: false
  implementation_complete: false

# Context stores transient data for the current phase
current_context:
  question_index: 1 # Start with the first question
EOF
```

### 4. Create Initial Requirements Questions

```bash
# Create the discovery questions file for the requirements phase
cat > .workflow/current/requirements/discovery-questions.md << 'EOF'
# Discovery Questions

These questions help clarify the feature's scope. Answer with "yes", "no", or "idk".

---
## Q1: Will this feature have a user-facing interface?
**Why we ask:** Determines if we need frontend components, UI/UX design, and accessibility considerations.
**Your answer:** [pending]
---
## Q2: Does this feature need to store new data or modify existing data structures?
**Why we ask:** Determines the need for database schema changes, migrations, and data validation layers (like Zod schemas).
**Your answer:** [pending]
---
## Q3: Will this feature integrate with any third-party APIs or services?
**Why we ask:** Identifies the need for API clients, error handling for external services, and secret management.
**Your answer:** [pending]
---
## Q4: Does this feature involve user authentication or authorization?
**Why we ask:** Security is paramount. This dictates the use of auth middleware, session management, and role-based access control.
**Your answer:** [pending]
---
## Q5: Are there specific performance or scalability requirements?
**Why we ask:** Influences choices around caching, database queries, asynchronous jobs, and infrastructure.
**Your answer:** [pending]
---
EOF
```

### 5. Display Initial Status

```bash
echo "🚀 Feature workflow initialized!"
echo ""
echo "Feature: $feature_slug"
echo "Phase:   Requirements Gathering"
echo ""
echo "Next, we'll ask 5 discovery questions to understand your needs."
echo "➡️  Run /workflow-continue to start."
```

---
