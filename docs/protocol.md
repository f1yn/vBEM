# Protocol and Implementation Guidelines

This document provides the authoritative blueprint for constructing and consuming vBEM components. It is designed to enforce structural consistency, guarantee optimal rendering performance, and provide explicit parsing rules for LLM agents and code reviewers.

## 1. The Component Schema (SCSS Anatomy)

To ensure machine readability and human cognitive locality, every vBEM block MUST follow a strict top-to-bottom anatomical order. Mixing these sections is a critical violation of the vBEM protocol.

### The 4-Part Block Structure:

1. **Variance Properties (The Contract):** All mutable variables (including delegation variables) are declared first.
2. **Static Properties (The Physics):** Layout and structural CSS that never changes.
3. **Property Set (The Execution):** Mapping the variables to actual CSS properties.
4. **Elements, Delegation & Modifiers (The Mutations & Routing):** Hierarchy, parent-to-child variable routing, and state mutations.

```scss
// global
:root {
	--radius-1: 4px;
	--spacing-1: 8px;
	--spacing-2: 12px;
	--color-dark-1: #111111;
	--color-grey-1: #dddddd;
	--color-blue-1: #0055ff;
}

.badge {
	// 1. VARIANCE PROPERTIES (The Contract)
	// IMPORTANT: Expose the entire mutable API of the component immediately.
	--bg-color: var(--color-grey-1);
	--text-color: var(--color-dark-1);
	--pad-x: var(--spacing-2);
	--pad-y: var(--spacing-1);

	// 2. STATIC PROPERTIES (The Physics)
	// IMPORTANT: These values are immutable. They ensure the component's
	// core structural integrity remains intact regardless of applied modifiers.
	display: inline-flex;
	align-items: center;
	border-radius: var(--radius-1);
	font-weight: 600;

	// 3. PROPERTY SET (The Execution)
	// IMPORTANT: Bind the CSS properties to the variable contract.
	background-color: var(--bg-color);
	color: var(--text-color);
	padding: var(--pad-y) var(--pad-x);
	transition:
		background-color 0.2s,
		color 0.2s;

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	// IMPORTANT: Modifiers must ONLY contain variable reassignments for finite states.
	&--primary {
		--bg-color: var(--color-blue-1);
		--text-color: #ffffff;
	}
}
```

### 1.1 Hierarchical Elements (Lexical Pathing)

Standard BEM strictly forbids chaining elements (e.g., `.block__elem__subelem`). However, modern component architectures often contain complex internal hierarchies that require semantic grouping.

vBEM permits **Hierarchical Elements** if they are used for lexical namespacing to organize variable consumption, provided they compile to a single, flat class name in the HTML. Elements belong in Part 4 of the schema.

```scss
.data-grid {
	// 1. VARIANCE PROPERTIES (The Contract)
	--header-bg: var(--color-grey);
	--title-color: var(--color-dark);

	// ... static properties & property set ...

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	&__header {
		background-color: var(--header-bg);

		// ✅ CORRECT IN vBEM: Hierarchical Element
		// Compiles to `.data-grid__header__title` (Specificity: 0,1,0)
		// This denotes semantic ownership (The title belongs to the header).
		&__title {
			color: var(--title-color);
		}

		// ✅ CORRECT IN vBEM: Related Component Extension
		// Compiles to `.data-grid__header-actions`
		// Using a hyphen denotes a sibling/related variation within the element scope.
		&-actions {
			display: flex;
		}
	}
}
```

**The HTML Rule for Hierarchical Elements:**
In the DOM, the class must be applied as a single string: `className="data-grid__header__title"`. You must NEVER reflect the nesting in the CSS selectors (e.g., `.data-grid__header .data-grid__header__title` is strictly forbidden).

### 1.2 Scoped Delegation (Parent-to-Child Routing)

When a parent block needs to visually alter a child block or primitive, it must NOT use deep CSS overrides (e.g., `.parent .child { background: red; }`). This increases specificity and breaks encapsulation.

Instead, vBEM enforces **Scoped Delegation**. The parent declares the variance in its own Part 1 contract, and maps that variable into the child's exposed API inside Part 4.

```scss
.parent-card {
	// 1. VARIANCE PROPERTIES (The Contract)
	--card-button-bg: var(--color-blue);

	// ... static properties & property set ...

	// 4. ELEMENTS, DELEGATION & MODIFIERS (The Mutations & Routing)
	// We safely route the parent's contract into the child's API.
	& > .button {
		--bg-color: var(--card-button-bg);
	}
}
```

## 2. HTML/JSX Anchoring (The React Contract)

vBEM completely separates visual logic from application logic. For standard design system components, **vBEM relies on CSS compilation, not JavaScript runtime injection.**

However, vBEM distinguishes between **Finite State Variance** (pre-defined themes, sizes, flags) and **Dynamic Variance** (user-defined hex codes, X/Y mouse coordinates, progress percentages).

### The React Rule:

Finite states must map exclusively to **BEM Modifier Classes**. Inline variable injection via `style={{ '--variable': value }}` is not advised over BEM modifier classes **unless absolutely needed** for unbounded/dynamic data.

```tsx
// ❌ ANTI-PATTERN: Inline Styles for Finite States
// Do NOT use inline styles for states that are already defined in the design system.
const BadBadge = ({ isPrimary, children }) => {
	return (
		<span
			className="badge"
			style={{
				"--bg-color": isPrimary
					? "var(--color-blue-1)"
					: "var(--color-grey-1)",
			}}
		>
			{children}
		</span>
	);
};

// ✅ CORRECT: Modifier Class Mapping (Finite Variance)
// State is mapped to the standard vBEM modifier. The SCSS handles the rest.
const GoodBadge = ({ isPrimary, children }) => {
	const modifier = isPrimary ? "badge--primary" : "";
	return <span className={`badge ${modifier}`.trim()}>{children}</span>;
};

// ✅ CORRECT: Inline Variables (Dynamic Variance)
// This is the approved escape hatch for unbounded, dynamic data.
// It safely interfaces with the SCSS contract without polluting the DOM with utility classes.
const DynamicProgressBar = ({ percentage }) => {
	return (
		<div
			className="progress-bar"
			style={{ "--progress-width": `${percentage}%` }}
		>
			<div className="progress-bar__fill" />
		</div>
	);
};
```

## 3. Scope Isolation Rules (The Cascade Boundary)

In standard CSS, child elements are vulnerable to inheriting unwanted properties from their parents. In vBEM, **the block is the absolute Source of Truth (SOT) for its portion of the DOM.**

By simply declaring a variable at the root of a vBEM block, you automatically shadow any identically named variables from the parent cascade. This local declaration _is_ your isolation barrier. You do not need to fight the cascade; you simply overwrite the contract.

```scss
.parent {
	--text-color: var(--color-red);
	color: var(--text-color); // Defaults to red
}

.child {
	// IMPORTANT: This declaration shadows the parent's variable.
	// The .child block is now the new SOT for this subtree.
	--text-color: var(--color-blue);
	color: var(--text-color); // Defaults to blue!
}
```

### The Proper Use of `unset`

Do not use `unset` as boilerplate to clear variables before defining them. Local variable declarations naturally shadow inherited ones.

The `unset` keyword is only required when **no default value is relevant**, but you must guarantee the cascade is broken. For example, if a component is dropped into a messy legacy application and you need to explicitly strip an inherited property without providing a replacement.

```scss
// ❌ ANTI-PATTERN: Redundant Unsetting
.dropdown {
	--pad-x: unset; // Unnecessary: We are defining a default immediately after.
	--pad-x: 16px;
}

// ✅ CORRECT: Explicit Unsetting
.reset-wrapper {
	// We don't have a default width, but we MUST ensure it doesn't
	// inherit a constrained width from a parent layout grid.
	--container-width: unset;
	width: var(--container-width);
}
```

## 4. Definition of Done (Code Review & AI Audit Checklist)

Before a vBEM component is merged into the primary branch, it must pass the following validation checklist. LLM agents generating code within this repository are required to self-audit against these constraints before yielding an output.

- [ ] **No DOM Pollution:** The HTML/JSX markup contains zero utility classes (e.g., `flex`, `pt-4`). Only BEM classes are permitted.
- [ ] **Schema Compliance:** The SCSS block perfectly adheres to the 4-part anatomical schema.
- [ ] **Variable-Only Mutation:** All interaction states (`&:hover`, `&:focus`) and modifiers (`&--variant`) contain ONLY CSS variable reassignments. They do not contain raw CSS properties.
- [ ] **No Specificity Hacks:** The `!important` flag is absent from the component block.
- [ ] **Explicit Transitions:** Any CSS property tied to a variable that changes during interaction states possesses an explicit `transition` declaration (e.g., `transition: background-color 0.2s`).
- [ ] **JS Runtime Purity:** The React/JS component does not manipulate CSS variables directly, **unless** passing an unbounded dynamic value (e.g., a calculated coordinate or percentage) to a pre-defined vBEM contract.
