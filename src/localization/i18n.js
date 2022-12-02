import { createI18n } from 'vue-i18n'
import en from '@/localization/resources/en.json'

const DEFAULT_LOCALE = 'en'

const messages = { en: en }

export const i18n = createI18n({
  locales: ['en'],
  fallbackLocale: DEFAULT_LOCALE,
  locale: DEFAULT_LOCALE,
  legacy: false,
  globalInjection: true,
  messages,
})
