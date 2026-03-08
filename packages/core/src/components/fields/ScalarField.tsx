import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { FieldConfig } from '../../types'
import { useAutoFormContext } from '../../context/AutoFormContext'
import { resolveComponent } from '../resolveComponent'

type ScalarFieldProps = {
  field: FieldConfig
  control: Control
  effectiveName: string
}

function coerce(type: string, value: unknown): unknown {
  if (type === 'number') {
    return parseFloat(String(value))
  }
  if (type === 'date') {
    const d = new Date(String(value))
    return isNaN(d.getTime()) ? value : d
  }
  return value
}

export function ScalarField({
  field,
  control,
  effectiveName,
}: ScalarFieldProps) {
  const { registry, disabled: contextDisabled } = useAutoFormContext()
  const Component = resolveComponent(field, registry)

  if (!Component) return null

  return (
    <Controller
      name={effectiveName}
      control={control}
      render={({ field: rhfField, fieldState }) => (
        <Component
          name={effectiveName}
          value={(rhfField.value as unknown) ?? ''}
          onChange={(value) => rhfField.onChange(coerce(field.type, value))}
          onBlur={rhfField.onBlur}
          label={field.label}
          placeholder={field.meta.placeholder}
          description={field.meta.description}
          error={fieldState.error?.message}
          required={field.required}
          disabled={field.meta.disabled === true || contextDisabled}
          meta={field.meta}
        />
      )}
    />
  )
}
