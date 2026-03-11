import { useState } from 'react'
import * as z from 'zod/v4'
import { AutoForm, UniForm } from '@uniform/core'
import { SubmittedData } from './shared'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  street: z.string(),
  city: z.string(),
  zip: z.string().min(5, 'ZIP must be 5 digits'),
  newsletter: z.boolean(),
  notifications: z.boolean(),
})

const profileForm = new UniForm(profileSchema)

export default function Example02() {
  const [data, setData] = useState<unknown>(null)
  return (
    <section id='ex2'>
      <h2>Example 2: Section Grouping</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Fields grouped into sections via <code>meta.section</code>. Each section
        renders inside a <code>layout.sectionWrapper</code>.
      </p>
      <AutoForm
        form={profileForm}
        defaultValues={{ newsletter: false, notifications: true }}
        fields={{
          username: { section: 'Account', order: 1 },
          street: { section: 'Address', order: 2 },
          city: { section: 'Address', order: 3 },
          zip: { section: 'Address', order: 4 },
          newsletter: { section: 'Preferences', order: 5 },
          notifications: { section: 'Preferences', order: 6 },
        }}
        onSubmit={(values) => setData(values)}
      />
      <SubmittedData data={data} />
    </section>
  )
}
