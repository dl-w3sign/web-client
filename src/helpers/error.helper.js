import { i18n } from '@/localization/i18n'

export class ErrorHandler {
  static process(error) {
    if (!error) return
    let msg
    if (error.response?.status === 409) {
      msg = i18n.global.t('time-stamping-form.hash-already-exists')
    } else if (error.response?.status === 404) {
      msg = i18n.global.t('time-stamping-form.hash-not-found')
    } else {
      msg = i18n.global.t('time-stamping-form.somethings-gone-wrong')
    }

    return msg
  }
}
