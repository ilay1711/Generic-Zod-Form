import { useState } from 'react'
import type * as React from 'react'
import * as z from 'zod/v4'
import { AutoForm, createAutoForm } from '@uniform/core'
import type { FieldWrapperProps, FieldProps } from '@uniform/core'

// ---------------------------------------------------------------------------
// Submitted Data Display
// ---------------------------------------------------------------------------

function SubmittedData({ data }: { data: unknown }) {
  if (data == null) return null
  return (
    <pre
      style={{
        background: '#f5f5f5',
        padding: '1rem',
        borderRadius: 4,
        marginTop: '0.5rem',
        fontSize: '0.85rem',
        overflow: 'auto',
      }}
    >
      {JSON.stringify(
        data,
        (_k, v) => (v instanceof Date ? v.toISOString() : v),
        2,
      )}
    </pre>
  )
}

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

// ---------------------------------------------------------------------------
// Example 5: createAutoForm factory
// ---------------------------------------------------------------------------

const invoiceSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  amount: z.number().min(0),
  dueDate: z.date(),
  status: z.enum(['draft', 'sent', 'paid']),
  notes: z.string().optional(),
})

function BrandedInput(props: FieldProps) {
  return (
    <input
      id={props.name}
      name={props.name}
      value={String(props.value ?? '')}
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      disabled={props.disabled}
      required={props.required}
      aria-required={props.required}
      aria-disabled={props.disabled ?? false}
      type={
        (props.meta.inputType as string) === 'number'
          ? 'number'
          : (props.meta.inputType as string) === 'date'
            ? 'date'
            : 'text'
      }
      style={{
        border: '2px solid #4f46e5',
        borderRadius: 6,
        padding: '0.4rem 0.6rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    />
  )
}

function BrandedFieldWrapper({ children, field, error }: FieldWrapperProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={field.name}
        style={{
          fontWeight: 600,
          display: 'block',
          marginBottom: 2,
          color: '#4f46e5',
        }}
      >
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      {children}
      {error && (
        <span role='alert' style={{ color: 'red', fontSize: '0.8rem' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function BrandedSubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type='submit'
      disabled={isSubmitting}
      style={{
        background: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '0.5rem 1.2rem',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
      }}
    >
      {isSubmitting ? 'Saving...' : 'Create Invoice'}
    </button>
  )
}

const BrandedAutoForm = createAutoForm({
  components: {
    string: BrandedInput,
    number: BrandedInput,
    date: BrandedInput,
  },
  fieldWrapper: BrandedFieldWrapper,
  layout: { submitButton: BrandedSubmitButton },
})

// ---------------------------------------------------------------------------
// Example 6: Custom validation messages
// ---------------------------------------------------------------------------

const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  age: z.number().min(18).max(120),
  website: z.url().optional(),
})

// ---------------------------------------------------------------------------
// Example 7: Deep field overrides
// ---------------------------------------------------------------------------

const orderSchema = z.object({
  orderId: z.string().min(1),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(5),
  }),
  items: z.array(z.object({ name: z.string(), qty: z.number() })),
})

// ---------------------------------------------------------------------------
// Example 8: Kitchen Sink
// ---------------------------------------------------------------------------

const kitchenSinkSchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  age: z.number().min(0).max(150),
  role: z.enum(['user', 'admin', 'editor']),
  bio: z.string().optional(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(5),
  }),
  tags: z.array(z.object({ value: z.string().min(1) })),
  hasNotes: z.boolean(),
  notes: z.string().optional(),
})

const KitchenSinkAutoForm = createAutoForm({
  components: {
    string: BrandedInput,
    number: BrandedInput,
  },
  fieldWrapper: BrandedFieldWrapper,
  layout: { submitButton: BrandedSubmitButton },
  classNames: { form: 'demo-form' },
})

// ---------------------------------------------------------------------------
// Example 9: Disabled form
// ---------------------------------------------------------------------------

const disabledSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'user']),
  active: z.boolean(),
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
// Navigation items
// ---------------------------------------------------------------------------

const examples = [
  { id: 'ex1', label: '1. classNames + span' },
  { id: 'ex2', label: '2. Section Grouping' },
  { id: 'ex3', label: '3. Custom Layout Slots' },
  { id: 'ex4', label: '4. Custom fieldWrapper' },
  { id: 'ex5', label: '5. createAutoForm Factory' },
  { id: 'ex6', label: '6. Validation Messages' },
  { id: 'ex7', label: '7. Deep Field Overrides' },
  { id: 'ex8', label: '8. Kitchen Sink' },
  { id: 'ex9', label: '9. Disabled Form' },
]

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [data1, setData1] = useState<unknown>(null)
  const [data2, setData2] = useState<unknown>(null)
  const [data3, setData3] = useState<unknown>(null)
  const [data4, setData4] = useState<unknown>(null)
  const [data5, setData5] = useState<unknown>(null)
  const [data6, setData6] = useState<unknown>(null)
  const [data7, setData7] = useState<unknown>(null)
  const [data8, setData8] = useState<unknown>(null)

  return (
    <main
      style={{
        fontFamily: 'system-ui',
        padding: '2rem',
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <h1>UniForm Playground</h1>

      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: 8,
          border: '1px solid #e0e0e0',
        }}
      >
        {examples.map((ex) => (
          <a
            key={ex.id}
            href={`#${ex.id}`}
            style={{
              fontSize: '0.85rem',
              color: '#4f46e5',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: 4,
              background: '#fff',
              border: '1px solid #e0e0e0',
            }}
          >
            {ex.label}
          </a>
        ))}
      </nav>

      {/* -----------------------------------------------------------
          Example 1: classNames + span
      ----------------------------------------------------------- */}
      <section id='ex1'>
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
          onSubmit={(values) => setData1(values)}
        />
        <SubmittedData data={data1} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 2: Section grouping
      ----------------------------------------------------------- */}
      <section id='ex2'>
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
          onSubmit={(values) => setData2(values)}
        />
        <SubmittedData data={data2} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 3: Custom layout slots
      ----------------------------------------------------------- */}
      <section id='ex3'>
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
          onSubmit={(values) => setData3(values)}
        />
        <SubmittedData data={data3} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 4: Custom fieldWrapper
      ----------------------------------------------------------- */}
      <section id='ex4'>
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
          onSubmit={(values) => setData4(values)}
        />
        <SubmittedData data={data4} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 5: createAutoForm factory
      ----------------------------------------------------------- */}
      <section id='ex5'>
        <h2>Example 5: createAutoForm Factory</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          A pre-configured <code>AutoForm</code> with branded input components,
          a custom field wrapper, and a styled submit button — all baked in via{' '}
          <code>createAutoForm()</code>.
        </p>
        <BrandedAutoForm
          schema={invoiceSchema}
          defaultValues={{ status: 'draft' }}
          onSubmit={(values) => setData5(values)}
        />
        <SubmittedData data={data5} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 6: Custom validation messages
      ----------------------------------------------------------- */}
      <section id='ex6'>
        <h2>Example 6: Custom Validation Messages</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Custom error messages at three levels: global <code>required</code>{' '}
          override, per-field catch-all, and per-field per-error-code.
        </p>
        <AutoForm
          schema={registrationSchema}
          onSubmit={(values) => setData6(values)}
          messages={{
            required: 'This field is required',
            email: {
              invalid_format: 'Please enter a valid email address',
            },
            age: 'Please enter a valid age (18–120)',
          }}
        />
        <SubmittedData data={data6} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 7: Deep field overrides
      ----------------------------------------------------------- */}
      <section id='ex7'>
        <h2>Example 7: Deep Field Overrides</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Dot-notated <code>fields</code> overrides that target nested object
          and array item fields.
        </p>
        <AutoForm
          schema={orderSchema}
          defaultValues={{ items: [{ name: '', qty: 0 }] }}
          fields={{
            orderId: { label: 'Order #', placeholder: 'ORD-0001' },
            'address.street': {
              placeholder: '123 Main St',
              description: 'Include apartment number',
            },
            'address.city': { placeholder: 'City / Town' },
            'address.zip': { placeholder: '00000', span: 6 },
          }}
          onSubmit={(values) => setData7(values)}
        />
        <SubmittedData data={data7} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 8: Kitchen Sink
      ----------------------------------------------------------- */}
      <section id='ex8'>
        <h2>Example 8: Kitchen Sink</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Everything combined: <code>createAutoForm</code> factory, sections,
          conditional fields, deep overrides, custom messages, grid layout,
          nested objects, and arrays.
        </p>
        <KitchenSinkAutoForm
          schema={kitchenSinkSchema}
          defaultValues={{
            role: 'user',
            hasNotes: false,
            tags: [{ value: '' }],
          }}
          fields={{
            fullName: { section: 'Personal', order: 1, span: 6 },
            email: { section: 'Personal', order: 2, span: 6 },
            age: { section: 'Personal', order: 3, span: 6 },
            role: { section: 'Personal', order: 4, span: 6 },
            bio: { section: 'Personal', order: 5 },
            'address.street': { placeholder: '123 Main St' },
            'address.city': { placeholder: 'City / Town' },
            'address.zip': { placeholder: '00000', span: 6 },
            hasNotes: { order: 90 },
            notes: {
              order: 91,
              condition: (vals: Record<string, unknown>) =>
                vals['hasNotes'] === true,
            },
          }}
          messages={{
            required: 'This field is required',
            email: {
              invalid_format: 'Please enter a valid email',
            },
          }}
          onSubmit={(values) => setData8(values)}
        />
        <SubmittedData data={data8} />
      </section>

      <hr style={{ margin: '2rem 0' }} />

      {/* -----------------------------------------------------------
          Example 9: Disabled Form
      ----------------------------------------------------------- */}
      <section id='ex9'>
        <h2>Example 9: Disabled Form</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          All fields disabled via the <code>disabled</code> prop. The submit
          button is also non-interactive.
        </p>
        <AutoForm
          schema={disabledSchema}
          disabled
          defaultValues={{
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'admin',
            active: true,
          }}
          onSubmit={() => {}}
        />
      </section>
    </main>
  )
}
