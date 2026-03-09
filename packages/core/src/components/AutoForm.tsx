import * as React from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod/v4'
import type { AutoFormProps, FieldConfig } from '../types'
import { introspectObjectSchema } from '../introspection/introspect'
import { mergeRegistries } from '../registry/mergeRegistries'
import { defaultRegistry } from '../registry/defaultRegistry'
import { DefaultFieldWrapper } from './defaults/DefaultFieldWrapper'
import { DefaultSubmitButton } from './defaults/DefaultSubmitButton'
import { AutoFormContextProvider } from '../context/AutoFormContext'
import { FieldRenderer } from './FieldRenderer'
import { useConditionalFields } from '../hooks/useConditionalFields'
import { useSectionGrouping } from '../hooks/useSectionGrouping'

function DefaultFormWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DefaultSectionWrapper({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

function applyFieldOverrides(
  fields: FieldConfig[],
  overrides: Record<string, Partial<FieldConfig['meta']>>,
): FieldConfig[] {
  return fields.map((field) => {
    const override = overrides[field.name]
    const updated = override
      ? { ...field, meta: { ...field.meta, ...override } }
      : field

    // Recurse into object children
    if (updated.children) {
      const newChildren = applyFieldOverrides(updated.children, overrides)
      if (newChildren !== updated.children) {
        return { ...updated, children: newChildren }
      }
    }

    // Recurse into array itemConfig (if it has children)
    if (updated.itemConfig?.children) {
      const newItemChildren = applyFieldOverrides(
        updated.itemConfig.children,
        overrides,
      )
      if (newItemChildren !== updated.itemConfig.children) {
        return {
          ...updated,
          itemConfig: { ...updated.itemConfig, children: newItemChildren },
        }
      }
    }

    return updated
  })
}

/** Generate sensible empty defaults so RHF starts with '' instead of undefined */
function buildDefaults(fields: FieldConfig[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    const key = field.name
    switch (field.type) {
      case 'string':
        result[key] = ''
        break
      case 'number':
        result[key] = undefined
        break
      case 'boolean':
        result[key] = false
        break
      case 'select':
        result[key] = field.options?.[0]?.value ?? ''
        break
      case 'array':
        result[key] = []
        break
      case 'object':
        // Recurse — but children have full dot-notated names; just use empty object
        result[key] = {}
        break
      default:
        break
    }
  }
  return result
}

export function AutoForm<TSchema extends z.ZodObject<z.ZodRawShape>>({
  schema,
  onSubmit,
  defaultValues,
  components,
  fields: fieldOverridesProp = {},
  fieldWrapper,
  layout,
  classNames = {},
  disabled = false,
  coercions,
  messages,
}: AutoFormProps<TSchema>) {
  const rawFields = React.useMemo(
    () => introspectObjectSchema(schema),
    [schema],
  )

  const registry = React.useMemo(
    () => mergeRegistries(defaultRegistry, components),
    [components],
  )

  const mergedFields = React.useMemo(
    () => applyFieldOverrides(rawFields, fieldOverridesProp),
    [rawFields, fieldOverridesProp],
  )

  const generatedDefaults = React.useMemo(
    () => buildDefaults(rawFields),
    [rawFields],
  )

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema) as unknown as Resolver,
    defaultValues: {
      ...generatedDefaults,
      ...(defaultValues as Record<string, unknown>),
    },
  })

  const visibleFields = useConditionalFields(mergedFields, control)
  const sections = useSectionGrouping(visibleFields)

  const resolvedLayout = {
    formWrapper: layout?.formWrapper ?? DefaultFormWrapper,
    sectionWrapper: layout?.sectionWrapper ?? DefaultSectionWrapper,
    submitButton: layout?.submitButton ?? DefaultSubmitButton,
  }

  const resolvedFieldWrapper = fieldWrapper ?? DefaultFieldWrapper

  const FormWrapper = resolvedLayout.formWrapper
  const SectionWrapper = resolvedLayout.sectionWrapper
  const SubmitButton = resolvedLayout.submitButton

  return (
    <AutoFormContextProvider
      value={{
        registry,
        fieldOverrides: fieldOverridesProp,
        fieldWrapper: resolvedFieldWrapper,
        layout: resolvedLayout,
        classNames,
        disabled,
        coercions,
        messages,
      }}
    >
      <form
        noValidate
        className={classNames.form}
        onSubmit={(e) => {
          void handleSubmit((values) => onSubmit(values as z.infer<TSchema>))(e)
        }}
      >
        <FormWrapper>
          {sections.map((section) => {
            const renderedFields = section.fields.map((field) => (
              <FieldRenderer key={field.name} field={field} control={control} />
            ))

            if (section.title === null) {
              return (
                <React.Fragment key='__ungrouped'>
                  {renderedFields}
                </React.Fragment>
              )
            }

            return (
              <SectionWrapper key={section.title} title={section.title}>
                {renderedFields}
              </SectionWrapper>
            )
          })}
          <SubmitButton isSubmitting={formState.isSubmitting} />
        </FormWrapper>
      </form>
    </AutoFormContextProvider>
  )
}
