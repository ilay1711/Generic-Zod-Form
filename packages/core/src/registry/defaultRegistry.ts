import type { ComponentRegistry } from '../types'
import { DefaultInput } from '../components/defaults/DefaultInput'
import { DefaultCheckbox } from '../components/defaults/DefaultCheckbox'
import { DefaultSelect } from '../components/defaults/DefaultSelect'

export const defaultRegistry: ComponentRegistry = {
  string: DefaultInput,
  number: DefaultInput,
  date: DefaultInput,
  boolean: DefaultCheckbox,
  select: DefaultSelect,
}
