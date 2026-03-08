import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { FieldConfig } from '../types'

export function useConditionalFields(
  fields: FieldConfig[],
  control: Control,
): FieldConfig[] {
  const values = useWatch({ control }) as Record<string, unknown>

  return useMemo(() => {
    return fields
      .filter((field) => {
        if (field.meta.hidden === true) return false
        if (typeof field.meta.condition === 'function') {
          return field.meta.condition(values)
        }
        return true
      })
      .sort((a, b) => {
        const orderA =
          typeof a.meta.order === 'number' ? a.meta.order : Infinity
        const orderB =
          typeof b.meta.order === 'number' ? b.meta.order : Infinity
        return orderA - orderB
      })
  }, [fields, values])
}
