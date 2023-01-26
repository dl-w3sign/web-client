import { Dayjs } from 'dayjs'

export type TimeDate = string | number | Date | Dayjs | null | undefined

export type TimeFormat =
  | {
      locale?: string
      format?: string
      utc?: boolean
    }
  | string
  | string[]
