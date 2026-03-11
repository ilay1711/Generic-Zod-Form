# UniForm: Dynamic Handler Registration & the Subscribe Problem

## The Problem

`UniForm.onChange` is additive — every call appends a new handler to the internal array for that field. This is intentional and documented, supporting multiple handlers per field in registration order.

However, if a user calls `onChange` inside a React component during render, a new handler is pushed on **every render**:

```ts
// BAD — called during render
function MyForm() {
  form.onChange('fieldA', (val, ctx) => setState(...)) // adds a handler on every render
  return <AutoForm form={form} />
}
```

After `n` renders, `fieldA` has `n` stacked handlers. Each one calls `setState`, which triggers another render, which adds another handler — a feedback loop / memory leak.

## Proposed Solution: `subscribe` method

Keep `onChange` as the static, build-time, fluent API (returns `this`). Add a separate `subscribe` method that returns an unsubscribe function, designed for dynamic/React use inside `useEffect`.

```ts
// Static — module level, fluent chaining, no cleanup needed
const form = createForm(schema)
  .onChange('fieldA', handler1)
  .onChange('fieldB', handler2)

// Dynamic — inside a component, safe via useEffect cleanup
function MyForm() {
  useEffect(() => {
    return form.subscribe('fieldA', (val, ctx) => setState(...))
  }, [])

  return <AutoForm form={form} />
}
```

### Implementation sketch

In `UniForm`:

```ts
subscribe<K extends DeepKeys<z.infer<TSchema>>>(
  field: K,
  handler: Handler<TSchema, DeepFieldValue<z.infer<TSchema>, K>>,
): () => void {
  const list = this._handlers.get(field) ?? []
  const h = handler as Handler<TSchema, unknown>
  this._handlers.set(field, [...list, h])
  return () => {
    const current = this._handlers.get(field) ?? []
    this._handlers.set(field, current.filter(fn => fn !== h))
  }
}
```

`onChange` remains unchanged (returns `this`). `subscribe` shares the same `_handlers` map but returns a cleanup function that filters out the specific handler reference.

---

## Future Implementation Prompt

> In `packages/core/src/UniForm.ts`, add a `subscribe` method to the `UniForm` class.
>
> **Behavior:**
>
> - Same signature as `onChange` but returns `() => void` (an unsubscribe function) instead of `this`.
> - Appends the handler to `_handlers` (same map `onChange` uses).
> - The returned unsubscribe function removes that specific handler instance from the array.
> - `onChange` is unchanged — still returns `this` for chaining.
>
> **Type signature:**
>
> ```ts
> subscribe<K extends DeepKeys<z.infer<TSchema>>>(
>   field: K,
>   handler: Handler<TSchema, DeepFieldValue<z.infer<TSchema>, K>>,
> ): () => void
> ```
>
> **Also:**
>
> - Export `subscribe` as part of the public API (update any barrel exports if needed).
> - Add a JSDoc comment explaining that this is the React-safe alternative to `onChange` — use it inside `useEffect` so the handler is cleaned up on unmount.
> - Add a test covering: subscribe → handler fires → unsubscribe → handler no longer fires.
