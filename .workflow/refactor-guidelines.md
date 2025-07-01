# Refactoring Guidelines for Code Assessment

## Scoring Criteria (0-10)

Score 0-3: Code is already clean, no refactoring needed
Score 4-6: Minor improvements possible but not critical
Score 7-10: Refactoring strongly recommended

## Assessment Checklist

### Naming and Clarity (Weight: 30%)
- [ ] Are all variable and function names descriptive and clear?
- [ ] Do names express intent without needing comments?
- [ ] Are there any abbreviations that should be expanded?
- [ ] Are boolean variables named as questions (e.g., isValid, hasPermission)?

### Code Structure (Weight: 25%)
- [ ] Are there magic numbers that should be named constants?
- [ ] Is there duplicated knowledge (not just code)?
- [ ] Are functions focused on a single responsibility?
- [ ] Is nesting kept to a maximum of 2 levels?
- [ ] Are early returns used instead of nested if/else?

### TypeScript Best Practices (Weight: 20%)
- [ ] Are there any 'any' types that can be made specific?
- [ ] Are type assertions avoided where possible?
- [ ] Are utility types (Pick, Omit, Partial) used effectively?
- [ ] Are domain-specific types created for better type safety?

### Functional Programming (Weight: 15%)
- [ ] Is data kept immutable throughout?
- [ ] Are functions pure where possible?
- [ ] Are array methods used instead of imperative loops?
- [ ] Is composition used over complex logic?

### API Design (Weight: 10%)
- [ ] Are options objects used for functions with optional parameters?
- [ ] Are related parameters grouped into objects?
- [ ] Is the public API minimal and focused?
- [ ] Are return types consistent and predictable?

## Automatic Refactoring Triggers

### MUST refactor if:
- Magic numbers exist without named constants
- Functions exceed 20 lines
- Nesting depth exceeds 3 levels
- 'any' type is used
- Duplicated logic spans more than 3 lines

### SHOULD refactor if:
- Variable names are unclear or abbreviated
- Complex conditionals lack extracted predicates
- Multiple parameters could be an options object
- Similar patterns repeat 3+ times