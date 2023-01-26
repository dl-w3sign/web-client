import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { TimeDate, TimeFormat } from '@/types'

dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export class Time {
  #date: Dayjs

  constructor(date?: TimeDate, format?: TimeFormat) {
    this.#date = this._dayjs(date, format)
  }

  private _dayjs(date?: TimeDate, format?: TimeFormat): Dayjs {
    return dayjs(date, format)
  }

  public tz(timezone?: string): Time {
    this.#date = this._tz(this.#date, timezone)
    return this
  }

  private _tz(date: TimeDate, timezone?: string) {
    return dayjs.tz(date, timezone)
  }

  public format(format?: string): string {
    return this.#date.format(format)
  }
}
