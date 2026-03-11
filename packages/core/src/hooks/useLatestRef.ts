import * as React from 'react'

/**
 * A hook that returns a ref object with the latest value of the passed variable.
 * Useful for accessing the latest props/state inside async callbacks or effects
 * without adding them to dependency arrays.
 */
export function useLatestRef<T>(value: T) {
  const ref = React.useRef<T>(value)

  React.useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
