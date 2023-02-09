import {
  required as _required,
  requiredIf as _requiredIf,
  maxValue as _maxValue,
} from '@vuelidate/validators'
import { ValidationRule } from '@vuelidate/core'
import { createI18nMessage, MessageProps } from '@vuelidate/validators'
import { i18n } from '@/localization'
import { Ref } from 'vue'

type RequiredIfArg =
  | string
  | boolean
  | Ref<boolean>
  | (() => boolean | Promise<boolean>)

const { t } = i18n.global || i18n

const messagePath = ({ $validator }: MessageProps) =>
  `validations.field-error_${$validator}`

const withI18nMessage = createI18nMessage({ t, messagePath })

export const required = <ValidationRule>withI18nMessage(_required)

export const requiredIf = (prop: RequiredIfArg): ValidationRule =>
  <ValidationRule>withI18nMessage(_requiredIf(prop))

export const maxValue = (value: number): ValidationRule =>
  <ValidationRule>withI18nMessage(_maxValue(value))
