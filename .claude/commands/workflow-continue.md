# Workflow Continue Command

**📋 PROMPT COMMAND**: This command prompts Claude to advance the workflow to its next logical step. When the user runs `/workflow-continue`, Claude will be prompted to perform phase-specific actions.

Progress the workflow to its next logical step, handling all phase transitions.

## Command: /workflow-continue

## Aliases: /wc, /continue, /next

## Purpose

Execute the next step in the workflow based on the current state. This command is the primary driver of the entire TDD process.

## When User Runs This Command

Claude will be prompted to perform actions based on the current workflow phase:

### 1. First, Check Workflow State

**Claude Action Required:**

- Read `.workflow/state.yaml` to determine current phase
- If no workflow exists, inform user to run `/workflow-init` first
- Based on the phase, perform the appropriate actions below

### 2. Phase-Specific Actions

#### If Phase = "requirements"

**Claude Action Required:**

- Read `.workflow/current/requirements/discovery-questions.md`
- Find the next unanswered question (marked with `[pending]`)
- Present the question to the user with its context
- Wait for user's answer (yes/no/idk)
- Update the question's answer in the file
- If all questions answered:
  - Generate a behavior-driven specification based on answers
  - Save to `.workflow/current/requirements/specification.md`
  - Update phase to "planning" in state.yaml
  - Prompt user to run `/workflow-continue` again

#### If Phase = "planning"

**Claude Action Required:**

- Read `.workflow/current/requirements/specification.md`
- **Context7 Library Documentation Fetch:**
  - Analyze the specification for any mentioned libraries/frameworks
  - For each identified library, use Context7 to fetch latest documentation:
    - `mcp__context7__resolve-library-id` to get the library ID
    - `mcp__context7__get-library-docs` to fetch relevant documentation
  - Common libraries to check: Svelte, SvelteKit, Vitest, Zod, and any mentioned in answers to question 6
  - Store fetched library references in `.workflow/current/plan/context7-libraries.md`
- Generate a TDD-focused implementation plan with components
- Each component must include:
  - name (descriptive component name)
  - status (initially "pending")
  - test_file (path for test file)
  - impl_file (path for implementation file)
  - behavior (what the component must do)
  - libraries (list of libraries this component will use)
- Save plan to `.workflow/current/plan/implementation-plan.md`
- Update phase to "implementation" in state.yaml
- Prompt user to run `/workflow-continue` again

#### If Phase = "implementation"

**Claude Action Required:**

- Read `.workflow/current/plan/implementation-plan.md`
- Find the next pending component
- If no pending components:
  - Update phase to "complete"
  - Inform user they can run `/workflow-complete`
- Otherwise, for the pending component:

  **📚 Context7 Pre-Implementation Documentation:**
  [... existing Context7 section ...]

  **🔴 RED Phase:**
  - Generate a comprehensive failing test based on the behavior
  - Ensure test follows the latest library patterns from Context7 docs
  - Save to the specified test_file path
  - Run the test to confirm it fails
  - If test passes without implementation, report error
  - **Note**: The `enforce-test-location.py` hook will ensure proper test placement

  **🟢 GREEN Phase:**
  - Write minimal implementation code to make the test pass
  - Save to the specified impl_file path
  - **Note**: The `check-tdd-compliance.py` hook verifies test exists
  - **Note**: The `validate-schema-first.js` hook ensures schema-first development
  - Run the test again (also triggered by `auto-test-runner.sh` hook)
  - If still failing, iterate (max 3 attempts)

  **🔧 REFACTOR Phase:**
  - Evaluate if the passing code needs improvement
  - If yes, refactor for clarity/maintainability
  - **Note**: The `format-typescript.sh` hook auto-formats the code
  - **Note**: The `no-comments-validator.py` hook ensures self-documenting code
  - Run test to ensure it still passes
  - If refactoring breaks test, revert changes

  **📝 Finalization:**
  - Commit both test and implementation files
  - Update component status to "complete" in plan
  - Update state.yaml with completed files
  - Prompt user to run `/workflow-continue` for next component

**🛡️ Automated Validations:**
The following hooks run automatically during implementation:

- **Pre-write**: TDD compliance, schema validation, comment checking
- **Post-write**: Auto-formatting, test execution, progress notification
- **Protection**: Workflow files cannot be edited directly

**Claude Action Required:**

- Read `.workflow/current/plan/implementation-plan.md`
- Find the next pending component
- If no pending components:
  - Update phase to "complete"
  - Inform user they can run `/workflow-complete`
- Otherwise, for the pending component:

  **📚 Context7 Pre-Implementation Documentation:**
  - Check the component's `libraries` field
  - For each library the component uses:
    - If not already cached in `.workflow/current/plan/context7-libraries.md`:
      - Use `mcp__context7__resolve-library-id` and `mcp__context7__get-library-docs`
    - Focus on documentation relevant to the component's behavior
  - Special focus on:
    - Testing patterns (for Vitest documentation during RED phase)
    - API signatures and best practices (for implementation during GREEN phase)
    - Framework-specific patterns (e.g., Svelte 5 runes, SvelteKit load functions)

  **🔴 RED Phase:**
  - Generate a comprehensive failing test based on the behavior
  - Ensure test follows the latest library patterns from Context7 docs
  - Save to the specified test_file path
  - Run the test to confirm it fails
  - If test passes without implementation, report error

  **🟢 GREEN Phase:**
  - Write minimal implementation code to make the test pass
  - Save to the specified impl_file path
  - Run the test again
  - If still failing, iterate (max 3 attempts)

  **🔧 REFACTOR Phase:**
  - Evaluate if the passing code needs improvement
  - If yes, refactor for clarity/maintainability
  - Run test to ensure it still passes
  - If refactoring breaks test, revert changes

  **📝 Finalization:**
  - Commit both test and implementation files
  - Update component status to "complete" in plan
  - Update state.yaml with completed files
  - Prompt user to run `/workflow-continue` for next component

#### If Phase = "complete"

**Claude Action Required:**

- Inform user that implementation is complete
- Suggest running `/workflow-complete` to finalize and archive

### 3. Update Timestamp

**Claude Action Required:**

- After any successful action, update `last_updated` in state.yaml

## Expected Claude Response Pattern

When the user runs `/workflow-continue`, Claude should:

1. Check current workflow state
2. Perform the appropriate phase-specific actions
3. Provide clear feedback on what was done
4. Guide user to the next step

## Example Interactions

### Requirements Phase:

```
User: /workflow-continue

Claude: I'll continue with the requirements phase. Let me check the next question.

Looking at discovery-questions.md, the next question is:

**Q2: Does this feature need to store new data or modify existing data structures?**
Why we ask: Determines the need for database schema changes, migrations, and data validation layers.

Please answer with: yes, no, or idk
```

### Implementation Phase:

```
User: /workflow-continue

Claude: I'll continue with the implementation phase. Let me check the next component.

▶️ Implementing Component: Schema Validation Layer

🔴 RED: Generating failing test...
[Creates test file]
✅ Test is failing as expected.

🟢 GREEN: Writing minimal implementation...
[Creates implementation]
✅ Test now passes!

🔧 REFACTOR: Checking if code needs improvement...
[Evaluates and potentially refactors]

📝 Committing component files...
✅ Component 'Schema Validation Layer' is complete!

➡️ Run `/workflow-continue` to implement the next component.
```
