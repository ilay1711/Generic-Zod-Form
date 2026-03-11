import * as React from 'react'
import type {
  CoercionMap,
  ComponentRegistry,
  FieldWrapperProps,
  ResolvedLayoutSlots,
  FormClassNames,
  ValidationMessages,
  FormLabels,
  FormMethods,
} from '../types'

export type AutoFormContextValue = {
  registry: ComponentRegistry
  fieldOverrides: Record<string, unknown>
  fieldWrapper: React.ComponentType<FieldWrapperProps>
  layout: ResolvedLayoutSlots
  classNames: FormClassNames
  disabled: boolean
  coercions?: CoercionMap
  messages?: ValidationMessages
  labels: FormLabels
  formMethods: FormMethods
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
