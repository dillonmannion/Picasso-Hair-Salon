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

# Execute Gemini review with correct argument format
node scripts/gemini-review.js \
  --plan=.workflow/current/plan/implementation-plan.md \
  --requirements=.workflow/current/requirements/specification.md \
  --iteration=$iteration \
  --output=.workflow/current/plan/gemini-review-$iteration.md

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
test_output=$(npm test $test_file 2>&1)
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
echo "Ready to write MINIMAL code to make this test pass? Use: /workflow-continue"

update_state "implementation" "code"
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
echo "Ready to verify test passes? Use: /workflow-continue"

update_state "implementation" "verify"
```

#### Subphase: verify

```bash
echo "✅ VERIFY PHASE: Running tests"
echo ""

# Run the specific test
echo "Running: npm test $test_file"
run_test_result=$(npm test $test_file 2>&1)

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

  echo "Does this code need refactoring? (yes/no/skip)"
  echo "Note: It's perfectly fine to skip if code is already clean!"

  # Wait for user decision
  # If yes: enter refactor subphase
  # If no/skip: continue to next component

  update_state "implementation" "refactor_decision"
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
# Handle user's refactoring decision
echo "Refactoring decision received: $user_input"

case "$user_input" in
  "yes"|"y")
    echo ""
    echo "🔧 Entering REFACTOR phase"
    echo "Remember: External behavior must NOT change!"
    update_state "implementation" "refactor"
    ;;

  "no"|"n"|"skip"|"s")
    echo ""
    echo "✅ Skipping refactor - code is clean enough"

    # Validate with context7
    echo "🔍 Validating implementation pattern..."
    validate_with_context7 $impl_file

    # Move to next component
    proceed_to_next_component
    ;;

  *)
    echo "Please answer: yes/no/skip"
    # Stay in refactor_decision state
    ;;
esac
```

#### Subphase: refactor

```bash
echo "🔧 REFACTOR PHASE: Improving code structure"
echo ""
echo "Current implementation:"
cat .workflow/current/implementation/$impl_file
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Refactoring guidelines:"
echo "✓ Extract magic numbers to named constants"
echo "✓ Extract complex expressions to well-named functions"
echo "✓ Simplify conditional logic with early returns"
echo "✓ Group related functionality"
echo "✓ Ensure all names clearly express intent"
echo "✓ Apply functional patterns (immutability, pure functions)"
echo "✓ Use options objects for complex parameters"
echo ""
echo "⚠️  CRITICAL: Do NOT change external behavior!"
echo "    All tests must continue to pass unchanged"
echo ""

# Let user refactor the code
echo "Refactor the code following the guidelines above."
echo "When done, use: /workflow-continue"

update_state "implementation" "refactor_verify"
```

#### Subphase: refactor_verify

```bash
echo "🧪 Verifying refactoring..."
echo ""

# Run all tests to ensure nothing broke
echo "Running all tests to ensure behavior unchanged..."
all_tests_result=$(npm test 2>&1)
test_exit_code=$?

if [ $test_exit_code -ne 0 ]; then
  echo "❌ REFACTORING BROKE TESTS!"
  echo ""
  echo "This means you changed behavior, not just structure."
  echo "Either:"
  echo "1. Fix the refactoring to maintain behavior"
  echo "2. Revert to the committed version"
  echo ""
  echo "Test output:"
  echo "$all_tests_result" | tail -20

  update_state "implementation" "refactor"
  exit 1
fi

echo "✅ All tests still passing!"

# Run linting
echo "Running linter..."
lint_result=$(npm run lint 2>&1)
if [ $? -ne 0 ]; then
  echo "⚠️  Linting issues found. Please fix."
  update_state "implementation" "refactor"
  exit 1
fi

# Run type checking
echo "Running type check..."
type_result=$(npm run type-check 2>&1)
if [ $? -ne 0 ]; then
  echo "❌ Type errors found. Please fix."
  update_state "implementation" "refactor"
  exit 1
fi

echo ""
echo "✅ Refactoring complete and verified!"
echo ""

# Commit the refactoring separately
echo "📝 Committing refactoring..."
git add .
git commit -m "refactor: improve $component structure"

# Validate with context7
echo "🔍 Validating final implementation..."
validate_with_context7 $impl_file

# Proceed to next component
proceed_to_next_component
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
    echo "Ready for next component? Use: /workflow-continue"
  else
    echo "🎉 All components implemented!"
    update_checkpoint "implementation_complete" "true"
    update_state "complete" "review"
  fi
}

### PHASE: Complete

```bash
echo "🏁 Running final verification..."
echo ""

# Run all tests
echo "Running complete test suite..."
npm test

# Run linting
echo "Running linting..."
npm run lint

# Run type checking
echo "Running type checking..."
npm run type-check

# Generate completion report
generate_completion_report > .workflow/current/completion-report.md

echo ""
echo "✅ Feature implementation complete!"
echo ""
echo "Summary:"
cat .workflow/current/completion-report.md

echo ""
echo "Ready to finalize and archive? Use: /workflow-complete"
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
}

validate_with_context7() {
  local file=$1
  # use context7
  # Validate patterns in file
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
Run: npm install --save-dev jest @types/jest
```

## Important Notes

1. **Strict TDD Enforcement**: Never allow code before failing test
2. **State Persistence**: Every action updates state.yaml
3. **Resumable**: Can pause and resume at any point
4. **Context7 Integration**: Validates patterns at each component
5. **Minimal Code**: Emphasize writing only what makes tests pass
