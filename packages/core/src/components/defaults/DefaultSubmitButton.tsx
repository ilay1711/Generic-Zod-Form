type DefaultSubmitButtonProps = {
  isSubmitting: boolean
}

export function DefaultSubmitButton({
  isSubmitting,
}: DefaultSubmitButtonProps) {
  return (
    <button type='submit' disabled={isSubmitting}>
      Submit
    </button>
  )
}
