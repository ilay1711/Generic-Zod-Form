import * as z from 'zod'
import { globalRegistry as zodV4GlobalRegistry } from 'zod/v4'
import type { FieldConfig, FieldMeta, FieldType, SelectOption } from '../types'

// ---------------------------------------------------------------------------
// Label derivation
// ---------------------------------------------------------------------------

function deriveLabel(name: string): string {
  // Use only the last segment of a dot-notated path
  const segment = name.split('.').pop() ?? name
  if (!segment) return ''

  return segment
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
    .replace(/[_-]+/g, ' ') // replace underscores/hyphens with spaces
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// ---------------------------------------------------------------------------
// Schema kind detection — works for both 'zod' (v3 compat) and 'zod/v4'
//
// 'zod' (v3):  _def.typeName = "ZodString", "ZodNumber", …
// 'zod/v4':    _def.type     = "string",    "number",    …
// ---------------------------------------------------------------------------

function getKind(def: Record<string, unknown>): string {
  if (typeof def['typeName'] === 'string') return def['typeName'] // v3
  if (typeof def['type'] === 'string') return def['type'] // v4
  return 'unknown'
}

// ---------------------------------------------------------------------------
// Meta extraction
// 'zod' (v3 compat): _def.metadata  (set via internal API, .meta() doesn't exist)
// 'zod/v4':          globalRegistry  (set via .meta())
// ---------------------------------------------------------------------------

function extractMeta(schema: z.ZodTypeAny): FieldMeta {
  const def = schema._def as Record<string, unknown>
  const defMeta = (def['metadata'] as FieldMeta | undefined) ?? {}
  const registryMeta =
    (zodV4GlobalRegistry.get(schema as never) as FieldMeta | undefined) ?? {}
  return { ...defMeta, ...registryMeta }
}

// ---------------------------------------------------------------------------
// Unwrap transparent wrappers (optional / nullable / default / effects)
// ---------------------------------------------------------------------------

type UnwrapResult = {
  schema: z.ZodTypeAny
  required: boolean
  meta: FieldMeta
}

const WRAPPER_KINDS = new Set([
  'ZodOptional',
  'ZodNullable',
  'ZodDefault',
  'ZodEffects',
  'optional',
  'nullable',
  'default',
])

function unwrap(schema: z.ZodTypeAny): UnwrapResult {
  let inner = schema
  let required = true
  let meta: FieldMeta = extractMeta(inner)

  let wrapDef = inner._def as Record<string, unknown>
  let wrapKind = getKind(wrapDef)

  while (WRAPPER_KINDS.has(wrapKind)) {
    if (
      wrapKind === 'ZodOptional' ||
      wrapKind === 'ZodNullable' ||
      wrapKind === 'optional' ||
      wrapKind === 'nullable'
    ) {
      required = false
    }

    inner =
      wrapKind === 'ZodEffects'
        ? (wrapDef['schema'] as z.ZodTypeAny)
        : (wrapDef['innerType'] as z.ZodTypeAny)

    meta = { ...extractMeta(inner), ...meta } // outer meta takes precedence
    wrapDef = inner._def as Record<string, unknown>
    wrapKind = getKind(wrapDef)
  }

  return { schema: inner, required, meta }
}

// ---------------------------------------------------------------------------
// Main introspection function
// ---------------------------------------------------------------------------

export function introspectSchema(
  schema: z.ZodTypeAny,
  name: string = '',
  parentPath: string = '',
): FieldConfig {
  const path = parentPath && name ? `${parentPath}.${name}` : name || parentPath

  const { schema: inner, required, meta } = unwrap(schema)
  const mergedMeta: FieldMeta = { ...meta }
  const def = inner._def as Record<string, unknown>
  const kind = getKind(def)

  const label =
    typeof mergedMeta.label === 'string' ? mergedMeta.label : deriveLabel(name)

  let type: FieldType = 'unknown'
  let options: SelectOption[] | undefined
  let children: FieldConfig[] | undefined
  let itemConfig: FieldConfig | undefined
  let unionVariants: FieldConfig[] | undefined
  let discriminatorKey: string | undefined

  // Never throw — unknown types gracefully return 'unknown'
  try {
    if (kind === 'ZodString' || kind === 'string') {
      type = 'string'
      const checks = (def['checks'] as Array<Record<string, unknown>>) ?? []
      // v3: check.kind === 'email' | 'url' | 'uuid'
      // v4: check.check === 'string_format' && check.format === 'email' | 'url' | 'uuid'
      const hasFormat = (fmt: string) =>
        checks.some((c) => c['kind'] === fmt || c['format'] === fmt)
      if (hasFormat('email')) {
        mergedMeta['inputType'] = 'email'
      } else if (hasFormat('url')) {
        mergedMeta['inputType'] = 'url'
      } else if (hasFormat('uuid')) {
        mergedMeta['inputType'] = 'uuid'
      }
    } else if (kind === 'ZodNumber' || kind === 'number') {
      type = 'number'
      mergedMeta['inputType'] = 'number'
    } else if (kind === 'ZodBoolean' || kind === 'boolean') {
      type = 'boolean'
    } else if (kind === 'ZodDate' || kind === 'date') {
      type = 'date'
      mergedMeta['inputType'] = 'date'
    } else if (kind === 'ZodEnum') {
      // v3 ZodEnum: _def.values is a string[]
      type = 'select'
      const values = def['values'] as string[]
      options = values.map((v) => ({
        label: v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
        value: v,
      }))
    } else if (kind === 'ZodNativeEnum') {
      // v3 ZodNativeEnum: _def.values is the enum object
      type = 'select'
      const enumObj = def['values'] as Record<string, string | number>
      options = Object.entries(enumObj)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
          value,
        }))
    } else if (kind === 'enum') {
      // v4: both ZodEnum and ZodNativeEnum use type === 'enum' and _def.entries
      type = 'select'
      const entries = def['entries'] as Record<string, string | number>
      options = Object.entries(entries)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => ({
          label:
            typeof value === 'string'
              ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
              : key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
          value,
        }))
    } else if (kind === 'ZodObject' || kind === 'object') {
      type = 'object'
      // Both v3 (.shape getter) and v4 (.shape property) work via instance
      const shape = (inner as z.ZodObject<z.ZodRawShape>).shape
      children = Object.entries(shape).map(([key, fieldSchema]) =>
        introspectSchema(fieldSchema, key, path),
      )
    } else if (kind === 'ZodArray' || kind === 'array') {
      type = 'array'
      // v3: _def.type is the element schema (confusingly named)
      // v4: _def.element is the element schema
      const elementSchema = (def['element'] ?? def['type']) as z.ZodTypeAny
      itemConfig = introspectSchema(elementSchema, '', '')
    } else if (
      kind === 'ZodDiscriminatedUnion' ||
      (kind === 'union' && def['discriminator'])
    ) {
      type = 'union'
      discriminatorKey = def['discriminator'] as string
      const rawOptions = def['options']
      const variants: z.ZodTypeAny[] =
        rawOptions instanceof Map
          ? Array.from((rawOptions as Map<string, z.ZodTypeAny>).values())
          : Array.isArray(rawOptions)
            ? (rawOptions as z.ZodTypeAny[])
            : []
      unionVariants = variants.map((variant, i) =>
        introspectSchema(variant, String(i), path),
      )
    } else if (kind === 'ZodUnion' || kind === 'union') {
      type = 'union'
      const variants = def['options'] as z.ZodTypeAny[]
      unionVariants = variants.map((variant, i) =>
        introspectSchema(variant, String(i), path),
      )
    }
  } catch {
    type = 'unknown'
  }

  return {
    name: path,
    type,
    label,
    required,
    meta: mergedMeta,
    ...(options !== undefined && { options }),
    ...(children !== undefined && { children }),
    ...(itemConfig !== undefined && { itemConfig }),
    ...(unionVariants !== undefined && { unionVariants }),
    ...(discriminatorKey !== undefined && { discriminatorKey }),
  }
}

// ---------------------------------------------------------------------------
// Convenience wrapper for top-level ZodObject schemas
// ---------------------------------------------------------------------------

export function introspectObjectSchema(
  schema: z.ZodObject<z.ZodRawShape>,
): FieldConfig[] {
  return Object.entries(schema.shape).map(([key, fieldSchema]) =>
    introspectSchema(fieldSchema, key, ''),
  )
}
