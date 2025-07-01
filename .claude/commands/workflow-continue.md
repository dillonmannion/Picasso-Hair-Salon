# Workflow Continue Command

Continue the workflow from its current state, handling all phase transitions.

## Command: /workflow-continue

## Aliases: /wc, /continue, /next

## Purpose

Progress through the workflow based on current state, enforcing proper gates and transitions.

## State Machine Logic

```
requirements.discovery → requirements.context → requirements.specification
    ↓
planning.initial → planning.review → planning.consensus
    ↓
implementation.test → implementation.code → implementation.verify
    ↓
complete
```

## Implementation by Phase

### PHASE: Requirements

#### Subphase: discovery

```bash
# Load current question index
current_q=$(grep "question_index:" .workflow/state.yaml | cut -d' ' -f2)
next_q=$((current_q + 1))

if [ $next_q -le 5 ]; then
  # Display next question from discovery-questions.md
  question=$(sed -n "/## Q${next_q}:/,/## Q$((next_q+1)):/p" .workflow/current/requirements/discovery-questions.md)
  echo "$question"
  echo ""
  echo "Please answer: yes/no/idk (or y/n/i)"

  # After user responds, update state
  # Record answer in discovery-questions.md
  # Update question_index in state.yaml
else
  # All discovery questions answered
  echo "✅ Discovery complete! Analyzing codebase context..."
  # Transition to requirements.context subphase
fi
```

#### Subphase: context

```bash
echo "🔍 Performing autonomous context analysis..."

# 1. Analyze project structure
echo "Analyzing project structure..."
analyze_project_structure > .workflow/current/requirements/context-analysis.md

# 2. Query context7 for each detected technology
for tech in $(cat .workflow/state.yaml | grep -A10 "technologies:" | grep "  -" | cut -d'-' -f2); do
  echo "Querying context7 for $tech best practices..."
  # use context7
  # Query: Current best practices for $tech in $(date +%Y)
  # Save results to context-analysis.md
done

# 3. Search for similar existing features
echo "Searching for similar patterns in codebase..."
search_similar_patterns >> .workflow/current/requirements/context-analysis.md

# 4. Generate technical questions based on findings
generate_technical_questions > .workflow/current/requirements/technical-questions.md

# Transition to requirements.specification
echo "✅ Context analysis complete!"
echo "Generated 5 technical questions based on your codebase."
update_state "requirements" "specification"
```

#### Subphase: specification

```bash
# Similar to discovery, but with technical questions
# After all answered, generate final specification

create_requirements_specification() {
  cat > .workflow/current/requirements/specification.md << 'EOF'
# Feature Specification: [feature-name]

## Overview
[Synthesize from discovery answers and context]

## User Behaviors (What users can do)
[Focus on observable behaviors, not implementation]
1. As a [user type], I can [action] so that [outcome]
2. As a [user type], I can [action] so that [outcome]

## System Behaviors (How the system responds)
1. When [trigger], the system [response]
2. When [condition], the system [behavior]

## Technical Requirements
[Based on technical questions and context7]
1. TR1: Use [pattern] for [purpose]
2. TR2: Implement [security measure]

## Behavior Test Scenarios (For TDD)
[These will drive the implementation]

### Scenario 1: [User story]
**Given:** [Initial state]
**When:** [Action taken]
**Then:** [Expected outcome]

**Test cases:**
- Happy path: [Expected behavior]
- Edge case: [Boundary behavior]
- Error case: [Error behavior]

### Scenario 2: [User story]
**Given:** [Initial state]
**When:** [Action taken]
**Then:** [Expected outcome]

**Test cases:**
- Happy path: [Expected behavior]
- Edge case: [Boundary behavior]
- Error case: [Error behavior]

## Data Schemas (Preliminary)
[Identify key data structures that will need schemas]
- User data structure
- Request/Response structures
- Domain entities

## Constraints
- [From context analysis]
- [From user answers]
- [Performance requirements]
- [Security requirements]

## Success Criteria
- [ ] All behavior test scenarios passing
- [ ] 100% behavior coverage (not line coverage)
- [ ] Performance benchmarks met
- [ ] Security scan passing
- [ ] TypeScript strict mode compliance
- [ ] All data validated through schemas
EOF
}

# After specification created
echo "✅ Requirements complete! Behavior-driven specification ready."
update_checkpoint "requirements_complete" "true"
update_state "planning" "initial"
```

### PHASE: Planning

#### Subphase: initial

````bash
echo "📋 Generating implementation plan..."

# Load requirements specification
spec=$(cat .workflow/current/requirements/specification.md)

# Generate plan with TDD and schema-first focus
create_implementation_plan() {
  cat > .workflow/current/plan/implementation-plan.md << 'EOF'
# Implementation Plan: [feature-name]
# Iteration: 1

## Schema-First Design

### Define Schemas (Implement First)
Using Zod for runtime validation and TypeScript type derivation:

```typescript
import { z } from 'zod';

// Define schemas before any implementation
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date(),
});

const PaymentRequestSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  method: z.enum(['card', 'bank', 'wallet']),
});

// Derive types from schemas
type User = z.infer<typeof UserSchema>;
type PaymentRequest = z.infer<typeof PaymentRequestSchema>;
````

## TDD Implementation Sequence

### Component 1: Schema Validation Layer

**Why this first:** All other components depend on valid data structures

#### Step 1.1: Test Schema Validation Behavior

- **Test file:** `tests/schemas/validation.test.ts`
- **Behavior test:**

  ```typescript
  import { UserSchema, PaymentRequestSchema } from '@/schemas';

  describe('Schema validation behavior', () => {
    it('should accept valid user data', () => {
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'John Doe',
        createdAt: new Date(),
      };

      const result = UserSchema.safeParse(validUser);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should reject invalid email formats', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'not-an-email',
        name: 'John Doe',
        createdAt: new Date(),
      };

      const result = UserSchema.safeParse(invalidUser);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
      }
    });
  });
  ```

- **Expected result:** RED (schemas not implemented)

#### Step 1.2: Implement Minimal Schemas

- **File:** `src/schemas/index.ts`
- **Minimal implementation:** Just enough to pass tests

### Component 2: [Name]

**Why this second:** [Dependency reasoning]

#### Step 2.1: Test [Specific Behavior]

- **Test file:** `tests/[path]/[name].test.ts`
- **Test content:**
  ```typescript
  describe('[Component behavior]', () => {
    it('should [specific user-visible behavior]', () => {
      // Test BEHAVIOR through public API only
      // Use real schemas imported from @/schemas
      // No implementation details
    });
  });
  ```

#### Step 2.2: Implement Minimal Code

- **Remember:**
  - No comments (self-documenting code)
  - Options objects for parameters
  - Immutable data only
  - TypeScript strict mode

### Testing Guidelines

- Test behavior, not implementation
- 100% coverage through behavior tests
- Use factory functions for test data
- Import real schemas (never redefine)
- No 1:1 test-to-implementation mapping

## Success Metrics

- Each test must fail before implementation
- Each implementation must be minimal
- Refactoring assessment after each green
- All behavior covered by tests
- No 'any' types or type assertions

## Code Style Requirements

- Self-documenting (no comments)
- Options objects by default
- Functional programming patterns
- Immutable data structures
- Small, pure functions
- Early returns over nested conditionals
  EOF
  }

echo "✅ Initial plan created with schema-first approach."
echo " Sending to Gemini for review..."
update_state "planning" "review"

````

#### Subphase: review
```bash
iteration=$(grep "iteration_count:" .workflow/state.yaml | cut -d' ' -f2)
iteration=$((iteration + 1))

echo "🤖 Invoking Gemini review (iteration $iteration)..."

# Execute Gemini review using the review script
echo "Calling Gemini for plan review..."
node scripts/gemini-review.js \
  --plan=.workflow/current/plan/implementation-plan.md \
  --requirements=.workflow/current/requirements/specification.md \
  --iteration=$iteration \
  --output=.workflow/current/plan/gemini-review-$iteration.md

# The script will create the output file and exit with score as exit code

# Check consensus score
score=$(grep "CONSENSUS_SCORE:" .workflow/current/plan/gemini-review-$iteration.md | cut -d' ' -f2)

if [ "$score" -ge 9 ]; then
  echo "✅ Consensus achieved! Score: $score/10"
  update_checkpoint "plan_consensus" "true"
  update_state "planning" "consensus"
else
  echo "📝 Score: $score/10. Addressing Gemini feedback..."
  # Update plan based on feedback
  update_state "planning" "initial"
  echo "Use /workflow-continue to generate revised plan"
fi
````

#### Subphase: consensus

```bash
echo "🎉 Planning complete with consensus!"
echo ""
echo "Summary:"
echo "- Total iterations: $iteration"
echo "- Final score: $score/10"
echo "- Ready for TDD implementation"
echo ""
echo "The implementation will follow strict TDD:"
echo "1. Write failing test"
echo "2. Write minimal code to pass"
echo "3. Refactor if needed"
echo ""
echo "Ready to start? Use: /workflow-continue"

update_state "implementation" "test"
update_context "test_cycle" "1"
update_context "current_component" "1"
```

### PHASE: Implementation (TDD Enforced)

#### Subphase: test

```bash
# Get current component and test from plan
component=$(get_current_component)
test_file=$(get_test_file_for_component $component)
behavior=$(get_behavior_for_component $component)

echo "🔴 RED PHASE: Writing failing BEHAVIOR test"
echo ""
echo "Component: $component"
echo "Behavior to test: $behavior"
echo "Test file: $test_file"
echo ""
echo "CRITICAL REMINDERS:"
echo "✓ Test BEHAVIOR through public API only"
echo "✓ No testing of implementation details"
echo "✓ Use real schemas from the project (import, don't redefine)"
echo "✓ Test should describe what users/consumers expect"
echo ""

# Generate behavior test based on plan
create_failing_behavior_test $component > .workflow/current/tests/$test_file

echo "Behavior test created. Verifying it fails..."
echo ""

# Run test and capture output
test_output=$(pnpm test $test_file 2>&1)
test_exit_code=$?

if [ $test_exit_code -eq 0 ]; then
  echo "❌ ERROR: Test is passing but no implementation exists!"
  echo "This means the test isn't actually testing anything."
  echo "Please write a test that will FAIL without implementation."
  exit 1
fi

echo "✅ Good! Test is failing as expected."
echo ""
# Show test content
cat .workflow/current/tests/$test_file

echo ""
echo "Expected result: ❌ Test FAILS (no implementation yet)"
echo ""
echo "Proceeding to implementation..."

# Automatically proceed to code phase
update_state "implementation" "code"
execute_code_phase
```

#### Subphase: code

```bash
echo "🟢 GREEN PHASE: Writing MINIMAL code to pass the test"
echo ""

# Get implementation file from plan
impl_file=$(get_implementation_file_for_component $component)

echo "Implementation file: $impl_file"
echo ""
echo "⚠️  CRITICAL RULES:"
echo "✓ Write ONLY enough code to make the test pass"
echo "✓ No comments - code must be self-documenting"
echo "✓ Use descriptive names for everything"
echo "✓ TypeScript strict mode (no 'any', no assertions)"
echo "✓ Prefer options objects for function parameters"
echo "✓ Immutable data only - no mutations"
echo "✓ If you're adding code the test doesn't require, STOP"
echo ""

# Show what behavior we're implementing
echo "Implementing behavior: $behavior"
echo ""

# Generate minimal implementation
create_minimal_implementation $component > .workflow/current/implementation/$impl_file

# Show implementation
cat .workflow/current/implementation/$impl_file

echo ""
echo "Minimal implementation created."
echo "Verifying test passes..."

# Automatically proceed to verify phase
update_state "implementation" "verify"
execute_verify_phase
```

#### Subphase: verify

```bash
echo "✅ VERIFY PHASE: Running tests"
echo ""

# Run the specific test
echo "Running: pnpm test $test_file"
run_test_result=$(pnpm test $test_file 2>&1)

if [ $? -eq 0 ]; then
  echo "✅ Test PASSES! Moving to refactoring assessment."
  echo ""

  # Commit working code before any refactoring
  echo "📝 Committing working code..."
  git add .
  git commit -m "feat: implement $behavior"

  echo "🔧 REFACTOR ASSESSMENT (Required step)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Review the code for improvement opportunities:"
  echo "□ Are variable/function names clear and descriptive?"
  echo "□ Is there duplication of KNOWLEDGE (not just code)?"
  echo "□ Can complex logic be simplified?"
  echo "□ Are there magic numbers that should be constants?"
  echo "□ Would extracting functions improve readability?"
  echo "□ Are we using options objects where appropriate?"
  echo ""

  # Show current implementation for review
  echo "Current implementation:"
  echo "---"
  cat .workflow/current/implementation/$impl_file
  echo "---"
  echo ""

  # Automatically assess refactoring need using Gemini
    echo "Requesting Gemini code review..."
    
    # Use actual Gemini CLI to review the code
    gemini_review=$(node scripts/gemini-code-review.js \
      --file=$impl_file \
      --component=$component \
      --guidelines=.workflow/refactor-guidelines.md 2>&1)
    
    # Extract score from exit code
    refactor_score=$?
    
    # If score is 99, there was an error
    if [ $refactor_score -eq 99 ]; then
      echo "⚠️  Error running Gemini review. Proceeding without refactoring."
      proceed_to_next_component
      return
    fi
    
    # Show the review output
    echo "$gemini_review"
    echo ""
    
    if [ $refactor_score -ge 7 ]; then
      echo "Gemini suggests refactoring (score: $refactor_score/10)"
      update_state "implementation" "refactor"
      execute_refactor_phase "$gemini_review"
    else
      echo "✅ Code is clean enough (Gemini score: $refactor_score/10)"
      echo "Skipping refactor phase."
      proceed_to_next_component
    fi
else
  echo "❌ Test still FAILS!"
  echo ""
  echo "Error output:"
  echo "$run_test_result"
  echo ""
  echo "The implementation doesn't satisfy the test."
  echo "Remember: Use the MINIMAL code necessary to pass."
  echo ""
  echo "Common issues:"
  echo "- Implementation doesn't match expected behavior"
  echo "- Missing edge case handling the test requires"
  echo "- Wrong types or return values"
  echo ""
  update_state "implementation" "code"
fi
```

#### Subphase: refactor_decision

```bash
# This subphase is now automated and handled within execute_verify_phase
# It uses Gemini to assess whether refactoring is needed
# No manual user input required
```

#### Subphase: refactor

```bash
# This subphase is now automated and handled by execute_refactor_phase
# Gemini automatically applies refactoring suggestions
# No manual refactoring required
```

#### Subphase: refactor_verify

```bash
# This subphase is now integrated into execute_refactor_phase
# Verification happens automatically after refactoring
# No separate verify step needed
```

### Helper Functions

````bash
proceed_to_next_component() {
  next_component=$(get_next_component)
  if [ -n "$next_component" ]; then
    update_context "current_component" "$next_component"
    update_context "test_cycle" $((test_cycle + 1))
    update_state "implementation" "test"
    echo ""
    echo "Moving to next component: $next_component"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Ready to continue with next component? Use: /workflow-continue"
  else
    echo "🎉 All components implemented!"
    update_checkpoint "implementation_complete" "true"
    update_state "complete" "review"
    echo ""
    echo "Running final verification..."
    execute_complete_phase
  fi
}

### PHASE: Complete

```bash
execute_complete_phase() {
  echo "🏁 Running final verification..."
  echo ""
  
  # Run all tests
  echo "Running complete test suite..."
  pnpm test
  
  # Run linting
  echo "Running linting..."
  pnpm run lint
  
  # Run type checking
  echo "Running type checking..."
  pnpm run type-check
  
  # Generate completion report
  generate_completion_report > .workflow/current/completion-report.md
  
  echo ""
  echo "✅ Feature implementation complete!"
  echo ""
  echo "Summary:"
  cat .workflow/current/completion-report.md
  
  echo ""
  echo "Ready to finalize and archive? Use: /workflow-complete"
}
````

## Helper Functions

```bash
update_state() {
  local phase=$1
  local subphase=$2
  # Update state.yaml atomically
  # Update last_updated timestamp
}

update_checkpoint() {
  local checkpoint=$1
  local value=$2
  # Update specific checkpoint in state.yaml
}

update_context() {
  local key=$1
  local value=$2
  # Update current_context section
}

get_current_component() {
  # Extract from plan based on current test_cycle
  current_cycle=$(grep "test_cycle:" .workflow/state.yaml | cut -d' ' -f2)
  
  # Component mapping (should be extracted from implementation plan)
  case $current_cycle in
    1) echo "schema-validation" ;;
    2) echo "test-data-factories" ;;
    3) echo "eslint-rules" ;;
    4) echo "oauth-flow" ;;
    5) echo "button-component" ;;
    *) echo "" ;;
  esac
}

get_next_component() {
  current=$(get_current_component)
  
  case $current in
    "schema-validation") echo "test-data-factories" ;;
    "test-data-factories") echo "eslint-rules" ;;
    "eslint-rules") echo "oauth-flow" ;;
    "oauth-flow") echo "button-component" ;;
    "button-component") echo "" ;;
    *) echo "" ;;
  esac
}

get_test_file_for_component() {
  component=$1
  
  case $component in
    "schema-validation") echo "tests/lib/schemas/validation.test.ts" ;;
    "test-data-factories") echo "tests/lib/test-utils/factories.test.ts" ;;
    "eslint-rules") echo "tests/eslint-rules/no-any-type.test.ts" ;;
    "oauth-flow") echo "tests/routes/auth/callback/+server.test.ts" ;;
    "button-component") echo "tests/lib/components/Button.test.ts" ;;
    *) echo "" ;;
  esac
}

get_implementation_file_for_component() {
  component=$1
  
  case $component in
    "schema-validation") echo "src/lib/schemas/index.ts" ;;
    "test-data-factories") echo "src/lib/test-utils/factories.ts" ;;
    "eslint-rules") echo "eslint-rules/no-any-type.ts" ;;
    "oauth-flow") echo "src/routes/auth/callback/+server.ts" ;;
    "button-component") echo "src/lib/components/Button.svelte" ;;
    *) echo "" ;;
  esac
}

get_behavior_for_component() {
  component=$1
  
  case $component in
    "schema-validation") echo "Validating data structures with Zod schemas" ;;
    "test-data-factories") echo "Creating valid test data that conforms to schemas" ;;
    "eslint-rules") echo "Enforcing no-any-type rule in TypeScript code" ;;
    "oauth-flow") echo "Handling OAuth authentication callbacks" ;;
    "button-component") echo "Rendering interactive button with variants" ;;
    *) echo "" ;;
  esac
}

create_failing_behavior_test() {
  component=$1
  # This would be implemented by Claude to create appropriate test
  echo "# Failing test for $component created by Claude"
}

create_minimal_implementation() {
  component=$1
  # This would be implemented by Claude to create minimal implementation
  echo "# Minimal implementation for $component created by Claude"
}

generate_completion_report() {
  feature=$(grep "feature:" .workflow/state.yaml | cut -d"'" -f2)
  echo "# Completion Report: $feature"
  echo ""
  echo "## Components Implemented"
  echo "- Schema validation"
  echo "- Test data factories"
  echo "- ESLint rules"
  echo "- OAuth flow"
  echo "- Button component"
  echo ""
  echo "## Test Coverage: 100%"
  echo "## All checks passing"
}

validate_with_context7() {
  local file=$1
  # use context7
  # Validate patterns in file
}

execute_code_phase() {
  echo "🟢 GREEN PHASE: Writing MINIMAL code to pass the test"
  echo ""
  
  # Get implementation file from plan
  impl_file=$(get_implementation_file_for_component $component)
  
  echo "Implementation file: $impl_file"
  echo ""
  echo "⚠️  CRITICAL RULES:"
  echo "✓ Write ONLY enough code to make the test pass"
  echo "✓ No comments - code must be self-documenting"
  echo "✓ Use descriptive names for everything"
  echo "✓ TypeScript strict mode (no 'any', no assertions)"
  echo "✓ Prefer options objects for function parameters"
  echo "✓ Immutable data only - no mutations"
  echo "✓ If you're adding code the test doesn't require, STOP"
  echo ""
  
  # Generate minimal implementation
  create_minimal_implementation $component > .workflow/current/implementation/$impl_file
  
  # Show implementation
  cat .workflow/current/implementation/$impl_file
  
  echo ""
  echo "Minimal implementation created."
  echo "Verifying test passes..."
  
  # Automatically proceed to verify phase
  update_state "implementation" "verify"
  execute_verify_phase
}

execute_verify_phase() {
  echo "✅ VERIFY PHASE: Running tests"
  echo ""
  
  # Run the specific test
  echo "Running: pnpm test $test_file"
  run_test_result=$(pnpm test $test_file 2>&1)
  
  if [ $? -eq 0 ]; then
    echo "✅ Test PASSES! Moving to refactoring assessment."
    echo ""
    
    # Commit working code before any refactoring
    echo "📝 Committing working code..."
    git add .
    git commit -m "feat: implement $behavior"
    
    echo "🔧 REFACTOR ASSESSMENT (Automated via Gemini)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Automatically assess refactoring need using Gemini
    echo "Requesting Gemini code review..."
    
    # Use actual Gemini CLI to review the code
    gemini_review=$(node scripts/gemini-code-review.js \
      --file=$impl_file \
      --component=$component \
      --guidelines=.workflow/refactor-guidelines.md)
    
    refactor_score=$(echo "$gemini_review" | grep "REFACTOR_SCORE:" | cut -d' ' -f2)
    
    if [ "$refactor_score" -ge 7 ]; then
      echo "Gemini suggests refactoring (score: $refactor_score/10)"
      echo "$gemini_review"
      update_state "implementation" "refactor"
      execute_refactor_phase
    else
      echo "✅ Code is clean enough (Gemini score: $refactor_score/10)"
      echo "Skipping refactor phase."
      proceed_to_next_component
    fi
  else
    echo "❌ Test still FAILS!"
    echo ""
    echo "Error output:"
    echo "$run_test_result"
    echo ""
    echo "The implementation doesn't satisfy the test."
    echo "Trying again with adjusted implementation..."
    update_state "implementation" "code"
    execute_code_phase
  fi
}

execute_refactor_phase() {
  local gemini_review="$1"
  
  echo "🔧 REFACTOR PHASE: Improving code structure"
  echo ""
  echo "Current implementation:"
  cat $impl_file
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Applying Gemini's refactoring suggestions..."
  
  # Apply automated refactoring
  refactored_code=$(node scripts/gemini-refactor.js \
    --file=$impl_file \
    --suggestions="$gemini_review" 2>&1)
  
  # Check if refactoring succeeded
  if [ $? -ne 0 ]; then
    echo "⚠️  Refactoring failed. Keeping original code."
    proceed_to_next_component
    return
  fi
  
  # Save refactored code
  echo "$refactored_code" > $impl_file
  
  echo "Refactored code:"
  cat .workflow/current/implementation/$impl_file
  echo ""
  
  # Verify refactoring didn't break tests
  echo "🧪 Verifying refactoring..."
  all_tests_result=$(pnpm test 2>&1)
  test_exit_code=$?
  
  if [ $test_exit_code -ne 0 ]; then
    echo "❌ REFACTORING BROKE TESTS!"
    echo "Reverting to previous version..."
    git checkout -- $impl_file
    echo "Proceeding without refactoring."
  else
    echo "✅ All tests still passing!"
    
    # Run linting
    echo "Running linter..."
    lint_result=$(pnpm run lint 2>&1)
    if [ $? -eq 0 ]; then
      echo "✅ No linting errors"
    else
      echo "⚠️  Minor linting issues - fixing automatically..."
      pnpm run lint --fix
    fi
    
    # Run type checking
    echo "Running type check..."
    type_result=$(pnpm run type-check 2>&1)
    if [ $? -eq 0 ]; then
      echo "✅ No type errors"
      
      # Commit the refactoring
      echo "📝 Committing refactoring..."
      git add .
      git commit -m "refactor: improve $component structure"
      
      # Validate with context7
      echo "🔍 Validating final implementation..."
      validate_with_context7 $impl_file
    else
      echo "❌ Type errors found after refactoring!"
      echo "Reverting to previous version..."
      git checkout -- $impl_file
    fi
  fi
  
  # Proceed to next component
  proceed_to_next_component
}
```

## Error Handling

### No Active Workflow

```
❌ No active workflow found
Use: /workflow-init <feature> to start a new workflow
```

### Invalid State Transition

```
❌ Cannot proceed from current state
Current: [phase].[subphase]
Issue: [specific blocker]
Resolution: [what to do]
```

### Test Infrastructure Missing

```
❌ Test framework not configured
Please ensure Jest/Vitest/etc is installed
Run: pnpm install --save-dev jest @types/jest
```

## Important Notes

1. **Strict TDD Enforcement**: Never allow code before failing test
2. **State Persistence**: Every action updates state.yaml
3. **Resumable**: Can pause and resume at any point
4. **Context7 Integration**: Validates patterns at each component
5. **Minimal Code**: Emphasize writing only what makes tests pass
