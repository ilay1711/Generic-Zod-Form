import type { ValidationMessages } from '../types'

type FieldError = {
  message?: string
  type?: string
}

export function resolveErrorMessage(
  fieldName: string,
  error: FieldError | undefined,
  messages?: ValidationMessages,
): string | undefined {
  if (!error) return undefined

  const originalMessage = error.message

  if (!messages) return originalMessage

  // 1. Per-field override
  const fieldMessage = messages[fieldName]
  if (fieldMessage !== undefined) {
    // Per-field string — use it as the error message regardless of error code
    if (typeof fieldMessage === 'string') return fieldMessage
    // Per-field per-code — look up the error type
    if (typeof fieldMessage === 'object' && error.type) {
      const coded = fieldMessage[error.type]
      if (coded) return coded
    }
  }

  // 2. Global required override
  if (messages.required && isRequiredError(error)) {
    return messages.required
  }

  // 3. Fall back to Zod's original message
  return originalMessage
}

function isRequiredError(error: FieldError): boolean {
  // RHF maps Zod errors; "too_small" with inclusive minimum is the common Zod required pattern
  // Also handle "invalid_type" which Zod v4 uses for undefined-on-required
  return error.type === 'too_small' || error.type === 'invalid_type'
}
