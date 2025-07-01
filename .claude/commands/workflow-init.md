# Workflow Init Command

**📋 PROMPT COMMAND**: This command prompts Claude to initialize a new feature workflow. When the user runs `/workflow-init [feature-description]`, Claude will be prompted to set up the workflow environment.

Initialize a new feature workflow with unified state tracking.

## Command: /workflow-init [feature-description]

## Aliases: /wi, /start

## Purpose

Start a new feature implementation workflow by having Claude create a clean state and workspace.

## When User Runs This Command

Claude will be prompted to perform the following actions in sequence:

### 0. Context7 Documentation Preparation

**Claude Action Required:**
- Use Context7 to pre-fetch documentation for core frameworks:
  - `mcp__context7__resolve-library-id` for "svelte" → `mcp__context7__get-library-docs` for Svelte 5 runes and components
  - `mcp__context7__resolve-library-id` for "sveltekit" → `mcp__context7__get-library-docs` for SvelteKit routing and server-side features
  - `mcp__context7__resolve-library-id` for "vitest" → `mcp__context7__get-library-docs` for testing patterns
- This ensures Claude has the latest framework documentation loaded before beginning the workflow

### 1. Validate Environment

**Claude Action Required:**
- Check if `.workflow/state.yaml` exists
  - If it exists, inform user that an active workflow already exists
  - Suggest they use `/workflow-status` to check state or `/workflow-abort` to terminate
  - Stop execution
- Verify the user provided a feature description
  - If not provided, show usage example and stop

### 2. Setup Workflow Structure

**Claude Action Required:**
- Create directory structure:
  - `.workflow/current/requirements/`
  - `.workflow/current/plan/`
  - `completed/` (if it doesn't exist)
- Extract a URL-friendly slug from the feature description for internal use

### 3. Initialize State File

**Claude Action Required:**
- Create `.workflow/state.yaml` with:
  ```yaml
  feature: "{feature-slug}"
  description: "{original-description}"
  phase: "requirements"
  status: "active"
  started: "{current-timestamp}"
  last_updated: "{current-timestamp}"
  
  checkpoints:
    requirements_complete: false
    plan_generated: false
    implementation_complete: false
  
  current_context:
    question_index: 1
  ```

### 4. Create Discovery Questions

**Claude Action Required:**
- Create `.workflow/current/requirements/discovery-questions.md` with the standard 6 discovery questions:
  1. Will this feature have a user-facing interface?
  2. Does this feature need to store new data or modify existing data structures?
  3. Will this feature integrate with any third-party APIs or services?
  4. Does this feature involve user authentication or authorization?
  5. Are there specific performance or scalability requirements?
  6. Will this feature use any external libraries or frameworks that require documentation lookup (e.g., Svelte/SvelteKit, Vitest, Zod, or other NPM packages)?

### 5. Confirm Initialization

**Claude Action Required:**
- Display confirmation message to user:
  - Feature name (slug)
  - Current phase (Requirements Gathering)
  - Next step instruction (run `/workflow-continue`)

## Expected Claude Response Pattern

When the user runs `/workflow-init [feature]`, Claude should:

1. Acknowledge the initialization request
2. Perform validation checks
3. Create the workflow structure and files
4. Confirm successful initialization
5. Prompt user to run `/workflow-continue` to begin requirements gathering

## Example User Interaction

```
User: /workflow-init Add user authentication with OAuth

Claude: I'll initialize a new workflow for "Add user authentication with OAuth".

[Creates directories and files]

🚀 Feature workflow initialized!

Feature: add-user-authentication-with-oauth
Phase:   Requirements Gathering

I've created the workflow structure with 5 discovery questions to understand your needs.
➡️  Run `/workflow-continue` to start answering the requirements questions.
```