# LLM & Agent Integration Guide

vBEM was architected specifically to optimize Large Language Model (LLM) predictability. By replacing implicit CSS cascades with explicit variable contracts, vBEM provides AI agents with a deterministic mathematical schema.

This document outlines how to configure your AI tools and structure your prompts to generate flawless, production-ready vBEM components with zero hallucinations.

## 1. Why vBEM Optimizes AI Generation

When an LLM attempts to generate state-driven UI in standard CSS or Tailwind, its "attention" is scattered across the DOM, utility strings, and complex pseudo-selectors. This leads to hallucinated overrides and DOM pollution.

vBEM solves this by establishing a **Strict Visual Contract**.
When an LLM reads a vBEM block, it immediately knows the component's exact mutable surface area. If you ask an AI to "Add a disabled state," it doesn't need to guess which properties to override; it simply references the contract at the top of the file and mutates the pre-existing variables.

## 2. IDE Configuration (Passive Guardrails)

To prevent models from falling back on their generic training data (Tailwind/CSS-in-JS), you must inject vBEM protocol rules into your IDE's system prompt context.

If your team uses **Cursor**, **Windsurf**, or **Cline**, place a `vbem-styling.mdc` (or `.cursorrules`) file in your workspace root containing these absolute directives:

```markdown
# System Directive: vBEM Architecture

You are a Senior UI Architect. All CSS/SCSS generated in this repository must strictly adhere to the vBEM (Variance-Based Block Element Modifier) protocol.

1. **NO UTILITY CLASSES:** Never use Tailwind or utility classes in HTML/JSX.
2. **THE 4-PART SCHEMA:** Every SCSS block must follow this exact top-to-bottom order:
    -   1. VARIANCE PROPERTIES (The Contract)
    -   2. STATIC PROPERTIES (The Physics)
    -   3. PROPERTY SET (The Execution)
    -   4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
3. **VARIABLE-ONLY MUTATION:** `&:hover`, `&:focus`, and `&--modifiers` must ONLY reassign CSS variables. Never apply raw CSS properties directly in a state/modifier block.
4. **NO IMPORTANT:** Never use `!important`.
5. **REACT INTEGRATION:** Map finite states to modifier classes. Only use inline styles (`style={{ '--var': ... }}`) for unbounded dynamic data (e.g., coordinates, percentages).
```

## 3. Active Prompting Patterns

When asking an AI to generate or refactor a component, structure your prompt to force it to think in "Contracts" before it thinks in "CSS."

### Pattern A: Generating a New Component

**Goal:** Force the AI to establish the variable schema first.

> **Prompt:**
> "Build a React `UserProfile` component and its accompanying vBEM SCSS.
>
> The visual contract must include variables for background, text color, avatar size, and padding.
> Implement a `compact` variant that shrinks the padding and avatar size.
> Remember to follow the 4-Part vBEM Schema and ensure the React component maps the `isCompact` prop to a modifier class, not an inline style."

### Pattern B: Modifying an Existing Component (Scoped Delegation)

**Goal:** Prevent the AI from writing deep CSS overrides when handling parent-child relationships.

> **Prompt:**
> "I have a `PricingCard` block that contains a `Button` sub-block. I need a new `PricingCard--premium` modifier that changes the card's border to gold, and makes the internal button black.
>
> **CRITICAL:** Use vBEM 'Scoped Delegation' to achieve this. Expose a variable on the card and map it to the button. Do NOT write `.pricing-card--premium .button { ... }`."

### Pattern C: Refactoring Legacy Tailwind to vBEM

**Goal:** Strip DOM pollution and extract abstract variables.

> **Prompt:**
> "Refactor this Tailwind React component into a pure vBEM component.
>
> 1. Extract all visual logic into a new SCSS block following the 4-part schema.
> 2. Replace all utility classes in the JSX with the semantic BEM class names.
> 3. Identify properties that change on `:hover` or state, and extract them into the Variance Properties contract at the top of the SCSS block."

## 4. The AI Output Audit (Self-Correction)

LLMs can occasionally miss a constraint. If an AI generates non-compliant vBEM code, do not manually fix the code. Instead, feed it a "Correction Prompt" so it learns the boundary.

If the AI outputs:

```scss
&--error {
	background-color: red; // ❌ Violation
}
```

**Use this Correction Prompt:**

> "Audit your previous response against the vBEM protocol. You applied a raw CSS property (`background-color`) inside a modifier block. Modifiers are only allowed to reassign CSS variables. Please revise the variable contract and update the modifier."

By forcing the AI to self-correct using protocol terminology, its subsequent generations within that context window will be flawlessly aligned with vBEM standards.
