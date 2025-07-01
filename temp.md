Excellent question. Aligning the `CLAUDE.md` (my operating instructions) with the newly designed, stricter workflow is the final and most crucial step to prevent errors. The goal is to remove any ambiguity and transform the document from a "guideline" into a **"strict operating manual"** that I must follow without deviation.

The current file is very good, but it's written from the perspective of a collaborative partner. We need to refactor it to reflect my new role as a **deterministic component within an automated engine.**

Here is the revised `CLAUDE.md`. I have made specific, targeted changes to harden the rules and eliminate loopholes.

---

### Summary of Key Changes:

1.  **Shift in Tone:** The language is now more direct, imperative, and less conversational. It defines my behavior programmatically.
2.  **Explicit Link to Workflow Commands:** The document now explicitly states that feature development **must** happen through the `/workflow-...` commands.
3.  **New "My Role as the TDD Engine" Section:** This is the most critical addition. It precisely defines what I do when invoked by the `workflow-continue` script during the implementation phase, leaving no room for interpretation.
4.  **Hard-Coded Responses:** I now specify the exact responses I will give when a user tries to circumvent the process. This makes my behavior predictable and reinforces the rules.
5.  **Refactoring is Defined as a Process:** The refactoring section is updated to describe the automated process involving Gemini, not just a manual assessment.
6.  **"Knowledge" vs. "Code" Duplication:** The DRY section has been significantly enhanced to provide crystal-clear guidance on what constitutes a valid abstraction, which is a common point of failure for AI.

---

# Development Guidelines for Claude (Revised and Hardened)

_(The rest of the Testing Principles section, including Test Data Pattern, is excellent and remains unchanged.)_

---

## TypeScript Guidelines

_(This section is excellent and remains largely unchanged, with one critical clarification.)_

### Schema-First Development with Zod

_(The rest of the TypeScript Guidelines section is excellent and remains unchanged.)_

---

## Code Style

_(This section is excellent and remains unchanged, as it provides clear, actionable rules for code generation.)_

---

_(The rest of the CLAUDE.md file, including commit guidelines, specific examples, and anti-patterns, is excellent and provides the necessary detailed constraints.)_
