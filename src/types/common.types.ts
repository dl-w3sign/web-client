import { ICON_NAMES } from '@/enums'
import { BigNumberish } from 'ethers'

export type NotificationObjectPayload = {
  title?: string
  message: string
  iconName?: typeof ICON_NAMES | unknown
}

export type {
  SignerInfo,
  StampInfo,
  UsePaginationCallback,
  UsePaginationCallbackArg,
  PoseidonHash,
} from '@/composables'

export type PromiseOrValue<T> = T | Promise<T>

export type ZKPPointsStructType = {
  a: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  b: [
    [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>],
    [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>],
  ]
  c: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
}
