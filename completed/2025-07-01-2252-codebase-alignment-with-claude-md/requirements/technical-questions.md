# Technical Questions for codebase-alignment-with-claude-md

These questions help refine the technical approach based on your codebase analysis.
All questions are yes/no with smart defaults if unknown.

## Q1: Should we create a centralized schema package/module for all Zod schemas?

**Default if unknown:** Yes
**Why we ask:** Centralizing schemas ensures single source of truth and prevents duplication across the codebase.
**Your answer:** yes

## Q2: Should authentication remain OAuth-only or add email/password support?

**Default if unknown:** Keep OAuth-only
**Why we ask:** Affects the complexity of schemas and validation logic we need to implement.
**Your answer:** yes (keep OAuth-only)

## Q3: Should we implement custom ESLint rules to enforce CLAUDE.md principles?

**Default if unknown:** Yes
**Why we ask:** Custom rules can catch violations that standard rules miss (like comments, test organization).
**Your answer:** yes

## Q4: Should error messages be part of the schema definitions?

**Default if unknown:** Yes
**Why we ask:** Co-locating error messages with schemas improves maintainability and consistency.
**Your answer:** yes

## Q5: Should we use Svelte 5 runes in test files?

**Default if unknown:** No
**Why we ask:** Test files can use simpler patterns since they don't need reactivity, but consistency might be valuable.
**Your answer:** no
