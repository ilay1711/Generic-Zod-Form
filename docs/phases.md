# UniForm Library — Phases

## Phase 1 — Foundation

- [ ] Set up monorepo (library + docs/playground app)
- [ ] Configure TypeScript, ESLint, bundler (tsup or rollup)
- [ ] Define core types (`FieldConfig`, `FieldProps`, `ComponentRegistry`, `AutoFormProps`)
- [ ] Write the schema introspection layer (Zod `_def` walker)
  - [ ] Scalars: `string`, `number`, `boolean`, `date`
  - [ ] `ZodEnum` and `ZodNativeEnum` → select
  - [ ] `ZodObject` → nested object
  - [ ] `ZodArray` → repeatable section
  - [ ] `ZodOptional`, `ZodNullable`, `ZodDefault` unwrapping
  - [ ] `ZodUnion` and `ZodDiscriminatedUnion`
  - [ ] `.meta()` extraction
- [ ] Unit test the introspection layer thoroughly

## Phase 2 — Rendering Engine

- [ ] Build the `FieldRenderer` switch component
- [ ] Implement `ScalarField` with RHF `Controller`
- [ ] Implement `ObjectField` (recursive, namespaced names)
- [ ] Implement `ArrayField` with `useFieldArray` (add/remove rows)
- [ ] Wire up `zodResolver` for validation
- [ ] Build the component registry + lookup chain (meta → field override → form registry → global → default)
- [ ] Build bare-minimum default field components (unstyled HTML inputs)

## Phase 3 — Layout & Styling Hooks

- [ ] Implement `fieldWrapper` render prop
- [ ] Implement `layout` slot props (`formWrapper`, `sectionWrapper`, `submitButton`)
- [ ] Implement `classNames` prop
- [ ] Implement section grouping from `.meta({ section })`
- [ ] Implement field ordering from `.meta({ order })`
- [ ] Implement `hidden` fields and conditional fields (`condition` function + `useWatch`)

## Phase 4 — Customization & DX

- [ ] Build `createAutoForm()` factory for global config
- [ ] Implement per-field overrides via `fields` prop
- [ ] Ensure `onSubmit` is fully typed to the schema's inferred type
- [ ] Add coercion handling (string → number, string → date, etc.)
- [ ] Add support for custom validation messages from Zod

## Phase 5 — Polish & Release

- [ ] Write integration tests (render → fill → submit flow)
- [ ] Build a playground app with real examples
- [ ] Write documentation (API reference + recipes)
- [ ] Set up CI/CD and npm publishing
- [ ] Write a README with quick-start guide

## Phase 6 — Advanced Form Control

- [ ] Programmatic control via ref (`useImperativeHandle`)
  - [ ] Expose `reset()`, `submit()`, `setValues()`, `getValues()`, `setErrors()`, `clearErrors()`, `focus(fieldName)`
  - [ ] Forward ref from `AutoForm` using `React.forwardRef`
  - [ ] Define `AutoFormHandle` type for the public ref API
  - [ ] Support both `AutoForm` and `createAutoForm` factory
- [ ] Form state persistence
  - [ ] `persistKey` prop — auto-save form values to `localStorage` on change
  - [ ] Restore saved values on mount (merge with `defaultValues`)
  - [ ] `persistDebounce` prop — debounce interval for writes (default 300ms)
  - [ ] `persistStorage` prop — pluggable storage adapter (defaults to `localStorage`)
  - [ ] Clear persisted data on successful submit
- [ ] Array field enhancements
  - [ ] Reorder rows via `move(from, to)` — expose up/down buttons in default UI
  - [ ] Duplicate row via `insert(index, value)`
  - [ ] `minItems` / `maxItems` constraints from Zod `.min()` / `.max()` on arrays
  - [ ] Disable "Add" when at `maxItems`, disable "Remove" when at `minItems`
  - [ ] Collapsible array rows with summary text
  - [ ] Opt-in array features via meta flags (`movable`, `duplicable`, `collapsible`)
  - [ ] Array button `classNames` (`arrayAdd`, `arrayRemove`, `arrayMove`, `arrayDuplicate`, `arrayCollapse`)
  - [ ] Custom array row layout via `layout.arrayRowLayout` — full control over button placement within each row
- [ ] Field dependencies
  - [ ] `meta.depend` — reactive per-field override of `options`, `hidden`, `disabled`, `label`, `placeholder`, `description`
  - [ ] `FieldDependencyResult` type exported publicly
  - [ ] `useFieldDependencies` hook exported publicly
  - [ ] `onValuesChange` prop — fires on every value change for imperative value cascade
  - [ ] Country → state cascade pattern documented in README
