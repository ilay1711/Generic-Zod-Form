import type { ComponentRegistry, FieldConfig, FieldProps } from '../types'
import { defaultRegistry } from '../registry/defaultRegistry'

export function resolveComponent(
  field: FieldConfig,
  registry: ComponentRegistry,
): React.ComponentType<FieldProps> | null {
  // 1. meta.component key in the merged registry
  if (field.meta.component && registry[field.meta.component]) {
    return registry[field.meta.component]!
  }
  // 2. field.type key in the merged registry
  if (registry[field.type]) {
    return registry[field.type]!
  }
  // 3. field.type key in the default registry
  if (defaultRegistry[field.type]) {
    return defaultRegistry[field.type]!
  }
  // 4. Unknown — render nothing
  console.warn(
    `[UniForm] No component found for field type "${field.type}"${field.meta.component ? ` with meta.component "${String(field.meta.component)}"` : ''}. Rendering null.`,
  )
  return null
}
