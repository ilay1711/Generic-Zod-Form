import type { FieldWrapperProps } from '../../types'

export function DefaultFieldWrapper({
  children,
  field,
  error,
}: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={field.name}>
        {field.label}
        {field.required && ' *'}
      </label>
      {children}
      {field.meta.description && <p>{String(field.meta.description)}</p>}
      {error && <span role='alert'>{error}</span>}
    </div>
  )
}
