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

The core library. Phase 4 adds the `createAutoForm()` factory, improved coercion, custom validation messages, and deep field overrides on top of Phase 3's layout/styling hooks, Phase 2's rendering engine, and Phase 1's introspection layer:

**Type definitions**

- `FieldConfig`, `FieldMeta`, `FieldProps`, `ComponentRegistry`, `AutoFormProps`, and more
- `FieldWrapperProps` (includes `span` for grid layout hints)
- `LayoutSlots`, `FormClassNames` — layout and styling configuration types
- `AutoFormConfig` — factory configuration type
- `CoercionMap`, `ValidationMessages` — coercion and error message customization types

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
- `ScalarField` — handles `string`, `number`, and `date` with automatic coercion via pluggable `CoercionMap`
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

**Customization & DX (Phase 4)**

- `createAutoForm(config)` — factory function to create a pre-configured `AutoForm` with baked-in defaults (components, layout, classNames, etc.); instance props merge/override factory config
- `fields` prop with dot-notated paths — per-field overrides that work at any depth, including nested objects and array items (e.g. `'address.street'`)
- `coercions` prop — pluggable per-type coercion map; defaults handle empty strings cleanly (`''` → `undefined` for numbers/dates instead of `NaN`/invalid Date)
- `messages` prop — custom validation messages with three levels of specificity: global `required` override, per-field catch-all string, and per-field per-error-code messages (e.g. `{ email: { invalid_format: 'Bad email' } }`)
- Zod's own custom messages (from `.min()`, `.max()`, `.email()`, etc.) still show when no `messages` override exists

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
- `AutoFormContext` / `useAutoFormContext` — exposes registry, disabled state, class names, layout slots, coercions, and messages to all descendant components

### `apps/playground`

Vite + React app for manual testing. Includes seven example forms:

- **classNames + span** — CSS Grid layout using `classNames` for styling and `meta.span` for column sizing
- **Section grouping** — flat schema with fields grouped into named sections via `meta.section` and ordered with `meta.order`
- **Custom layout slots** — custom `formWrapper`, `sectionWrapper`, and `submitButton` via the `layout` prop
- **Custom fieldWrapper** — card-style field wrapper with error highlighting, replacing the default wrapper entirely
- **createAutoForm factory** — pre-configured `AutoForm` with baked-in components, layout, and class names; instance props override when needed
- **Custom validation messages** — global `required` override, per-field catch-all, and per-field per-error-code messages
- **Deep field overrides** — nested object schema with dot-notated per-field overrides (e.g. `'address.city'`)

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
