import type * as React from 'react'
import * as z from 'zod/v4'
import { AutoForm } from '@uniform/core'
import type { FieldWrapperProps } from '@uniform/core'

// ---------------------------------------------------------------------------
// Example 1: Flat schema — classNames + span
// ---------------------------------------------------------------------------

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').meta({ placeholder: 'Name...' }),
  email: z.email('Invalid email'),
  age: z.number().min(0).max(150).optional(),
  role: z.enum(['user', 'admin', 'editor']),
  subscribe: z.boolean(),
})

// ---------------------------------------------------------------------------
// Example 2: Nested schema — section grouping
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  street: z.string(),
  city: z.string(),
  zip: z.string().min(5, 'ZIP must be 5 digits'),
  newsletter: z.boolean(),
  notifications: z.boolean(),
})

// ---------------------------------------------------------------------------
// Example 3: Array schema — custom layout slots
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
// Example 4: Custom fieldWrapper
// ---------------------------------------------------------------------------

const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
})

function CardFieldWrapper({ children, field, error }: FieldWrapperProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        marginBottom: '0.75rem',
        background: error ? '#fff5f5' : '#fafafa',
      }}
    >
      <label
        htmlFor={field.name}
        style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}
      >
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      {children}
      {field.meta.description && (
        <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0 0' }}>
          {String(field.meta.description)}
        </p>
      )}
      {error && (
        <span role='alert' style={{ color: 'red', fontSize: '0.8rem' }}>
          {error}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Custom layout slot components for Example 3
// ---------------------------------------------------------------------------

function StyledFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: 12,
        border: '1px solid #e0e0e0',
      }}
    >
      {children}
    </div>
  )
}

function StyledSectionWrapper({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div
      style={{
        background: '#fff',
        padding: '1rem',
        borderRadius: 8,
        marginBottom: '1rem',
        border: '1px solid #e8e8e8',
      }}
    >
      <h3 style={{ margin: '0 0 0.75rem', color: '#333' }}>{title}</h3>
      {children}
    </div>
  )
}

function StyledSubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type='submit'
      disabled={isSubmitting}
      style={{
        background: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '0.6rem 1.5rem',
        fontSize: '1rem',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.6 : 1,
      }}
    >
      {isSubmitting ? 'Saving...' : 'Save Team'}
    </button>
  )
}

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
      <h1>UniForm Playground — Phase 3</h1>

      {/* -----------------------------------------------------------
          Example 1: classNames + span
      ----------------------------------------------------------- */}
      <section>
        <h2>Example 1: classNames + span</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Uses <code>classNames</code> to apply CSS classes and{' '}
          <code>span</code> for grid column hints.
        </p>
        <style>{`
          .demo-form {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 0.75rem;
          }
          .demo-form > * {
            grid-column: span var(--field-span, 12);
          }
          .demo-field { padding: 0.5rem; background: #f5f5f5; border-radius: 4px; }
          .demo-label { font-weight: 600; display: block; margin-bottom: 2px; }
          .demo-error { color: red; font-size: 0.8rem; }
          .demo-desc { color: #888; font-size: 0.8rem; }
        `}</style>
        <AutoForm
          schema={contactSchema}
          defaultValues={{ role: 'user', subscribe: false }}
          classNames={{
            form: 'demo-form',
            fieldWrapper: 'demo-field',
            label: 'demo-label',
            error: 'demo-error',
            description: 'demo-desc',
          }}
          fields={{
            name: { span: 6 },
            email: { span: 6 },
            age: { span: 4 },
            role: { span: 4 },
            subscribe: { span: 4 },
          }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 2: Section grouping
      ----------------------------------------------------------- */}
      <section>
        <h2>Example 2: Section Grouping</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Fields grouped into sections via <code>meta.section</code>. Each
          section renders inside a <code>layout.sectionWrapper</code>.
        </p>
        <AutoForm
          schema={profileSchema}
          defaultValues={{
            newsletter: false,
            notifications: true,
          }}
          fields={{
            username: { section: 'Account', order: 1 },
            street: { section: 'Address', order: 2 },
            city: { section: 'Address', order: 3 },
            zip: { section: 'Address', order: 4 },
            newsletter: { section: 'Preferences', order: 5 },
            notifications: { section: 'Preferences', order: 6 },
          }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 3: Custom layout slots
      ----------------------------------------------------------- */}
      <section>
        <h2>Example 3: Custom Layout Slots</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Custom <code>formWrapper</code>, <code>sectionWrapper</code>, and{' '}
          <code>submitButton</code> via the <code>layout</code> prop.
        </p>
        <AutoForm
          schema={teamSchema}
          defaultValues={{
            members: [{ name: '', email: '' }],
            tags: [],
          }}
          fields={{
            teamName: { section: 'Team Info' },
            members: { section: 'Members' },
            tags: { section: 'Tags' },
          }}
          layout={{
            formWrapper: StyledFormWrapper,
            sectionWrapper: StyledSectionWrapper,
            submitButton: StyledSubmitButton,
          }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 4: Custom fieldWrapper
      ----------------------------------------------------------- */}
      <section>
        <h2>Example 4: Custom fieldWrapper</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          A custom <code>fieldWrapper</code> renders each field in a card-style
          container with error highlighting.
        </p>
        <AutoForm
          schema={signupSchema}
          fieldWrapper={CardFieldWrapper}
          fields={{
            username: { description: 'Choose a unique username' },
            password: { description: 'Minimum 8 characters' },
          }}
          onSubmit={(values) => {
            alert(JSON.stringify(values, null, 2))
          }}
        />
      </section>
    </main>
  )
}
