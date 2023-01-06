import dayjs, { ConfigType, OptionType, Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)
export class DateUtil {
  private static _dayjs(date: ConfigType, format?: OptionType): Dayjs {
    return format ? dayjs(date, format) : dayjs(date)
  }

  public static format(
    date: ConfigType,
    inputFormat?: OptionType,
    outputFormat?: string,
  ) {
    return this._dayjs(date, inputFormat).format(outputFormat)
  }
}
