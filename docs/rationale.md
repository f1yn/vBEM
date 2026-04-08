# Rationale and Design Decisions

This document details the architectural reasoning behind specific decisions made within the vBEM style system. It acts as the definitive contextual guide for human developers and LLM agents evaluating or generating vBEM component code.

## DOM Pollution

**Context:** Utility-first frameworks (e.g., Tailwind) introduce fragmented logic where style definition is coupled directly to the HTML markup.

**Reasoning:** Utility frameworks pollute the DOM, making the HTML the source of truth for visual logic. This results in massive, unreadable class strings and tight coupling. vBEM consolidates logic into the SCSS file as a semantic contract, ensuring the visual API remains localized, declarative, and framework-agnostic.

```scss
// global
:root {
	--padding-2: 16px;
	--radius-1: 8px;
	--color-white: #f8f8f8;
	--color-blue: #0066cc;
}

// The Problem (Tailwind DOM equivalent):
// <div class="p-4 rounded-lg border-2 border-transparent bg-white hover:border-blue-500 transition-colors">

// The Solution (vBEM Semantic Equivalent):
// <div class="ui-card ui-card--interactive">

.ui-card {
	// 1. VARIANCE PROPERTIES (The Contract)
	// IMPORTANT: We define the mutable surface area here. LLMs and humans can
	// immediately see what can change without scanning the entire file.
	--padding: var(--padding-2);
	--border-radius: var(--radius-1);
	--border-color: transparent;
	--background: var(--color-white);

	// 2. STATIC PROPERTIES (The Physics)
	display: flex;
	flex-direction: column;

	// 3. PROPERTY SET (The Execution)
	border-radius: var(--border-radius);
	padding: var(--padding);
	background-color: var(--background);
	border: 2px solid var(--border-color);
	transition: border-color 0.2s;

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	&--interactive {
		// IMPORTANT: Modifiers only ever mutate the established variables.
		// Operators cannot bypass this logic without intentionally breaking the API.
		&:hover {
			--border-color: var(--color-blue);
		}
	}
}
```

## Specificity Wars

**Context:** Standard BEM often leads to deep nesting and specificity conflicts when modifiers need to override base styles.

**Reasoning:** vBEM eliminates specificity wars by shifting visual logic into CSS variables. Instead of increasing CSS selector specificity (e.g., `.nav-link--active:hover { color: blue; }`), vBEM updates the variable within the conditional selector, keeping the cascade entirely flat.

```scss
// global
:root {
	--color-grey: #999999;
	--color-blue: #0066cc;
	--color-light-grey: #f5f5f5;
}

// components
.nav-link {
	// 1. VARIANCE PROPERTIES (The Contract)
	--text-color: var(--color-grey);
	--bg-color: transparent;

	// 2. STATIC PROPERTIES (The Physics)
	cursor: pointer;
	text-decoration: none;

	// 3. PROPERTY SET (The Execution)
	color: var(--text-color);
	background-color: var(--bg-color);
	transition:
		color 0.2s,
		background-color 0.2s;

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	// IMPORTANT: Because we only update variables, the compiled CSS maintains
	// a uniform specificity of 0,1,0. It is mathematically impossible to trigger
	// an !important war using this architecture.
	&:hover {
		--text-color: var(--color-blue);
		--bg-color: var(--color-light-grey);
	}
}
```

## Scoped Delegation (Composite Primitives)

**Context:** Communicating state and theme data from a parent layout to a child primitive or sub-block without polluting the DOM.

**Reasoning:** In React/Tailwind, altering a child component based on a parent's state requires bloated prop-drilling. In standard BEM, it requires deep CSS overrides (`.parent .child { ... }`). vBEM introduces **Scoped Delegation**: the parent defines abstract variables in Part 1 and maps them directly into the child's exposed API in Part 4.

```scss
// global
:root {
	--text-size-1: 14px;
	--text-size-2: 17px;
	--padding-1: 10px;
	--padding-2: 16px;

	--color-white: #f8f8f8;
	--color-deep-dark: #151515;
	--color-red: #ff3333;
	--color-light-green: #aaffaa;
}

// primitives
p,
pre {
	// 1. VARIANCE PROPERTIES (The Contract)
	--text-size: inherit;
	// ...
	// 3. PROPERTY SET (The Execution)
	font-size: var(--text-size);
}

// sub-blocks
.button {
	// 1. VARIANCE PROPERTIES (The Contract)
	--background: var(--color-red);
	--color: var(--color-white);

	// 3. PROPERTY SET (The Execution)
	background-color: var(--background);
	color: var(--color);
}

// components
.cta-block {
	// 1. VARIANCE PROPERTIES (The Contract)
	// Abstract properties affecting cascade and delegation
	--accent-color: var(--color-red);
	--button-color: var(--color-white);
	--padding-x: var(--padding-1);
	--padding-y: var(--padding-2);
	--block-text-size: var(--text-size-1);

	// 2. STATIC PROPERTIES (The Physics)
	display: flex;
	flex-direction: column;

	// 3. PROPERTY SET (The Execution)
	padding: var(--padding-y) var(--padding-x);
	gap: var(--padding-y);

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	& > p,
	& > pre {
		// IMPORTANT: Delegation in action. The parent maps its local variable
		// into the primitive's exposed variable. No classes added to HTML.
		--text-size: var(--block-text-size);
	}

	& > .button {
		// IMPORTANT: We safely configure the child's API. We do NOT write
		// `background-color: red` here, preserving the child's encapsulation.
		--background: var(--accent-color);
		--color: var(--button-color);
	}

	&--light-green {
		// Controls the primitives and the BEM children from a single semantic source.
		--accent-color: var(--color-light-green);
		--button-color: var(--color-deep-dark);
	}
}
```

## Variance Modifiers

**Context:** How visual and structural changes are applied to component boundaries.

**Reasoning:** BEM relies on appending modifier classes; utility frameworks inject raw utility tokens. vBEM binds modifiers exclusively to variable reassignments. Changing one abstract variable updates every property that relies on it simultaneously, maintaining absolute UI consistency.

```scss
// global
:root {
	--color-surface: #ffffff;
	--color-red: #d92525;
	--color-green: #25d962;
	--padding-2: 16px;
}

// components
.alert {
	// 1. VARIANCE PROPERTIES (The Contract)
	// IMPORTANT: We use abstract, semantic names (--accent-color) rather than literal
	// property names (--border-left-color). Because variables are block-scoped, we
	// never have to worry about this --accent-color conflicting with a parent's variable.
	--bg-color: var(--color-surface);
	--accent-color: transparent;
	--text-color: inherit;

	// 2. STATIC PROPERTIES (The Physics)
	padding: 12px var(--padding-2);
	border-left-width: 4px;
	border-left-style: solid;
	border-radius: 4px;

	// 3. PROPERTY SET (The Execution)
	// The abstract --accent-color is mapped to the specific CSS property.
	background-color: var(--bg-color);
	color: var(--text-color);
	border-left-color: var(--accent-color);
	transition:
		background-color 0.2s,
		border-left-color 0.2s;

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	& > .icon {
		// We can confidently map the abstract accent to the child's fill color
		--icon-fill: var(--accent-color);
	}

	&--error {
		// Modifiers ONLY mutate the semantic variables.
		--bg-color: #fff0f0;
		--accent-color: var(--color-red);
		--text-color: var(--color-red);
	}

	&--success {
		--bg-color: #f0fff0;
		--accent-color: var(--color-green);
		--text-color: var(--color-green);
	}
}
```

## Scalability and Isolation

**Context:** Managing style inheritance across large, nested DOM trees in enterprise applications.

**Reasoning:** In vBEM, standard variable shadowing naturally isolates your component. The block becomes the absolute source of truth the moment you declare a default variable in Part 1. You **do not** need to use `unset` as boilerplate to clear a variable first. The `unset` keyword is an explicit boundary tool, required _only_ when a component must strip an inherited property but has no relevant default value to replace it with.

```scss
// global
:root {
	--color-text-base: #333333;
}

// components
.reset-wrapper {
	// 1. VARIANCE PROPERTIES (The Contract)
	// IMPORTANT: We use `unset` here because we don't have a default width,
	// but we MUST ensure this wrapper ignores any parent grid constraints.
	// Do NOT use this technique if you already have a default variable value.
	--container-width: unset;
	--text-color: var(--color-text-base); // Standard shadowing is enough here

	// 2. STATIC PROPERTIES (The Physics)
	display: block;

	// 3. PROPERTY SET (The Execution)
	width: var(--container-width);
	color: var(--text-color);
}
```

## AI Reasoning and Predictability

**Context:** Why this architecture is optimized for Large Language Models (LLMs) and Agentic code generation.

**Reasoning:** LLMs predict and generate code successfully when patterns are mathematically consistent and contextual references are explicit. A universally understood component, like a form input, highlights this perfectly. When an AI is asked to add an "error" state to a generic component, it often hallucinates raw CSS properties (`border: red !important`). In vBEM, the strict variable contract mathematically bounds the AI's output.

```scss
// global
:root {
	--color-grey-1: #e2e8f0;
	--color-grey-2: #94a3b8;
	--color-blue: #3b82f6;
	--color-red: #ef4444;
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}

// components
.form-input {
	// 1. VARIANCE PROPERTIES (The Contract)
	// IMPORTANT: An LLM reads this block and instantly understands the exact
	// API surface of this component. It does not have to hallucinate properties.
	--border-color: var(--color-grey-1);
	--text-color: var(--color-grey-2);
	--focus-ring-width: 0px;
	--focus-ring-color: transparent;
	--input-shadow: var(--shadow-sm);

	// 2. STATIC PROPERTIES (The Physics)
	width: 100%;
	border-style: solid;
	border-width: 1px;
	outline: none;

	// 3. PROPERTY SET (The Execution)
	color: var(--text-color);
	border-color: var(--border-color);
	box-shadow:
		var(--input-shadow),
		0 0 0 var(--focus-ring-width) var(--focus-ring-color);
	transition:
		border-color 0.2s,
		box-shadow 0.2s;

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	&--error {
		// IMPORTANT: When prompted to generate an error state, an AI will deterministically
		// mutate these exact variables instead of blindly appending raw CSS overrides.
		--border-color: var(--color-red);
		--text-color: var(--color-red);
	}

	&:focus {
		// Interaction states safely modify complex visual outputs (like composite box-shadows)
		// by simply updating the variable values established in the contract.
		--border-color: var(--color-blue);
		--focus-ring-width: 3px;
		--focus-ring-color: var(--color-blue);
	}
}
```
