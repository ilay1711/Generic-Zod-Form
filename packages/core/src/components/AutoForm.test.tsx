import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as z from 'zod'
import { AutoForm } from './AutoForm'
import type { FieldProps } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  }
}

// ---------------------------------------------------------------------------
// 1. Basic render — flat schema renders the correct number of inputs
// ---------------------------------------------------------------------------

describe('AutoForm', () => {
  it('1. renders the correct number of inputs for a flat schema', () => {
    const schema = z.object({
      firstName: z.string(),
      lastName: z.string(),
      age: z.number(),
    })
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    // firstName, lastName are text; age is number input (role: spinbutton)
    expect(inputs).toHaveLength(2)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 2. Label rendering
  // ---------------------------------------------------------------------------

  it('2. renders field labels associated with their inputs', () => {
    const schema = z.object({ email: z.string().email() })
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 3. Validation on submit — empty required field shows Zod error
  // ---------------------------------------------------------------------------

  it('3. shows a Zod error when submitting an empty required field', async () => {
    const schema = z.object({ name: z.string().min(1, 'Name is required') })
    const { user } = setup(<AutoForm schema={schema} onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
    })
  })

  // ---------------------------------------------------------------------------
  // 4. Successful submit calls onSubmit with typed values
  // ---------------------------------------------------------------------------

  it('4. calls onSubmit with correctly typed values on successful submit', async () => {
    const schema = z.object({ name: z.string() })
    const onSubmit = vi.fn()
    const { user } = setup(<AutoForm schema={schema} onSubmit={onSubmit} />)
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Alice')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice' })
    })
  })

  // ---------------------------------------------------------------------------
  // 5. Number coercion — number field submits as a number
  // ---------------------------------------------------------------------------

  it('5. coerces number field value to a number type', async () => {
    const schema = z.object({ age: z.number() })
    const onSubmit = vi.fn()
    const { user } = setup(<AutoForm schema={schema} onSubmit={onSubmit} />)
    await user.clear(screen.getByRole('spinbutton'))
    await user.type(screen.getByRole('spinbutton'), '25')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      // toHaveBeenCalledWith uses deep equality — 25 (number) !== '25' (string)
      expect(onSubmit).toHaveBeenCalledWith({ age: 25 })
    })
  })

  // ---------------------------------------------------------------------------
  // 6. Default values pre-fill the form
  // ---------------------------------------------------------------------------

  it('6. pre-fills the form with defaultValues', () => {
    const schema = z.object({ name: z.string() })
    render(
      <AutoForm
        schema={schema}
        onSubmit={vi.fn()}
        defaultValues={{ name: 'Bob' }}
      />,
    )
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Bob')
  })

  // ---------------------------------------------------------------------------
  // 7. ZodEnum renders a select with correct options
  // ---------------------------------------------------------------------------

  it('7. renders a select with correct options for z.enum', () => {
    const schema = z.object({
      role: z.enum(['admin', 'editor', 'viewer']),
    })
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    const options = within(select).getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveValue('admin')
    expect(options[1]).toHaveValue('editor')
    expect(options[2]).toHaveValue('viewer')
  })

  // ---------------------------------------------------------------------------
  // 8. Nested object renders children with dot-notated names
  // ---------------------------------------------------------------------------

  it('8. renders nested object children with dot-notated names', () => {
    const schema = z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
      }),
    })
    render(<AutoForm schema={schema} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    // IDs should be dot-notated
    expect(document.getElementById('address.street')).toBeInTheDocument()
    expect(document.getElementById('address.city')).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 9. Array field — renders one row by default (via defaultValues), add/remove
  // ---------------------------------------------------------------------------

  it('9. array field renders add and remove buttons, appends and removes rows', async () => {
    // useFieldArray works reliably with object arrays
    const schema = z.object({
      contacts: z.array(z.object({ name: z.string() })),
    })
    const { user } = setup(<AutoForm schema={schema} onSubmit={vi.fn()} />)
    // Initially no rows
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    // Add first row
    await user.click(screen.getByRole('button', { name: /add/i }))
    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(1))
    // Add second row
    await user.click(screen.getByRole('button', { name: /add/i }))
    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(2))
    // Remove the first row
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])
    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(1))
  })

  // ---------------------------------------------------------------------------
  // 10. Conditional field — shown/hidden based on watched value
  // ---------------------------------------------------------------------------

  it('10. shows/hides a conditional field based on watched value', async () => {
    const schema = z.object({
      type: z.enum(['personal', 'business']),
      companyName: z.string().optional(),
    })
    const { user } = setup(
      <AutoForm
        schema={schema}
        onSubmit={vi.fn()}
        fields={{
          companyName: {
            condition: (values: Record<string, unknown>) =>
              values['type'] === 'business',
          },
        }}
      />,
    )
    // companyName should not be visible initially (type defaults to first option 'personal')
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument()

    // Change type to 'business'
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'business')

    await waitFor(() => {
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // 11. Hidden field — meta.hidden: true means not rendered
  // ---------------------------------------------------------------------------

  it('11. does not render a field with meta.hidden: true', () => {
    const schema = z.object({
      name: z.string(),
      secret: z.string(),
    })
    render(
      <AutoForm
        schema={schema}
        onSubmit={vi.fn()}
        fields={{ secret: { hidden: true } }}
      />,
    )
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/secret/i)).not.toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 12. Disabled form — disabled prop disables all inputs
  // ---------------------------------------------------------------------------

  it('12. disables all inputs when disabled prop is true', () => {
    const schema = z.object({ name: z.string(), age: z.number() })
    render(<AutoForm schema={schema} onSubmit={vi.fn()} disabled />)
    const textInputs = screen.getAllByRole('textbox')
    const numberInputs = screen.getAllByRole('spinbutton')
    ;[...textInputs, ...numberInputs].forEach((input) =>
      expect(input).toBeDisabled(),
    )
  })

  // ---------------------------------------------------------------------------
  // 13. Custom component — custom string component renders instead of default
  // ---------------------------------------------------------------------------

  it('13. uses a custom component from the components registry', () => {
    const CustomInput = (props: FieldProps) => (
      <input
        data-testid='custom-input'
        {...props}
        value={props.value as string}
        onChange={(e) => props.onChange(e.target.value)}
      />
    )
    const schema = z.object({ name: z.string() })
    render(
      <AutoForm
        schema={schema}
        onSubmit={vi.fn()}
        components={{ string: CustomInput }}
      />,
    )
    expect(screen.getByTestId('custom-input')).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 14. meta.component override — renders the registry component by key
  // ---------------------------------------------------------------------------

  it('14. renders the correct component from meta.component key', () => {
    const TextareaInput = (props: FieldProps) => (
      <textarea
        data-testid='textarea-component'
        onChange={(e) => props.onChange(e.target.value)}
        value={props.value as string}
      />
    )
    const schema = z.object({ bio: z.string() })
    render(
      <AutoForm
        schema={schema}
        onSubmit={vi.fn()}
        components={{ textarea: TextareaInput }}
        fields={{ bio: { component: 'textarea' } }}
      />,
    )
    expect(screen.getByTestId('textarea-component')).toBeInTheDocument()
  })

  // ---------------------------------------------------------------------------
  // 15. Field order — fields render in meta.order order
  // ---------------------------------------------------------------------------

  it('15. renders fields in meta.order order', () => {
    const schema = z.object({ first: z.string(), second: z.string() })
    render(
      <AutoForm
        schema={schema}
        onSubmit={vi.fn()}
        fields={{ first: { order: 2 }, second: { order: 1 } }}
      />,
    )
    const inputs = screen.getAllByRole('textbox')
    // second (order=1) should come before first (order=2)
    expect(inputs[0]).toHaveAttribute('name', 'second')
    expect(inputs[1]).toHaveAttribute('name', 'first')
  })

  // ---------------------------------------------------------------------------
  // 16. Unknown type — renders nothing and logs a warning
  // ---------------------------------------------------------------------------

  it('16. renders null and logs a warning for an unsupported Zod type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // z.null() introspects as 'unknown' since ZodNull has no handler
    const schema = z.object({
      name: z.string(),
      unsupported: z.null(),
    })
    render(
      <AutoForm
        schema={schema as z.ZodObject<z.ZodRawShape>}
        onSubmit={vi.fn()}
      />,
    )
    // The form renders without throwing
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    // The unsupported field renders nothing (no label for 'unsupported')
    expect(screen.queryByLabelText(/unsupported/i)).not.toBeInTheDocument()
    // A warning was logged
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown'))
    warnSpy.mockRestore()
  })
})
