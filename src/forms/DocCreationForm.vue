<template>
  <form class="doc-creation-form">
    <div v-if="isSubmitting" class="doc-creation-form__loader">
      <spinner />
      <p class="doc-creation-form__please-wait-msg">
        {{ $t('doc-creation-form.please-wait-msg') }}
      </p>
    </div>
    <div v-else-if="isConfirmationShown">
      <icon
        class="doc-creation-form__confirmation-icon"
        :name="$icons.confirmation"
      />
      <p class="doc-creation-form__success-msg">
        {{ $t('doc-creation-form.success-msg') }}
      </p>
      <text-field
        :model-value="fileHash || ''"
        :is-copied="true"
        :label="$t('doc-creation-form.document-hash-label')"
      />
    </div>
    <div v-else-if="isFailureShown">
      <file-field v-model="form.file" :is-readonly="true" />
      <div class="doc-creation-form__note-error">
        <icon
          class="doc-creation-form__note-error-icon"
          :name="$icons.exclamationCircle"
        />
        <p v-if="errorMessage">
          {{ errorMessage }}
        </p>
      </div>
      <app-btn
        class="doc-creation-form__button"
        :preset="BUTTON_PRESETS.primary"
        @click.prevent="reset"
      >
        {{ $t('doc-creation-form.reset-button-text') }}
      </app-btn>
    </div>
    <div v-else>
      <file-field v-model="form.file" :accept="fileMIMETypes.join(', ')" />
      <app-btn
        class="doc-creation-form__button"
        :preset="BUTTON_PRESETS.primary"
        :state="
          isFormDisabled || !isFieldsValid
            ? BUTTON_STATES.noneEvents
            : undefined
        "
        @click.prevent="submit"
      >
        {{ $t('doc-creation-form.submit-button-text') }}
      </app-btn>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, inject } from 'vue'
import { Icon, AppBtn, Spinner } from '@/common'
import {
  useContext,
  useForm,
  useFormValidation,
  UseProvider,
  useTimestamp,
  useWeb3,
} from '@/composables'
import {
  APP_KEYS,
  BUTTON_PRESETS,
  BUTTON_STATES,
  ETHERS_ERROR_CODES,
} from '@/enums'
import { FileField, TextField } from '@/fields'
import { ErrorHandler, getKeccak256FileHash, Bus } from '@/helpers'
import { required, maxValue } from '@/validators'
import { EthProviderRpcError, Keccak256Hash } from '@/types'
import { errors } from '@/errors'

type Form = {
  file: File | null
}

const emit = defineEmits<{
  (event: 'complete'): void
}>()

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)
const { contractsInfo } = useWeb3()
const { $t } = useContext()

const timestampContractInstance = computed(() => {
  return web3Provider
    ? useTimestamp(web3Provider, contractsInfo.timestamp.address)
    : undefined
})

const {
  isFormDisabled,
  isSubmitting,
  isConfirmationShown,
  isFailureShown,
  showConfirmation,
  showFailure,
  disableForm,
  enableForm,
} = useForm()

const fileMIMETypes = ['image/jpeg', 'image/png', 'application/pdf']
const fileHash = ref<Keccak256Hash | null>(null)
const errorMessage = ref('')

const form: Form = reactive({
  file: null,
})

const { isFieldsValid } = useFormValidation(form, {
  file: {
    required,
    size: {
      required,
      maxValue: maxValue(10 * 1000 * 1000),
    },
  },
})

const getErrorMessage = (error: EthProviderRpcError): string => {
  switch (error.message) {
    case 'execution reverted: TimeStamping: Hash collision.':
      return $t('doc-creation-form.error-hash-collision')
    default:
      return $t('doc-creation-form.error-default')
  }
}

const reset = () => {
  errorMessage.value = ''
  fileHash.value = null

  form.file = null

  isConfirmationShown.value = false
  isFailureShown.value = false
  isFormDisabled.value = false
}

const submit = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    fileHash.value = await getKeccak256FileHash(form.file as File)

    if (web3Provider?.chainId.value !== contractsInfo.timestamp.chainId) {
      try {
        await web3Provider?.switchChain(contractsInfo.timestamp.chainId)
      } catch (err) {
        if (!err?.error) throw new errors.ProviderUserRejectedRequest()
      }
    }

    await timestampContractInstance.value?.createStamp(fileHash.value)

    showConfirmation()
    emit('complete')
  } catch (err) {
    if (
      err?.code === ETHERS_ERROR_CODES.userRejectedRequest ||
      err?.constructor === errors.ProviderUserRejectedRequest
    ) {
      ErrorHandler.processWithoutFeedback(err)
    } else {
      if (timestampContractInstance.value && err?.error) {
        errorMessage.value = getErrorMessage(err?.error as EthProviderRpcError)
      } else {
        errorMessage.value = $t('doc-creation-form.error-default')
      }

      ErrorHandler.processWithoutFeedback(err)
      showFailure()
    }
  }
  isSubmitting.value = false
  enableForm()
}

Bus.on(Bus.eventList.openModal, reset)
</script>

<style lang="scss" scoped>
.doc-creation-form {
  width: toRem(523);
}

.doc-creation-form__button {
  width: 100%;
  height: toRem(48);
  margin-top: toRem(50);
}

.doc-creation-form__loader {
  margin-top: toRem(46);
}

.doc-creation-form__please-wait-msg {
  text-align: center;
  font-size: toRem(20);
  line-height: 1.17;
  margin: toRem(46) 0 toRem(30);
}

.doc-creation-form__confirmation-icon {
  height: toRem(130);
  width: toRem(130);
  margin: 0 auto toRem(25);
}

.doc-creation-form__success-msg {
  text-align: center;
  font-size: toRem(18);
  line-height: toRem(22);
  color: var(--col-alt);
  margin-bottom: toRem(30);
}

.doc-creation-form__note-error {
  margin-top: toRem(20);

  @include note-error;
}

.doc-creation-form__note-error-icon {
  height: toRem(27);
  width: toRem(27);
}
</style>
