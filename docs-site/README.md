# vBEM Documentation Site

The official documentation site for the vBEM (Variance-Based Block Element Modifier) styling protocol.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
docs-site/
├── src/
│   ├── components/       # Astro components (Header, Sidebar, DocContent, etc.)
│   ├── layouts/        # Page layouts
│   ├── pages/          # Astro pages (routes)
│   ├── styles/         # SCSS styles (root.scss, variables, etc.)
│   └── common.ts       # Shared utilities
├── public/             # Static assets
└── dist/               # Production build (generated)
```

## vBEM Patterns Demonstrated

This documentation site is itself a production example of vBEM architecture. Below are the key patterns demonstrated across the codebase, with links to their implementations:

### 1. The 4-Part Schema

Every vBEM block follows this strict top-to-bottom order:

1. **Variance Properties** - All mutable variables declared first
2. **Static Properties** - Layout/structural CSS that never changes
3. **Property Set** - Mapping variables to actual CSS properties
4. **Elements, Delegation & Modifiers** - Hierarchy, routing, and state mutations

**Examples:**

- [`Header.astro`](./src/components/Header.astro) - Header component with sidebar toggle logic
- [`Sidebar.astro`](./src/components/Sidebar.astro) - Navigation with active state highlighting
- [`Logo.astro`](./src/components/Logo.astro) - Logo component with size variants

### 2. Variable-Only Mutation

Modifiers and states only reassign variables—never raw CSS properties.

**Examples:**

- [`_button.scss`](./src/styles/_button.scss) - Button component with `--primary` and `--secondary` variants
- [`_variables.scss`](./src/styles/_variables.scss) - Color and spacing variables with dark mode support

### 3. Scoped Delegation

Parent components control child components through variable mapping.

**Examples:**

- [`Layout.astro`](./src/layouts/Layout.astro) - Root layout that controls sidebar visibility via `--sidebar-scale`
- [`Header.astro`](./src/components/Header.astro) - Header delegates to `Sidebar` component

### 4. Hierarchical Elements

Semantic element naming with flat specificity (`0,1,0`).

**Examples:**

- [`Header.astro`](./src/components/Header.astro) - `.header__sidebar-toggle`, `.header__title`, `.header__link`
- [`Sidebar.astro`](./src/components/Sidebar.astro) - `.sidebar__content`, `.sidebar__list`, `.sidebar__item__link`

### 5. Root Prop Pattern

Dynamic data passed via inline CSS variables.

**Examples:**

- [`Layout.astro`](./src/layouts/Layout.astro) - Uses `:root` class flags for layout state
- [`Header.astro`](./src/components/Header.astro) - Mobile sidebar toggle via `mobile-show-sidebar` class

### 6. Root Layout Modifiers

Using `:root` class flags to control global layout state.

**Examples:**

- [`Layout.astro`](./src/layouts/Layout.astro) - `home-page`, `doc-page`, `intro-page` flags
- [`Header.astro`](./src/components/Header.astro) - `mobile-show-sidebar` flag for mobile menu

## Adding Documentation

### Adding a New Page

1. Create a `.md` file in the `../docs/` directory
2. The page will automatically appear in the sidebar

### Modifying Components

When modifying components:

1. Update the **Variance Properties** section first (top of block)
2. Ensure modifiers only reassign variables
3. Add explicit `transition` declarations for animated properties
4. Follow the 4-part schema order

## Configuration

- **Astro Config**: [`astro.config.mjs`](./astro.config.mjs)
- **TypeScript Config**: [`tsconfig.json`](./tsconfig.json)
- **SCSS Preload**: [`src/styles/preload.scss`](./src/styles/preload.scss) (automatically imported in all SCSS)

## Deployment

The site is deployed via Cloudflare Pages:

```bash
npm run deploy
```

## License

MIT License - see [LICENSE.md](../LICENSE.md) for details.

## Related Links

- [Main vBEM Repository](https://github.com/f1yn/vBEM)
- [vBEM Main README](../readme.md)
- [vBEM Documentation](../docs/)
