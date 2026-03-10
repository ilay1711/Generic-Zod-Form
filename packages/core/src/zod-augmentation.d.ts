import type { FieldMetaBase } from './types'

// zod@3.25+ — import from 'zod/v4'
declare module 'zod/v4/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface GlobalMeta extends FieldMetaBase {}
}

// zod@4.x — import from 'zod'
declare module 'zod' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface GlobalMeta extends FieldMetaBase {}
}

export {}
