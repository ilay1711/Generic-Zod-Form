import * as z from 'zod'
import { AutoForm } from '@uniform/core'

// ---------------------------------------------------------------------------
// Example 1: Flat schema
// ---------------------------------------------------------------------------

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(0).max(150).optional(),
  role: z.enum(['user', 'admin', 'editor']),
  subscribe: z.boolean(),
})

// ---------------------------------------------------------------------------
// Example 2: Nested schema
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string().min(5, 'ZIP must be 5 digits'),
  }),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean(),
  }),
})

// ---------------------------------------------------------------------------
// Example 3: Array schema
// ---------------------------------------------------------------------------

const teamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  members: z.array(
    z.object({
      name: z.string().min(1, 'Member name required'),
      email: z.string().email('Invalid email'),
    }),
  ),
  tags: z.array(z.string()),
})

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <main
      style={{
        fontFamily: 'system-ui',
        padding: '2rem',
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <h1>UniForm Playground — Phase 2</h1>

      <section>
        <h2>Example 1: Flat Schema</h2>
        <AutoForm
          schema={contactSchema}
          defaultValues={{ role: 'user', subscribe: false }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Example 2: Nested Schema</h2>
        <AutoForm
          schema={profileSchema}
          defaultValues={{
            preferences: { newsletter: false, notifications: true },
          }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Example 3: Array Schema</h2>
        <AutoForm
          schema={teamSchema}
          defaultValues={{ members: [{ name: '', email: '' }], tags: [] }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>
    </main>
  )
}
