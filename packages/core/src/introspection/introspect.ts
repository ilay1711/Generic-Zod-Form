import * as z from 'zod'
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
// Meta extraction (Zod V4 stores .meta() in ._def.metadata)
// ---------------------------------------------------------------------------

function extractMeta(schema: z.ZodTypeAny): FieldMeta {
  const def = schema._def as Record<string, unknown>
  return (def['metadata'] as FieldMeta | undefined) ?? {}
}

// ---------------------------------------------------------------------------
// Unwrap transparent wrappers
// ---------------------------------------------------------------------------

type UnwrapResult = {
  schema: z.ZodTypeAny
  required: boolean
  meta: FieldMeta
}

type Wrapper =
  | z.ZodOptional<z.ZodTypeAny>
  | z.ZodNullable<z.ZodTypeAny>
  | z.ZodDefault<z.ZodTypeAny>
  | z.ZodEffects<z.ZodTypeAny>

function isWrapper(schema: z.ZodTypeAny): schema is Wrapper {
  return (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault ||
    schema instanceof z.ZodEffects
  )
}

function stepInner(schema: Wrapper): z.ZodTypeAny {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return schema.unwrap()
  }
  if (schema instanceof z.ZodDefault) {
    return (schema._def as { innerType: z.ZodTypeAny }).innerType
  }
  // ZodEffects
  return schema._def.schema
}

function unwrap(schema: z.ZodTypeAny): UnwrapResult {
  let inner: z.ZodTypeAny = schema
  let required = true
  let meta: FieldMeta = extractMeta(inner)

  while (isWrapper(inner)) {
    if (inner instanceof z.ZodOptional || inner instanceof z.ZodNullable) {
      required = false
    }
    inner = stepInner(inner)
    // Outer meta takes precedence; merge inner as lower-priority base
    meta = { ...extractMeta(inner), ...meta }
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
    if (inner instanceof z.ZodString) {
      type = 'string'
      const checks =
        (inner._def as { checks?: Array<{ kind: string }> }).checks ?? []
      if (checks.some((c) => c.kind === 'email')) {
        mergedMeta['inputType'] = 'email'
      } else if (checks.some((c) => c.kind === 'url')) {
        mergedMeta['inputType'] = 'url'
      } else if (checks.some((c) => c.kind === 'uuid')) {
        mergedMeta['inputType'] = 'uuid'
      }
    } else if (inner instanceof z.ZodNumber) {
      type = 'number'
      mergedMeta['inputType'] = 'number'
    } else if (inner instanceof z.ZodBoolean) {
      type = 'boolean'
    } else if (inner instanceof z.ZodDate) {
      type = 'date'
      mergedMeta['inputType'] = 'date'
    } else if (inner instanceof z.ZodEnum) {
      type = 'select'
      // .options is the canonical accessor in both Zod v3 and v4
      const values = (inner as z.ZodEnum<[string, ...string[]]>).options
      options = values.map((v) => ({
        label: v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
        value: v,
      }))
    } else if (inner instanceof z.ZodNativeEnum) {
      type = 'select'
      const enumObj = (
        inner._def as { values: Record<string, string | number> }
      ).values
      options = Object.entries(enumObj)
        // Filter out TypeScript's numeric reverse-mappings (keys that are numbers)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
          value: value,
        }))
    } else if (inner instanceof z.ZodObject) {
      type = 'object'
      const shape = (inner as z.ZodObject<z.ZodRawShape>).shape
      children = Object.entries(shape).map(([key, fieldSchema]) =>
        introspectSchema(fieldSchema, key, path),
      )
    } else if (inner instanceof z.ZodArray) {
      type = 'array'
      const elementSchema = (inner._def as { type: z.ZodTypeAny }).type
      // itemConfig describes the element structure; indexing is handled at render time
      itemConfig = introspectSchema(elementSchema, '', '')
    } else if (inner instanceof z.ZodDiscriminatedUnion) {
      type = 'union'
      discriminatorKey = (inner._def as { discriminator: string }).discriminator
      const rawOptions = (inner._def as { options: unknown }).options
      // options may be a Map (Zod 3.20+) or an array
      const variants: z.ZodTypeAny[] =
        rawOptions instanceof Map
          ? Array.from((rawOptions as Map<string, z.ZodTypeAny>).values())
          : Array.isArray(rawOptions)
            ? (rawOptions as z.ZodTypeAny[])
            : []
      unionVariants = variants.map((variant, i) =>
        introspectSchema(variant, String(i), path),
      )
    } else if (inner instanceof z.ZodUnion) {
      type = 'union'
      const variants = (inner._def as { options: z.ZodTypeAny[] }).options
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
