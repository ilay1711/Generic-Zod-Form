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

The core library. Phase 2 ships the full rendering engine on top of Phase 1's introspection layer:

**Type definitions**

- `FieldConfig`, `FieldMeta`, `FieldProps`, `ComponentRegistry`, `AutoFormProps`, and more

**Schema introspection**

- Walks a Zod schema and produces a normalized `FieldConfig` tree
- Handles `ZodString`, `ZodNumber`, `ZodBoolean`, `ZodDate`, `ZodEnum`, `ZodNativeEnum`, `ZodObject`, `ZodArray`, `ZodUnion`, `ZodDiscriminatedUnion`
- Transparently unwraps `ZodOptional`, `ZodNullable`, `ZodDefault`, `ZodEffects`
- Extracts `.meta()` metadata (Zod V4)
- Derives human-readable labels from camelCase / snake_case field names
- Never throws — unsupported types fall back to `type: 'unknown'`

**Rendering engine**

- `<AutoForm>` — top-level component; introspects the schema, sets up `react-hook-form` with `zodResolver`, and renders the form
- `FieldRenderer` — recursive switch that dispatches to the correct field component; implements the 4-tier component lookup chain (`meta.component` → field type in custom registry → field type in default registry → `null` + warning)
- `ScalarField` — handles `string`, `number`, and `date` with automatic coercion (strings → `parseFloat` / `new Date`)
- `BooleanField` — checkbox via RHF `Controller`
- `SelectField` — native select for `z.enum` / `z.nativeEnum` fields
- `ObjectField` — renders nested objects as a `<fieldset>` with recursively rendered children
- `ArrayField` — uses RHF `useFieldArray` with add / remove row controls

**Default components** (unstyled, accessible)

- `DefaultInput`, `DefaultCheckbox`, `DefaultSelect`, `DefaultFieldWrapper`, `DefaultSubmitButton`
- All include correct `id` / `htmlFor` associations, `aria-required`, `aria-disabled`, and `role="alert"` on error messages

**Registry & customization**

- `defaultRegistry` — built-in mapping of field types to default components
- `mergeRegistries` — merge a custom registry over the default; override globally or per-field via `meta.component`

**Hooks & context**

- `useConditionalFields` — filters by `meta.hidden` and `meta.condition`, sorts by `meta.order`
- `AutoFormContext` / `useAutoFormContext` — exposes registry, disabled state, and layout slots to all descendant components

### `apps/playground`

Vite + React app for manual testing. Includes three example forms:

- **Flat schema** — scalar fields, enum select, and checkbox
- **Nested schema** — dot-notated object fields rendered inside `<fieldset>` elements
- **Array schema** — dynamic rows with add / remove controls

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
- **Zod V4** (`^3.25`) — peer dependency
