import { ICON_NAMES } from '@/enums'

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
} from '@/composables'
