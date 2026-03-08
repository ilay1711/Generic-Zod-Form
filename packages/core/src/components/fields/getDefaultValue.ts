import type { FieldConfig } from '../../types'

export function getDefaultValue(field: FieldConfig): unknown {
  switch (field.type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
      return new Date()
    case 'select':
      return field.options?.[0]?.value ?? ''
    case 'object': {
      const result: Record<string, unknown> = {}
      for (const child of field.children ?? []) {
        // Use only the last segment of the child's name for the key
        const key = child.name.split('.').pop() ?? child.name
        result[key] = getDefaultValue(child)
      }
      return result
    }
    case 'array':
      return []
    default:
      return undefined
  }
}
