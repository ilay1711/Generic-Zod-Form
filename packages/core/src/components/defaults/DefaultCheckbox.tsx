import type { FieldProps } from '../../types'

export function DefaultCheckbox(props: FieldProps) {
  const { name, value, onChange, onBlur, required, disabled, label } = props

  return (
    <label htmlFor={name}>
      <input
        id={name}
        name={name}
        type='checkbox'
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-disabled={disabled}
      />
      {label}
    </label>
  )
}
