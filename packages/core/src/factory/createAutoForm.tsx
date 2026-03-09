import * as React from 'react'
import type * as z from 'zod/v4'
import type { AutoFormConfig, AutoFormProps, AutoFormHandle } from '../types'
import { AutoForm } from '../components/AutoForm'
import { mergeRegistries } from '../registry/mergeRegistries'

export function createAutoForm(config: AutoFormConfig) {
  function ConfiguredAutoForm<TSchema extends z.ZodObject<z.ZodRawShape>>(
    props: AutoFormProps<TSchema> & {
      ref?: React.Ref<AutoFormHandle<z.infer<TSchema>>>
    },
  ) {
    const mergedComponents = React.useMemo(
      () => mergeRegistries(config.components ?? {}, props.components),
      [props.components],
    )

    const mergedLayout = React.useMemo(
      () => ({ ...config.layout, ...props.layout }),
      [props.layout],
    )

    const mergedClassNames = React.useMemo(
      () => ({ ...config.classNames, ...props.classNames }),
      [props.classNames],
    )

    const mergedCoercions = React.useMemo(
      () =>
        props.coercions || config.coercions
          ? { ...config.coercions, ...props.coercions }
          : undefined,
      [props.coercions],
    )

    const mergedMessages = React.useMemo(
      () =>
        props.messages || config.messages
          ? { ...config.messages, ...props.messages }
          : undefined,
      [props.messages],
    )

    return (
      <AutoForm
        {...props}
        ref={props.ref}
        components={mergedComponents}
        fieldWrapper={props.fieldWrapper ?? config.fieldWrapper}
        layout={mergedLayout}
        classNames={mergedClassNames}
        disabled={props.disabled || config.disabled || false}
        coercions={mergedCoercions}
        messages={mergedMessages}
      />
    )
  }

  ConfiguredAutoForm.displayName = 'AutoForm(configured)'
  return ConfiguredAutoForm
}
