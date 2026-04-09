<div align="center">
  <img width="300" height="200" src="./docs-site/public/vbem.svg" />
  <br>
  <h1>vBEM</h1>
  <p>An architectural approach to styling that enforces constraint-driven development using scoped CSS variables, BEM modifiers, and variable delegation.</p>
</div>

## Overview

vBEM (Variance-Based Block Element Modifier) is a design system architecture built for delivery velocity, developer ergonomics, and long-term scaling.

It bridges the gap between standard BEM specificity management and utility-first fragmentation. By treating CSS variables as absolute visual contracts, vBEM provides a single source of truth for component logic—ensuring strict consistency while remaining highly readable for both human developers and LLM/AI agents.

## Why vBEM?

Modern styling often forces teams to choose between semantic, cascading CSS (which scales poorly) and utility-first frameworks like Tailwind (which provide safety but pollute the DOM and scatter logic). vBEM offers a third path: **Velocity through constrained scoping.**

### 1. Developer Ergonomics & Cognitive Locality

Tailwind's ergonomics rely on never leaving the HTML file, but this results in massive, unreadable class strings scattered across multiple React/Vue components. vBEM provides **cognitive locality**. A developer (or an AI) can open a single SCSS block, read the variable "contract" at the top, and immediately understand the component's exact mutable surface area without hunting through the DOM.

### 2. Scoped Delegation (No Prop-Drilling)

vBEM allows parent components to control child primitives and sub-blocks exclusively through variable mapping. Instead of passing React props or writing deep CSS overrides, a parent block maps its contextual variables directly into the child's exposed variable API. This drastically reduces redundant BEM classes in your HTML.

### 3. AI & LLM Predictability

As teams increasingly rely on AI to generate and refactor UI components, scattered utility classes and implicit global imports lead to hallucinations. vBEM enforces a strict, self-contained variable contract. An AI model can reliably predict exactly which property changes when a modifier is applied, resulting in safe, deterministic code generation.

## The vBEM Structure

Defining a component requires explicit contracts and clear contextual definitions. Notice how global dependencies, base primitives, and the component variance are logically grouped, and how the architecture isolates variance from stable layout properties via the 4-Part Schema.

```scss
// global
// IMPORTANT: Global tokens are strictly read-only. Components map these
// to their local scopes rather than consuming them directly in CSS properties.
:root {
	--text-size-1: 14px;
	--text-size-2: 17px;

	--padding-1: 10px;
	--padding-2: 16px;

	--color-white: #f8f8f8;
	--color-red: #ff3333;
}

// primitives
// Primitives expose a variable API for parent components to hook into safely.
p,
pre {
	// 1. VARIANCE PROPERTIES (The Contract)
	--text-size: inherit;

	// 3. PROPERTY SET (The Execution)
	font-size: var(--text-size);
}

// sub-blocks
// Standalone blocks operate on their own scoped contracts.
.button {
	// 1. VARIANCE PROPERTIES (The Contract)
	--background: var(--color-white);
	--color: var(--color-red);

	// 3. PROPERTY SET (The Execution)
	background-color: var(--background);
	color: var(--color);
}

// components
.cta-block {
	// 1. VARIANCE PROPERTIES (The Contract)
	// IMPORTANT: Notice how we define abstract themes (--accent-color) rather than
	// literal CSS properties. This creates a semantic API for the component, giving
	// human operators and LLMs an explicit blueprint of what can be modified.
	--accent-color: var(--color-red);
	--button-color: var(--color-white);
	--padding-x: var(--padding-1);
	--padding-y: var(--padding-2);

	// Variables controlling child/primitive delegation also belong in the contract
	--block-text-size: var(--text-size-1);

	// 2. STATIC PROPERTIES (The Physics)
	// IMPORTANT: Properties that NEVER variate across states/modifiers remain hardcoded.
	// This strict separation guarantees that layout physics won't break during state changes.
	display: flex;
	flex-direction: column;

	// 3. PROPERTY SET (The Execution)
	// Applying the variable contract to the actual CSS properties.
	padding: var(--padding-y) var(--padding-x);
	gap: var(--padding-y);

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	& > p,
	& > pre {
		// IMPORTANT: Scoped Delegation. Instead of targeting the element's font-size
		// directly (which breaks encapsulation and increases specificity), we map our
		// local scope variables into the primitive's exposed variable API.
		--text-size: var(--block-text-size);
	}

	& > .button {
		// Scoped Delegation prevents the need for bloated React prop-drilling or
		// messy CSS specificity overrides like `.cta-block .button { ... }`.
		--background: var(--accent-color);
		--color: var(--button-color);
	}

	&--large {
		// Modifiers ONLY reassign variables. They never apply raw CSS properties.
		--padding-y: var(--padding-2);

		// IMPORTANT: Changing this one variable safely cascades down to the nested
		// primitives without requiring additional BEM modifier classes in the HTML markup.
		--block-text-size: var(--text-size-2);
	}
}
```

## Architectural Safety Guarantees

By following these architectural patterns, teams guarantee that their CSS remains scalable, predictable, and free of specificity wars:

1. **The Visual Contract:** All mutable values must be explicitly declared as variables at the top of the block. If a value does not variate, it remains a static property.
2. **State Mutation:** Interaction states (`&:hover`) and BEM modifiers (`&--variant`) mutate variables. They must never apply raw CSS properties directly.
3. **Flat Specificity:** The `!important` flag is obsolete. Variance is achieved through variable reassignment, ensuring the cascade remains perfectly flat.
4. **Explicit Dependencies:** Code blocks must explicitly show their variable lineage. Do not rely on "ghost" imports; map globals to locals explicitly.
5. **Read-Only Globals:** Components may consume global tokens via `var()`, but local scopes must never mutate a global token directly.

## Production & Reference Implementations

vBEM is not a theoretical framework; it has been actively utilized in production environments for over a year across multiple enterprise client engagements.

While the majority of these applications are bound by strict Non-Disclosure Agreements (NDAs), the following public projects demonstrate the architecture in practice:

- **[The vBEM Documentation Site](https://vbem.dev):** Built with Astro, this site serves as the open-source reference implementation. You can view the code in the [`/docs-src`](./docs-site/) directory of this repository to observe how vBEM contracts interface with component-driven frameworks to eliminate prop-drilling and utility clutter.
- **[Flynn's Professional Website](https://flyn.ca):** A live, production-grade application built entirely on the vBEM architecture. While closed-source, it serves as a public demonstration of how the methodology yields pristine DOM rendering, flat specificity, and highly performant UI layouts.

## Knowledge Base

Refer to the `docs` folder for detailed specifications:

- **[docs/variance.md](./docs/variance.md)**: Rules for modifiers, states, and mutation logic.
- **[docs/llm-integration.md](./docs/llm-integration.md)**: Best practices for structuring styles for agent-based generation.
- **[docs/protocol.md](./docs/protocol.md)**: Workflow, file structure, and build process.
- **[docs/rationale.md](./docs/rationale.md)**: Justifications for architectural decisions and strategic choices.

## Framework Comparison

The following table contrasts the mechanics of vBEM against legacy and utility-first methodologies. Click on any architectural pillar to read the explicit rationale and code comparisons.

| Architectural Pillar                                                                    | Standard BEM                     | Utility-First (Tailwind)   | vBEM Solution                    |
| :-------------------------------------------------------------------------------------- | :------------------------------- | :------------------------- | :------------------------------- |
| **[DOM Architecture](./docs/rationale.md#dom-pollution)**                               | Clean (Semantic classes)         | Polluted (Utility strings) | **Clean (Semantic contracts)**   |
| **[Style Specificity](./docs/rationale.md#specificity-wars)**                           | Escalating (`.block--mod:hover`) | Flat (No cascade)          | **Flat (Variable reassignment)** |
| **[Component Composition](./docs/rationale.md#scoped-delegation-composite-primitives)** | Deep CSS Overrides               | React Prop-Drilling        | **Scoped Delegation**            |
| **[Variance Mechanics](./docs/rationale.md#variance-modifiers)**                        | Modifier Classes                 | Utility Tokens             | **Variable Modifiers**           |
| **[Inheritance Control](./docs/rationale.md#scalability-and-isolation)**                | Prone to Cascade Leaks           | Strict Isolation           | **Scope Isolation (`unset`)**    |
| **[AI Predictability](./docs/rationale.md#ai-reasoning-and-predictability)**            | Low (Implicit rules)             | Medium (HTML-coupled)      | **High (Explicit variables)**    |

## License

Copyright (C) 2025 - 2026 Flynn.

All rights reserved. This open-source project is subject to the MIT License. Enterprise usage for engagement partners is permitted under the terms of the individual NDA/Service Agreement.
