# Workflow Continue Command

**⚠️ USER-ONLY COMMAND**: This command is designed to be run by users only. Claude should never attempt to execute this command via Bash. When Claude needs to proceed with workflow actions, it should perform the appropriate TDD steps directly.

Progress the workflow to its next logical step, handling all phase transitions.

## Command: /workflow-continue

## Aliases: /wc, /continue, /next

## Purpose

Execute the next step in the workflow based on the current state. This command is the primary driver of the entire process.

## For Claude

When working within the TDD workflow:
- Do NOT attempt to run this command via Bash
- Instead, read the current workflow state and perform the appropriate TDD action:
  - In RED phase: Generate failing tests
  - In GREEN phase: Write minimal implementation to pass tests
  - In REFACTOR phase: Improve code quality while maintaining test passing
- User will control workflow progression using this command
- Focus on the current component and phase as indicated in the workflow state

## Implementation

```bash
# 1. Load State (Zero-Context Entry Point)
if [ ! -f ".workflow/state.yaml" ]; then
  echo "❌ No active workflow found. Use /workflow-init to start."
  exit 1
fi

phase=$(grep "^phase:" .workflow/state.yaml | cut -d'"' -f2)

# 2. Route to the appropriate phase handler
case "$phase" in
  "requirements")
    handle_requirements_phase
    ;;
  "planning")
    handle_planning_phase
    ;;
  "implementation")
    handle_implementation_phase
    ;;
  "complete")
    echo "✅ Workflow implementation is complete."
    echo "➡️  Run /workflow-complete to finalize and archive."
    ;;
  *)
    echo "❌ Unknown workflow phase: $phase"
    exit 1
    ;;
esac

# 3. Update timestamp after any successful action
update_last_updated_timestamp
```

---

### Phase Handler: Requirements

```bash
handle_requirements_phase() {
  echo "📋 Phase: REQUIREMENTS"
  # Logic to ask questions one by one from discovery-questions.md
  # ... (This logic remains similar to your original spec) ...

  # When all questions are answered:
  echo "✅ All requirements questions answered."
  echo "Synthesizing requirements into a specification..."

  # AI PROMPT FOR SPECIFICATION
  # Context: Contents of discovery-questions.md with answers.
  # Task: Generate a behavior-driven specification document.
  claude_generate_specification > .workflow/current/requirements/specification.md

  echo "✅ Specification created: .workflow/current/requirements/specification.md"

  # Transition to next phase
  update_checkpoint "requirements_complete" "true"
  update_state "planning"
  echo "➡️  Next: Generate the implementation plan. Run /workflow-continue."
}
```

### Phase Handler: Planning

```bash
handle_planning_phase() {
  echo "📐 Phase: PLANNING"
  echo "Generating a detailed, TDD-focused implementation plan..."

  # AI PROMPT FOR PLAN
  # Context: Contents of .workflow/current/requirements/specification.md
  # Task: Generate a machine-readable implementation plan. Break the feature
  #       down into logical, testable components. Follow the strict format below.
  claude_generate_plan > .workflow/current/plan/implementation-plan.md

  # Validate the generated plan
  if ! grep -q "## COMPONENT" .workflow/current/plan/implementation-plan.md; then
    echo "❌ AI failed to generate a valid plan. Please try again."
    exit 1
  fi

  echo "✅ Implementation plan created: .workflow/current/plan/implementation-plan.md"

  # Transition to next phase
  update_checkpoint "plan_generated" "true"
  update_state "implementation"
  echo "➡️  Next: Begin implementing the first component. Run /workflow-continue."
}

# The AI must generate the plan in this EXACT format:
#
# # Implementation Plan: [feature-name]
#
# ---
# ## COMPONENT
# - name: "Schema Validation Layer"
# - status: "pending"
# - test_file: "tests/schemas/validation.test.ts"
# - impl_file: "src/schemas/index.ts"
# - behavior: "The system must validate user input against a strict schema."
# ---
# ## COMPONENT
# - name: "API Endpoint"
# - status: "pending"
# - test_file: "tests/routes/api/feature.test.ts"
# - impl_file: "src/routes/api/feature.ts"
# - behavior: "The system must expose a POST endpoint that accepts validated data."
# ---
```

### Phase Handler: Implementation (The Autonomous Engine)

```bash
handle_implementation_phase() {
  echo "⚙️  Phase: AUTONOMOUS TDD IMPLEMENTATION"

  # 1. Find the next pending component from the plan
  component_block=$(awk 'BEGIN{RS="---\n"}/status: "pending"/{print; exit}' .workflow/current/plan/implementation-plan.md)

  if [ -z "$component_block" ]; then
    echo "🎉 All components are implemented!"
    update_checkpoint "implementation_complete" "true"
    update_state "complete"
    echo "➡️  Run /workflow-complete to finalize."
    exit 0
  fi

  # 2. Parse component details
  name=$(echo "$component_block" | grep 'name:' | cut -d'"' -f2)
  test_file=$(echo "$component_block" | grep 'test_file:' | cut -d'"' -f2)
  impl_file=$(echo "$component_block" | grep 'impl_file:' | cut -d'"' -f2)
  behavior=$(echo "$component_block" | grep 'behavior:' | cut -d'"' -f2)

  echo "▶️  Implementing Component: $name"
  echo "────────────────────────────────────────────────"

  # 3. --- RED: Generate Failing Test ---
  echo "🔴 RED: Generating failing test for behavior..."
  # AI PROMPT FOR TEST
  # Context: The 'behavior' string.
  # Task: Write a comprehensive test file for the behavior. The test MUST fail if the implementation file is empty.
  failing_test_code=$(claude_generate_test "$behavior" "$impl_file")
  echo "$failing_test_code" > "$test_file"

  test_output=$(pnpm test "$test_file" 2>&1)
  if [ $? -eq 0 ]; then
    echo "❌ FATAL: Generated test passed without an implementation. Test is invalid."
    update_component_status "$name" "failed" # Mark as failed in the plan
    exit 1
  fi
  echo "  ✅ Test is failing as expected."

  # 4. --- GREEN: Generate Passing Code (with self-correction) ---
  echo "🟢 GREEN: Generating minimal code to pass the test..."
  for i in {1..3}; do
    echo "  Attempt $i of 3..."
    # AI PROMPT FOR CODE
    # Context: Full content of $test_file AND the $test_output (failure message).
    # Task: Write the minimal code in $impl_file to make the test pass.
    impl_code=$(claude_generate_implementation "$failing_test_code" "$test_output")
    echo "$impl_code" > "$impl_file"

    test_output=$(pnpm test "$test_file" 2>&1)
    if [ $? -eq 0 ]; then
      echo "  ✅ Test now passes!"
      break
    fi

    if [ $i -eq 3 ]; then
      echo "❌ FATAL: Could not generate passing code after 3 attempts."
      update_component_status "$name" "failed"
      exit 1
    fi
  done

  # 5. --- REFACTOR: Improve and Verify ---
  echo "🔧 REFACTOR: Improving code quality..."
  passing_code=$(cat "$impl_file")
  # AI PROMPT FOR REFACTOR
  # Context: The passing $passing_code and the $test_file.
  # Task: Refactor the code for clarity, performance, and best practices without changing its behavior.
  refactored_code=$(claude_refactor_code "$passing_code" "$failing_test_code")
  echo "$refactored_code" > "$impl_file"

  if ! pnpm test "$test_file" >/dev/null 2>&1; then
    echo "  ⚠️  Refactoring broke tests. Reverting to previous working version."
    git checkout -- "$impl_file"
  else
    echo "  ✅ Refactoring successful. Tests still pass."
  fi

  # 6. --- COMMIT & FINALIZE ---
  # MANDATORY: Commit the completed component files
  echo "  📝 Committing component files..."
  git add "$impl_file" "$test_file"
  git commit -m "feat($name): implement component via TDD engine" -q || {
    echo "❌ Failed to commit. Check git status."
    exit 1
  }
  
  # MANDATORY: Update component status in implementation plan
  echo "  📋 Updating implementation plan..."
  update_component_status "$name" "complete"
  
  # MANDATORY: Update state.yaml with completed component
  echo "  🔄 Updating workflow state..."
  # Add to completed_files array
  yq eval ".current_context.completed_files += [\"$impl_file\"]" -i .workflow/state.yaml
  # Update current component
  yq eval ".current_context.current_component = \"$name-complete\"" -i .workflow/state.yaml
  # Update last modified timestamp
  yq eval ".last_updated = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" -i .workflow/state.yaml
  
  echo "────────────────────────────────────────────────"
  echo "✅ Component '$name' is complete and committed."
  echo "✅ State updated: $impl_file added to completed components."
  echo "➡️  Run /workflow-continue to implement the next component."
}
```

---
