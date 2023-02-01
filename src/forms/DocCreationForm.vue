<template>
  <form class="doc-creation-form" @submit.prevent>
    <file-field
      v-if="!isSubmitting && !isConfirmationShown"
      v-model="form.file"
      :is-readonly="isFailureShown"
    />
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
      <input-field
        :model-value="fileHash || ''"
        :label="$t('doc-creation-form.document-hash-label')"
        is-copied
      />
    </div>
    <div v-else-if="isFailureShown">
      <div class="doc-creation-form__note-error">
        <icon
          class="doc-creation-form__note-error-icon"
          :name="$icons.exclamationCircle"
        />
        <p v-if="errorMessage">
          {{ errorMessage }}
        </p>
      </div>
      <app-button
        class="doc-creation-form__button"
        :preset="BUTTON_PRESETS.primary"
        @click="reset"
      >
        {{ $t('doc-creation-form.reset-button-text') }}
      </app-button>
    </div>
    <div v-else>
      <checkbox-field
        class="doc-creation-form__checkbox"
        v-model="form.isSign"
        :label="$t('doc-creation-form.checkbox-is-sign')"
      />
      <app-button
        class="doc-creation-form__button"
        :preset="BUTTON_PRESETS.primary"
        :state="
          isFormDisabled || !isFieldsValid
            ? BUTTON_STATES.noneEvents
            : undefined
        "
        @click="submit"
      >
        {{ $t('doc-creation-form.submit-button-text') }}
      </app-button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { Icon, AppButton, Spinner } from '@/common'
import {
  useContext,
  useForm,
  useFormValidation,
  useTimestampContract,
  web3Provider,
} from '@/composables'
import { BUTTON_PRESETS, BUTTON_STATES, RPC_ERROR_MESSAGES } from '@/enums'
import { FileField, InputField, CheckboxField } from '@/fields'
import { ErrorHandler, getKeccak256FileHash, Bus } from '@/helpers'
import { required, maxValue } from '@/validators'
import { EthProviderRpcError, Keccak256Hash } from '@/types'
import { errors } from '@/errors'

const emit = defineEmits<{
  (event: 'complete'): void
}>()

const { $t, $config } = useContext()

const timestampContractInstance = computed(() => {
  return web3Provider
    ? useTimestampContract(web3Provider, $config.CTR_ADDRESS_TIMESTAMP)
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

const fileHash = ref<Keccak256Hash | null>(null)
const errorMessage = ref('')

const form = reactive({
  file: null as File | null,
  isSign: true,
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
    case RPC_ERROR_MESSAGES.hashCollision:
      return $t('doc-creation-form.error-hash-collision')
    default:
      return $t('doc-creation-form.error-default')
  }
}

const submit = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    fileHash.value = await getKeccak256FileHash(form.file as File)

    if (web3Provider?.chainId.value !== $config.CHAIN_ID)
      await web3Provider?.switchChain($config.CHAIN_ID)

    await timestampContractInstance.value?.createStamp(
      fileHash.value,
      form.isSign,
    )

    showConfirmation()
    emit('complete')
  } catch (err) {
    if (err?.constructor === errors.ProviderUserRejectedRequest) {
      ErrorHandler.processWithoutFeedback(err)
    } else {
      if (err?.error) {
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

const reset = () => {
  errorMessage.value = ''
  fileHash.value = null

  form.file = null
  form.isSign = true

  isConfirmationShown.value = false
  isFailureShown.value = false
  isFormDisabled.value = false
}

Bus.on(Bus.eventList.openModal, reset)
</script>

<style lang="scss" scoped>
.doc-creation-form {
  width: toRem(523);
}

.doc-creation-form__checkbox {
  margin-top: toRem(20);
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
