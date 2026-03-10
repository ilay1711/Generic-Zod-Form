import { useState } from 'react'
import * as z from 'zod/v4'
import { AutoForm } from '@uniform/core'
import { SubmittedData } from './shared'

const shippingSchema = z.object({
  country: z.enum(['us', 'ca', 'gb']),
  region: z.enum([
    'ca',
    'ny',
    'tx', // US states
    'on',
    'qc',
    'bc', // Canadian provinces
    'eng',
    'sct',
    'wls', // UK regions
  ]),
  expressAvailable: z.boolean(),
  shippingMethod: z.enum(['standard', 'express']),
})

export default function Example15() {
  const [data, setData] = useState<unknown>(null)
  return (
    <section id='ex15'>
      <h2>Example 15: Field Dependencies</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Use <code>meta.depend</code> to reactively update a field's{' '}
        <strong>options</strong>, <strong>value</strong>,{' '}
        <strong>visibility</strong>, <strong>disabled state</strong>, or{' '}
        <strong>label</strong> based on other field values — without any
        imperative code.
      </p>
      <AutoForm
        schema={shippingSchema}
        defaultValues={{
          country: 'us',
          region: 'ca',
          expressAvailable: true,
          shippingMethod: 'standard',
        }}
        fields={{
          region: {
            depend: (values) => {
              const optionsByCountry: Record<
                string,
                { label: string; value: string }[]
              > = {
                us: [
                  { label: 'California', value: 'ca' },
                  { label: 'New York', value: 'ny' },
                  { label: 'Texas', value: 'tx' },
                ],
                ca: [
                  { label: 'Ontario', value: 'on' },
                  { label: 'Quebec', value: 'qc' },
                  { label: 'British Columbia', value: 'bc' },
                ],
                gb: [
                  { label: 'England', value: 'eng' },
                  { label: 'Scotland', value: 'sct' },
                  { label: 'Wales', value: 'wls' },
                ],
              }
              const country = String(values['country'])
              const opts = optionsByCountry[country] ?? []
              const currentRegion = String(values['region'])
              const isCurrentValid = opts.some((o) => o.value === currentRegion)
              return {
                label:
                  country === 'us'
                    ? 'State'
                    : country === 'ca'
                      ? 'Province'
                      : 'Region',
                options: opts,
                value: isCurrentValid ? undefined : opts[0]?.value,
              }
            },
          },
          shippingMethod: {
            depend: (values) => ({
              disabled: values['expressAvailable'] !== true,
              description: values['expressAvailable']
                ? 'Choose your delivery speed'
                : 'Express shipping is not available for this order',
              value:
                values['expressAvailable'] !== true ? 'standard' : undefined,
            }),
          },
        }}
        onSubmit={(values) => setData(values)}
      />
      <SubmittedData data={data} />
    </section>
  )
}
