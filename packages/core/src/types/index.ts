import type * as React from 'react'
import type * as z from 'zod/v4'

// ---------------------------------------------------------------------------
// FieldType
// ---------------------------------------------------------------------------

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select' // ZodEnum / ZodNativeEnum
  | 'object' // ZodObject (nested)
  | 'array' // ZodArray
  | 'union' // ZodUnion
  | 'unknown' // fallback for unsupported types

// ---------------------------------------------------------------------------
// SelectOption
// ---------------------------------------------------------------------------

export type SelectOption = {
  label: string
  value: string | number
}

// ---------------------------------------------------------------------------
// FieldCondition
// ---------------------------------------------------------------------------

export type FieldCondition<TValues = Record<string, unknown>> = (
  values: TValues,
) => boolean

// ---------------------------------------------------------------------------
// FieldMeta
// ---------------------------------------------------------------------------

export type FieldMeta = {
  label?: string
  placeholder?: string
  description?: string
  section?: string
  order?: number
  span?: number
  hidden?: boolean
  disabled?: boolean
  condition?: FieldCondition
  component?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// FieldConfig
// ---------------------------------------------------------------------------

export type FieldConfig = {
  name: string
  type: FieldType
  label: string
  required: boolean
  meta: FieldMeta
  options?: SelectOption[]
  children?: FieldConfig[]
  itemConfig?: FieldConfig
  unionVariants?: FieldConfig[]
  discriminatorKey?: string
  minItems?: number
  maxItems?: number
}

// ---------------------------------------------------------------------------
// FieldProps
// ---------------------------------------------------------------------------

export type FieldProps = {
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
  options?: SelectOption[]
  meta: FieldMeta
}

// ---------------------------------------------------------------------------
// ComponentRegistry
// ---------------------------------------------------------------------------

export type ComponentRegistry = {
  string?: React.ComponentType<FieldProps>
  number?: React.ComponentType<FieldProps>
  boolean?: React.ComponentType<FieldProps>
  date?: React.ComponentType<FieldProps>
  select?: React.ComponentType<FieldProps>
  textarea?: React.ComponentType<FieldProps>
  [key: string]: React.ComponentType<FieldProps> | undefined
}

// ---------------------------------------------------------------------------
// FieldWrapperProps
// ---------------------------------------------------------------------------

export type FieldWrapperProps = {
  children: React.ReactNode
  field: FieldConfig
  error?: string
  span?: number
}

// ---------------------------------------------------------------------------
// LayoutSlots
// ---------------------------------------------------------------------------

export type LayoutSlots = {
  formWrapper?: React.ComponentType<{ children: React.ReactNode }>
  sectionWrapper?: React.ComponentType<{
    children: React.ReactNode
    title: string
  }>
  submitButton?: React.ComponentType<{ isSubmitting: boolean }>
}

// ---------------------------------------------------------------------------
// FormClassNames
// ---------------------------------------------------------------------------

export type FormClassNames = {
  form?: string
  fieldWrapper?: string
  label?: string
  description?: string
  error?: string
}

// ---------------------------------------------------------------------------
// CoercionMap
// ---------------------------------------------------------------------------

export type CoercionMap = Record<string, (value: unknown) => unknown>

// ---------------------------------------------------------------------------
// ValidationMessages
// ---------------------------------------------------------------------------

export type ValidationMessages = {
  required?: string
  [fieldName: string]: string | Record<string, string> | undefined
}

// ---------------------------------------------------------------------------
// PersistStorage
// ---------------------------------------------------------------------------

export type PersistStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

// ---------------------------------------------------------------------------
// AutoFormHandle
// ---------------------------------------------------------------------------

export type AutoFormHandle<TValues = Record<string, unknown>> = {
  /** Reset the form to defaultValues (or provided values) */
  reset: (values?: Partial<TValues>) => void
  /** Programmatically trigger form submission */
  submit: () => void
  /** Set one or more field values */
  setValues: (values: Partial<TValues>) => void
  /** Get the current form values */
  getValues: () => TValues
  /** Set errors on specific fields */
  setErrors: (errors: Record<string, string>) => void
  /** Clear all errors, or errors on specific fields */
  clearErrors: (fieldNames?: string[]) => void
  /** Focus a specific field by name (dot-notated for nested fields) */
  focus: (fieldName: string) => void
}

// ---------------------------------------------------------------------------
// AutoFormConfig (factory)
// ---------------------------------------------------------------------------

export type AutoFormConfig = {
  components?: ComponentRegistry
  fieldWrapper?: React.ComponentType<FieldWrapperProps>
  layout?: LayoutSlots
  classNames?: FormClassNames
  disabled?: boolean
  coercions?: CoercionMap
  messages?: ValidationMessages
}

// ---------------------------------------------------------------------------
// AutoFormProps
// ---------------------------------------------------------------------------

export type AutoFormProps<TSchema extends z.ZodObject<z.ZodRawShape>> = {
  schema: TSchema
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>
  defaultValues?: Partial<z.infer<TSchema>>
  components?: ComponentRegistry
  fields?: Record<string, Partial<FieldMeta>>
  fieldWrapper?: React.ComponentType<FieldWrapperProps>
  layout?: LayoutSlots
  classNames?: FormClassNames
  disabled?: boolean
  coercions?: CoercionMap
  messages?: ValidationMessages
  /** When set, form values are auto-saved to storage under this key */
  persistKey?: string
  /** Debounce interval in ms for persistence writes (default: 300) */
  persistDebounce?: number
  /** Custom storage adapter (default: localStorage) */
  persistStorage?: PersistStorage
}
