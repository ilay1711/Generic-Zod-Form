import * as React from 'react'
import type {
  ComponentRegistry,
  FieldMeta,
  FieldWrapperProps,
  LayoutSlots,
  FormClassNames,
} from '../types'

export type AutoFormContextValue = {
  registry: ComponentRegistry
  fieldOverrides: Record<string, Partial<FieldMeta>>
  fieldWrapper: React.ComponentType<FieldWrapperProps>
  layout: Required<LayoutSlots>
  classNames: FormClassNames
  disabled: boolean
}

const AutoFormContext = React.createContext<AutoFormContextValue | null>(null)

export function useAutoFormContext(): AutoFormContextValue {
  const ctx = React.useContext(AutoFormContext)
  if (!ctx) {
    throw new Error(
      '[UniForm] useAutoFormContext must be used inside an <AutoForm> component.',
    )
  }
  return ctx
}

export const AutoFormContextProvider = AutoFormContext.Provider
