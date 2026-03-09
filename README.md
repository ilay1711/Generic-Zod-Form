# UniForm

A headless React library that accepts a Zod schema and automatically renders a fully customizable form. Zero default styles — bring your own components.

## Monorepo Structure

```
uniform/
├── packages/
│   └── core/          # The library (@uniform/core)
└── apps/
    └── playground/    # Vite + React dev app
```

## Packages

### `@uniform/core`

The core library. Phase 3 adds layout and styling hooks on top of Phase 2's rendering engine and Phase 1's introspection layer:

**Type definitions**

- `FieldConfig`, `FieldMeta`, `FieldProps`, `ComponentRegistry`, `AutoFormProps`, and more
- `FieldWrapperProps` (includes `span` for grid layout hints)
- `LayoutSlots`, `FormClassNames` — layout and styling configuration types

**Schema introspection**

- Walks a Zod schema and produces a normalized `FieldConfig` tree
- Handles `ZodString`, `ZodNumber`, `ZodBoolean`, `ZodDate`, `ZodEnum`, `ZodNativeEnum`, `ZodObject`, `ZodArray`, `ZodUnion`, `ZodDiscriminatedUnion`
- Transparently unwraps `ZodOptional`, `ZodNullable`, `ZodDefault`, `ZodPipe` (`.transform()`)
- Extracts `.meta()` metadata via `z.globalRegistry`
- Derives human-readable labels from camelCase / snake_case field names
- Never throws — unsupported types fall back to `type: 'unknown'`

**Rendering engine**

- `<AutoForm>` — top-level component; introspects the schema, sets up `react-hook-form` with `zodResolver` from `@hookform/resolvers/zod` (v5+), and renders the form
- `FieldRenderer` — recursive switch that dispatches to the correct field component; implements the 4-tier component lookup chain (`meta.component` → field type in custom registry → field type in default registry → `null` + warning)
- `ScalarField` — handles `string`, `number`, and `date` with automatic coercion (strings → `parseFloat` / `new Date`)
- `BooleanField` — checkbox via RHF `Controller`
- `SelectField` — native select for `z.enum` / `z.nativeEnum` fields
- `ObjectField` — renders nested objects as a `<fieldset>` with recursively rendered children
- `ArrayField` — uses RHF `useFieldArray` with add / remove row controls

**Layout & styling hooks**

- `classNames` prop — thread CSS class names through `<form>`, field wrappers, labels, descriptions, and error messages (works with Tailwind, CSS modules, etc.)
- `fieldWrapper` prop — replace the default field wrapper with a fully custom component; receives `FieldWrapperProps` including `span` for grid layout hints
- `layout.formWrapper` — wrap all form content in a custom container
- `layout.sectionWrapper` — wrap each field section group; defaults to `<fieldset>` with `<legend>`
- `layout.submitButton` — replace the default submit button
- `meta.section` — group fields into named sections that render inside the section wrapper
- `meta.span` — passed as a `--field-span` CSS custom property on the field wrapper, enabling CSS Grid layouts
- `meta.order` — control field render order (already from Phase 2, now used for section ordering too)

**Default components** (unstyled, accessible)

- `DefaultInput`, `DefaultCheckbox`, `DefaultSelect`, `DefaultFieldWrapper`, `DefaultSubmitButton`
- All include correct `id` / `htmlFor` associations, `aria-required`, `aria-disabled`, and `role="alert"` on error messages
- `DefaultFieldWrapper` consumes `classNames` from context and sets `--field-span` CSS custom property when `span` is provided

**Registry & customization**

- `defaultRegistry` — built-in mapping of field types to default components
- `mergeRegistries` — merge a custom registry over the default; override globally or per-field via `meta.component`

**Hooks & context**

- `useConditionalFields` — filters by `meta.hidden` and `meta.condition`, sorts by `meta.order`
- `useSectionGrouping` — groups fields by `meta.section` into `SectionGroup[]`; ungrouped fields come first, sections appear in field order
- `AutoFormContext` / `useAutoFormContext` — exposes registry, disabled state, class names, and layout slots to all descendant components

### `apps/playground`

Vite + React app for manual testing. Includes four example forms:

- **classNames + span** — CSS Grid layout using `classNames` for styling and `meta.span` for column sizing
- **Section grouping** — flat schema with fields grouped into named sections via `meta.section` and ordered with `meta.order`
- **Custom layout slots** — custom `formWrapper`, `sectionWrapper`, and `submitButton` via the `layout` prop
- **Custom fieldWrapper** — card-style field wrapper with error highlighting, replacing the default wrapper entirely

## Getting Started

```bash
pnpm install
pnpm build        # build @uniform/core
pnpm test         # run unit tests
pnpm dev          # start playground
```

## Tech Stack

- **pnpm workspaces** — monorepo management
- **tsup** — library bundler (ESM + CJS + `.d.ts`)
- **Vite** — playground dev server
- **Vitest** — unit tests
- **TypeScript** — strict mode throughout
- **Zod V4** (`zod@>=3.25`, imported from `zod/v4`) — peer dependency
- **`@hookform/resolvers`** (`^5.2`) — Zod v4-aware resolver
