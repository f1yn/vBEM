# Variance: Modifiers, Cascades & State

In vBEM, you change a component's appearance purely by reassigning CSS variables. This document shows you how to handle hover states, global layout changes, and dynamic JS data without writing messy CSS overrides or passing React props down 5 levels.

## 1. Adapting to the Parent Layout (BEM Mixing)

When a standalone component needs to look different because of where it is placed (e.g., a generic button placed inside a dark header), **do not** write deep CSS overrides like `.header .button { ... }` or pass React props like `<Button variant="header" />`.

Instead, use **BEM Mixing**. Apply both the base component class and a contextual mixin class to the same HTML element.

**The HTML:**

```html
<header class="header">
	<!-- The element is a button, but it receives contextual variables from the header -->
	<button class="button header__button">Log In</button>
</header>
```

**The vBEM Blocks:**

```scss
// global
:root {
	--color-blue: #3b82f6;
	--color-white: #ffffff;
}

// 1. The Base Component
.button {
	--bg-color: var(--color-blue);
	--text-color: var(--color-white);

	background-color: var(--bg-color);
	color: var(--text-color);
}

// 2. The Contextual Parent
.header {
	background-color: #000000;

	// BEM Mixing: Mutates the button's contract securely.
	// This keeps our CSS perfectly flat without specificity wars.
	&__button {
		--bg-color: transparent;
		--text-color: var(--color-white);
	}
}
```

## 2. Parent-Driven State (Updating Multiple Elements)

Instead of passing an `isError` boolean to a Label, an Input, and a Message component separately, you should apply a single state modifier to their parent wrapper. By changing the parent's variable contract, all internal elements update automatically.

```scss
// global
:root {
	--color-border-base: #cbd5e1;
	--color-danger: #ef4444;
}

// components
.form-group {
	// 1. VARIANCE PROPERTIES (The Contract)
	--accent-color: #64748b;
	--border-color: var(--color-border-base);
	--message-display: none;

	// 4. ELEMENTS, DELEGATION & MODIFIERS
	&__label {
		color: var(--accent-color);
	}
	&__input {
		border-color: var(--border-color);
	}
	&__message {
		display: var(--message-display);
		color: var(--accent-color);
	}

	// 💥 Parent-Driven Update:
	// This single parent modifier makes the label red, the border red, and shows the message.
	&--error {
		--accent-color: var(--color-danger);
		--border-color: var(--color-danger);
		--message-display: block;
	}
}
```

## 3. Hierarchical Elements (Passing State to Children)

When a parent element is hovered or active, do not write chained CSS targeting the child element (e.g., `.sidebar__item:hover .sidebar__item__link { ... }`).

Instead, use **Hierarchical Elements**. The parent updates a local variable when hovered, and the child pseudo-element simply consumes that variable.

```scss
// global
:root {
	--color-primary: #e2e8f0;
	--color-interactive: #3b82f6;
	--color-text-base: #334155;
}

// components
.sidebar__item {
	// 1. VARIANCE PROPERTIES (The Contract)
	--item-accent: var(--color-primary);
	--item-color: var(--color-text-base);
	--accent-width: 3px;

	// 4. ELEMENTS & MODIFIERS
	&:hover {
		--item-accent: var(--color-interactive);
		--accent-width: 5px;
	}

	// 💥 The Variable Route
	// The child naturally inherits the mutated variables without deep CSS targeting.
	&__link {
		color: var(--item-color);

		&::after {
			width: var(--accent-width);
			background-color: var(--item-accent);
		}
	}
}
```

## 4. Dynamic JS Data (The "Root Prop")

Modern applications often deal with dynamic API data (e.g., user-defined brand hex codes, scroll positions, or dynamic heights).

Do not use React/Vue inline styles for raw CSS properties. Instead, pass dynamic data as **Root Props** (inline CSS variables) on the component's root HTML element. The vBEM SCSS will intercept it and route it safely.

**The HTML / JSX:**

```tsx
// Pass the API data exclusively into the defined Root Prop
<div class="profile-card" style={{ "--user-brand-color": user.themeHex }}>
	<button class="button">Follow</button>
</div>
```

**The vBEM Block:**

```scss
// global
:root {
	--color-blue-fallback: #3b82f6;
}

// components
.profile-card {
	// Intercept the inline Root Prop. Always provide a system token fallback.
	--brand-color: var(--user-brand-color, var(--color-blue-fallback));

	& > .button {
		// Map the JS data directly into the nested button's API
		--bg-color: var(--brand-color);
	}
}
```

## 5. Global App State & Mathematical Layouts

Passing a boolean prop (like `isMobileMenuOpen`) down through 5 levels of the DOM to hide a layout column is an anti-pattern. Instead, add a **Root Flag** (a class on the `<html>` or `<body>` tag) and let the vBEM component intercept it locally.

When you need to collapse layout space, do not use `display: none`. Use a **Mathematical Toggle** (a variable acting as a `1` or `0` multiplier) to securely collapse physical space.

```scss
// global
:root {
	--sidebar-size: 280px;
}

// components
.layout {
	// 1. VARIANCE PROPERTIES (The Contract)
	--sidebar-scale: 1;

	// 3. PROPERTY SET (The Execution)
	// Multiply the size by the scale. If scale is 1, it's 280px. If 0, it's 0px.
	--sidebar-real-size: calc(var(--sidebar-scale) * var(--sidebar-size));
	grid-template-columns: var(--sidebar-real-size) 1fr;

	// 4. ELEMENTS & MODIFIERS
	// Watch the global app state and safely collapse the layout math.
	:root.mobile-hidden & {
		--sidebar-scale: 0;
	}

	@include breakpointBefore("tablet") {
		--sidebar-scale: 0; // Automatically collapses on mobile devices
	}
}
```

## 6. Overlapping States (Order of Precedence)

What happens when a button has a primary color, but it is currently hovered, and also disabled?

Because vBEM maintains flat CSS specificity (`0,1,0` for pseudo-classes, `0,2,0` for modifiers), the state that wins is determined entirely by **top-to-bottom ordering in Part 4**.

Always define your states in the following order:
**Base Modifiers $\rightarrow$ Interaction States $\rightarrow$ Override States.**

```scss
// global
:root {
	--color-blue: #3b82f6;
	--color-blue-hover: #2563eb;
	--color-grey-light: #f1f5f9;
}

// components
.button {
	// 1. VARIANCE PROPERTIES
	--bg-color: var(--color-blue);
	--cursor-state: pointer;

	// 4. ELEMENTS, DELEGATION & MODIFIERS

	// A. Base Variants
	&--primary {
		--bg-color: var(--color-blue);
	}

	// B. Interaction States
	// Put after base variants so hover works on both default and primary buttons.
	&:hover {
		--bg-color: var(--color-blue-hover);
	}

	// C. Override States
	// Put at the absolute bottom. If a button is loading, hover states are ignored.
	&--is-loading {
		--bg-color: var(--color-grey-light);
		--cursor-state: wait;
	}
}
```
