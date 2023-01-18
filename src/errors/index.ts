import * as runtimeErrors from './runtime.errors'
import { errors as ethersErrors } from 'ethers'

export const errors = {
  ...runtimeErrors,
  ...ethersErrors,
}
