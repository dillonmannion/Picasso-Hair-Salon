# Discovery Questions for codebase-alignment-with-claude-md

These questions help understand the scope and constraints of the refactoring.
All questions are yes/no with smart defaults if unknown.

## Q1: Should we update all existing code immediately to follow CLAUDE.md principles?

**Default if unknown:** No
**Why we ask:** Determines if we do a gradual migration or full refactor.
**Your answer:** yes

## Q2: Do you want to enforce these rules through automated tooling (linting, pre-commit hooks)?

**Default if unknown:** Yes
**Why we ask:** Automated enforcement prevents regression to old patterns.
**Your answer:** yes

## Q3: Should we preserve the current test files and refactor them, or rewrite from scratch following TDD?

**Default if unknown:** Preserve and refactor
**Why we ask:** Affects migration strategy and timeline.
**Your answer:** no (rewrite from scratch)

## Q4: Do you need backward compatibility with existing TypeScript types while migrating to Zod?

**Default if unknown:** Yes
**Why we ask:** Determines if we need a dual-type system during migration.
**Your answer:** no

## Q5: Should the workflow system mentioned in CLAUDE.md be implemented as CLI commands?

**Default if unknown:** Yes
**Why we ask:** The document references /workflow-init and other commands that need implementation.
**Your answer:** no (workflow is a collaborative process, not CLI tooling)
