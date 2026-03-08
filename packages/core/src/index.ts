// Types
export type {
  FieldType,
  SelectOption,
  FieldCondition,
  FieldMeta,
  FieldConfig,
  FieldProps,
  ComponentRegistry,
  FieldWrapperProps,
  LayoutSlots,
  FormClassNames,
  AutoFormProps,
} from './types'

// Introspection
export {
  introspectSchema,
  introspectObjectSchema,
} from './introspection/introspect'

// Components
export { AutoForm } from './components/AutoForm'
export { FieldRenderer } from './components/FieldRenderer'

// Default components
export { DefaultInput } from './components/defaults/DefaultInput'
export { DefaultCheckbox } from './components/defaults/DefaultCheckbox'
export { DefaultSelect } from './components/defaults/DefaultSelect'
export { DefaultFieldWrapper } from './components/defaults/DefaultFieldWrapper'
export { DefaultSubmitButton } from './components/defaults/DefaultSubmitButton'

// Registry
export { defaultRegistry } from './registry/defaultRegistry'
export { mergeRegistries } from './registry/mergeRegistries'

// Hooks
export { useConditionalFields } from './hooks/useConditionalFields'

// Context
export { useAutoFormContext } from './context/AutoFormContext'
export type { AutoFormContextValue } from './context/AutoFormContext'
