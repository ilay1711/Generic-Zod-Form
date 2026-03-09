# UniForm

> Headless React + Zod V4 form library. Zero styles — bring your own components.

UniForm takes a Zod schema and automatically renders a fully customizable form. It handles introspection, validation, coercion, and layout — you provide the components and styling.

## Features

- **Schema-driven** — define your form once with Zod V4, get inputs, labels, validation, and types for free
- **Headless** — zero CSS, zero opinions; bring your own design system
- **Full Zod V4 support** — scalars, enums, objects, arrays, optionals, nullables, defaults, pipes/transforms, unions, discriminated unions
- **react-hook-form** under the hood — performant, uncontrolled forms with `zodResolver`
- **Component registry** — swap any field type globally or per-field via `meta.component`
- **Layout hooks** — `classNames`, `fieldWrapper`, `layout.formWrapper`, `layout.sectionWrapper`, `layout.submitButton`
- **Section grouping** — group fields into named sections via `meta.section`
- **Conditional fields** — show/hide fields based on form values with `meta.condition`
- **Field ordering** — control render order with `meta.order`
- **`createAutoForm()` factory** — bake in your design system defaults once, use everywhere
- **Deep field overrides** — dot-notated `fields` prop for nested object/array overrides
- **Pluggable coercion** — automatic string→number, string→Date with customizable coercion map
- **Custom validation messages** — global, per-field, and per-field-per-error-code message overrides
- **Tree-shakeable** — ESM + CJS builds via tsup with `sideEffects: false`

## Quick Start

### Installation

```bash
npm install @uniform/core react react-hook-form zod
```

### Basic Usage

```tsx
import * as z from 'zod/v4'
import { AutoForm } from '@uniform/core'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  age: z.number().min(0).optional(),
  role: z.enum(['user', 'admin', 'editor']),
  subscribe: z.boolean(),
})

function MyForm() {
  return (
    <AutoForm
      schema={schema}
      defaultValues={{ role: 'user', subscribe: false }}
      onSubmit={(values) => {
        // values is fully typed as z.infer<typeof schema>
        console.log(values)
      }}
    />
  )
}
```

That's it — UniForm introspects the schema, renders appropriate inputs, validates with Zod, and calls `onSubmit` with typed values.

## API Reference

### `<AutoForm>` Props

| Prop            | Type                                                  | Default               | Description                                                                 |
| --------------- | ----------------------------------------------------- | --------------------- | --------------------------------------------------------------------------- |
| `schema`        | `z.ZodObject`                                         | _required_            | The Zod V4 object schema that defines the form                              |
| `onSubmit`      | `(values: z.infer<TSchema>) => void \| Promise<void>` | _required_            | Called with fully typed, validated values on successful submit              |
| `defaultValues` | `Partial<z.infer<TSchema>>`                           | `{}`                  | Pre-fill form fields                                                        |
| `components`    | `ComponentRegistry`                                   | `defaultRegistry`     | Override field type → component mapping                                     |
| `fields`        | `Record<string, Partial<FieldMeta>>`                  | `{}`                  | Per-field metadata overrides (supports dot-notated paths for nested fields) |
| `fieldWrapper`  | `React.ComponentType<FieldWrapperProps>`              | `DefaultFieldWrapper` | Wrap each scalar field in a custom container                                |
| `layout`        | `LayoutSlots`                                         | `{}`                  | Replace form wrapper, section wrapper, or submit button                     |
| `classNames`    | `FormClassNames`                                      | `{}`                  | CSS class names for form, field wrappers, labels, errors, descriptions      |
| `disabled`      | `boolean`                                             | `false`               | Disable all form fields and the submit button                               |
| `coercions`     | `CoercionMap`                                         | `defaultCoercionMap`  | Custom per-type value coercion functions                                    |
| `messages`      | `ValidationMessages`                                  | `undefined`           | Custom validation error messages                                            |

### `createAutoForm(config)`

Factory function that returns a pre-configured `<AutoForm>` component with baked-in defaults.

```tsx
import { createAutoForm } from '@uniform/core'

const MyAutoForm = createAutoForm({
  components: { string: MyTextInput, number: MyNumberInput },
  fieldWrapper: MyFieldWrapper,
  layout: { submitButton: MySubmitButton },
  classNames: { form: 'my-form', label: 'my-label' },
  disabled: false,
  coercions: { number: (v) => (v === '' ? undefined : Number(v)) },
  messages: { required: 'This field is required' },
})

// Use it — no need to pass components/layout/classNames every time
<MyAutoForm schema={schema} onSubmit={handleSubmit} />

// Instance props merge with and override factory defaults
<MyAutoForm schema={schema} onSubmit={handleSubmit} classNames={{ form: 'override' }} />
```

**Config type:** `AutoFormConfig`

| Key            | Type                                     | Merge behavior                                |
| -------------- | ---------------------------------------- | --------------------------------------------- |
| `components`   | `ComponentRegistry`                      | Deep merge (instance overrides specific keys) |
| `fieldWrapper` | `React.ComponentType<FieldWrapperProps>` | Instance replaces factory                     |
| `layout`       | `LayoutSlots`                            | Shallow merge                                 |
| `classNames`   | `FormClassNames`                         | Shallow merge                                 |
| `disabled`     | `boolean`                                | OR logic (either `true` → disabled)           |
| `coercions`    | `CoercionMap`                            | Shallow merge                                 |
| `messages`     | `ValidationMessages`                     | Shallow merge                                 |

### Types

#### `FieldMeta`

Metadata attached to each field, extracted from Zod's `.meta()` or set via the `fields` prop:

```ts
type FieldMeta = {
  label?: string
  placeholder?: string
  description?: string
  section?: string // Group field into a named section
  order?: number // Control render order
  span?: number // Grid column hint (set as --field-span CSS var)
  hidden?: boolean // Hide the field
  disabled?: boolean // Disable the field
  condition?: (values: Record<string, unknown>) => boolean // Show/hide conditionally
  component?: string // Override the component registry key
  [key: string]: unknown // Extensible
}
```

#### `ComponentRegistry`

Map field types to React components:

```ts
type ComponentRegistry = {
  string?: React.ComponentType<FieldProps>
  number?: React.ComponentType<FieldProps>
  boolean?: React.ComponentType<FieldProps>
  date?: React.ComponentType<FieldProps>
  select?: React.ComponentType<FieldProps>
  [key: string]: React.ComponentType<FieldProps> | undefined
}
```

#### `FieldProps`

Props received by every field component:

```ts
type FieldProps = {
  name: string
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  label: string
  placeholder?: string
  description?: string
  error?: string
  required: boolean
  disabled?: boolean
  options?: SelectOption[] // For select fields
  meta: FieldMeta
}
```

#### `FieldWrapperProps`

Props received by the field wrapper component:

```ts
type FieldWrapperProps = {
  children: React.ReactNode
  field: FieldConfig
  error?: string
  span?: number
}
```

#### `LayoutSlots`

```ts
type LayoutSlots = {
  formWrapper?: React.ComponentType<{ children: React.ReactNode }>
  sectionWrapper?: React.ComponentType<{
    children: React.ReactNode
    title: string
  }>
  submitButton?: React.ComponentType<{ isSubmitting: boolean }>
}
```

#### `FormClassNames`

```ts
type FormClassNames = {
  form?: string
  fieldWrapper?: string
  label?: string
  description?: string
  error?: string
}
```

#### `CoercionMap`

```ts
type CoercionMap = Record<string, (value: unknown) => unknown>
```

Default coercions: `number` (empty→`undefined`, else `Number()`), `date` (empty→`undefined`, else `new Date()`), `boolean` (`Boolean()`), `string` (`null`→`''`).

#### `ValidationMessages`

```ts
type ValidationMessages = {
  required?: string // Global required override
  [fieldName: string]: string | Record<string, string> | undefined
  //                   ^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^
  //                   catch-all  per-error-code map
}
```

## Recipes

### Custom Components

Replace the default input for any field type:

```tsx
function MyTextInput(props: FieldProps) {
  return (
    <input
      id={props.name}
      value={String(props.value ?? '')}
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      disabled={props.disabled}
      className='my-input'
    />
  )
}

;<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  components={{ string: MyTextInput }}
/>
```

### Grid Layout with `classNames` and `span`

```tsx
<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  classNames={{
    form: 'grid grid-cols-12 gap-4',
    fieldWrapper: 'p-2',
    label: 'font-semibold block mb-1',
    error: 'text-red-500 text-sm',
  }}
  fields={{
    firstName: { span: 6 },
    lastName: { span: 6 },
    email: { span: 12 },
  }}
/>
```

The `span` value is set as `--field-span` CSS custom property on each field wrapper. Use CSS Grid to consume it:

```css
.grid > * {
  grid-column: span var(--field-span, 12);
}
```

### Section Grouping

```tsx
<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  fields={{
    firstName: { section: 'Personal', order: 1 },
    lastName: { section: 'Personal', order: 2 },
    street: { section: 'Address', order: 3 },
    city: { section: 'Address', order: 4 },
  }}
  layout={{
    sectionWrapper: ({ children, title }) => (
      <fieldset>
        <legend>{title}</legend>
        {children}
      </fieldset>
    ),
  }}
/>
```

### Conditional Fields

Show a field only when another field has a specific value:

```tsx
const schema = z.object({
  type: z.enum(['personal', 'business']),
  companyName: z.string().optional(),
})

<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  fields={{
    companyName: {
      condition: (values) => values.type === 'business',
    },
  }}
/>
```

### Custom Validation Messages

```tsx
<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  messages={{
    required: 'This field is required', // Global
    email: 'Please provide an email', // Per-field catch-all
    age: { too_small: 'Must be at least 18' }, // Per-field per-code
  }}
/>
```

Resolution order: per-field per-code → per-field string → global `required` → Zod's original message.

### Factory Pattern with `createAutoForm`

```tsx
import { createAutoForm } from '@uniform/core'

const AppAutoForm = createAutoForm({
  components: {
    string: MyTextInput,
    number: MyNumberInput,
    boolean: MyToggle,
    select: MyDropdown,
  },
  fieldWrapper: MyFieldWrapper,
  layout: { submitButton: MySubmitButton },
  classNames: { form: 'app-form', label: 'app-label' },
})

// Then use it everywhere — no prop repetition
<AppAutoForm schema={userSchema} onSubmit={saveUser} />
<AppAutoForm schema={settingsSchema} onSubmit={saveSettings} />
```

### Deep Field Overrides

Override metadata for nested fields using dot-notated paths:

```tsx
const schema = z.object({
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
  }),
})

<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  fields={{
    'address.street': { placeholder: '123 Main St' },
    'address.city': { label: 'City / Town' },
    'address.zip': { span: 6 },
  }}
/>
```

## Development

```bash
pnpm install       # Install dependencies
pnpm build         # Build @uniform/core
pnpm test          # Run all tests
pnpm dev           # Start the playground dev server
```

### Monorepo Structure

```
uniform/
├── packages/
│   └── core/          # The library (@uniform/core)
└── apps/
    └── playground/    # Vite + React dev app
```

### Tech Stack

- **pnpm workspaces** — monorepo management
- **tsup** — library bundler (ESM + CJS + `.d.ts`)
- **Vite** — playground dev server
- **Vitest** — unit and integration tests
- **TypeScript** — strict mode throughout
- **Zod V4** (`zod@>=3.25`, imported from `zod/v4`)
- **react-hook-form** — form state management
- **@hookform/resolvers** (`^5.2`) — Zod v4-aware resolver

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Run tests (`pnpm test`) and ensure they pass
4. Submit a pull request

## License

[MIT](LICENSE)
