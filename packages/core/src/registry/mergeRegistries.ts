import type { ComponentRegistry } from '../types'

export function mergeRegistries(
  base: ComponentRegistry,
  overrides?: ComponentRegistry,
): ComponentRegistry {
  if (!overrides) return base
  return { ...base, ...overrides }
}
