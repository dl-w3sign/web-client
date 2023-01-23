<template>
  <form class="doc-creation-form">
    <div v-if="isSubmitting">
      <spinner class="doc-creation-form__loader" />
      <p class="doc-creation-form__please-wait-msg">
        {{ $t('doc-creation-form.please-wait-msg') }}
      </p>
    </div>
    <div v-else-if="isConfirmationShown">
      <div class="doc-creation-form__note doc-creation-form__note--success">
        <icon class="doc-creation-form__note-icon" :name="$icons.checkCircle" />
        <p>
          {{ $t('doc-creation-form.success-msg') }}
        </p>
      </div>
      <input-field
        class="doc-creation-form__doc-hash"
        :model-value="fileHash || ''"
        :is-copied="true"
      />
      <app-button
        class="doc-creation-form__button"
        :preset="BUTTON_PRESETS.primary"
        @click.prevent="reset"
      >
        {{ $t('doc-creation-form.reset-button-text') }}
      </app-button>
    </div>
    <div v-else-if="isFailureShown">
      <file-field v-model="form.file" :is-readonly="true" />
      <div class="doc-creation-form__note doc-creation-form__note--error">
        <icon
          class="doc-creation-form__note-icon"
          :name="$icons.exclamationCircle"
        />
        <p v-if="errorMessage">
          {{ errorMessage }}
        </p>
      </div>
      <app-button :preset="BUTTON_PRESETS.primary" @click.prevent="reset">
        {{ $t('doc-creation-form.reset-button-text') }}
      </app-button>
    </div>
    <div v-else>
      <file-field v-model="form.file" />
      <checkbox-field
        v-show="form.file"
        class="doc-creation-form__checkbox"
        v-model="form.isSign"
        :label="$t('doc-creation-form.checkbox-is-sign')"
      />
      <div class="doc-creation-form__buttons">
        <app-button
          :preset="BUTTON_PRESETS.outlineBrittle"
          @click.prevent="cancel"
        >
          {{ $t('doc-creation-form.cancel-button-text') }}
        </app-button>
        <app-button
          :preset="BUTTON_PRESETS.primary"
          :state="
            isFormDisabled || !isFieldsValid
              ? BUTTON_STATES.noneEvents
              : undefined
          "
          @click.prevent="submit"
        >
          {{ $t('doc-creation-form.submit-button-text') }}
        </app-button>
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, inject } from 'vue'
import { Icon, AppButton, Spinner } from '@/common'
import {
  useContext,
  useForm,
  useFormValidation,
  UseProvider,
  useTimestampContract,
} from '@/composables'
import {
  APP_KEYS,
  BUTTON_PRESETS,
  BUTTON_STATES,
  RPC_ERROR_MESSAGES,
} from '@/enums'
import { FileField, InputField, CheckboxField } from '@/fields'
import { ErrorHandler, getKeccak256FileHash, Bus } from '@/helpers'
import { required, maxValue } from '@/validators'
import { EthProviderRpcError, Keccak256Hash } from '@/types'
import { errors } from '@/errors'

withDefaults(
  defineProps<{
    cancel?: () => void
  }>(),
  {
    cancel: undefined,
  },
)

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)
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
  } catch (err) {
    if (
      err?.constructor === errors.ProviderUserRejectedRequest ||
      err?.code === errors.ACTION_REJECTED
    ) {
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
.doc-creation-form__checkbox {
  margin-top: toRem(24);
}

.doc-creation-form__buttons {
  display: flex;
  gap: toRem(16);
  margin-top: toRem(24);
}

.doc-creation-form__loader {
  margin: toRem(24) 0;
}

.doc-creation-form__please-wait-msg {
  text-align: center;
  font-size: toRem(18);
  line-height: toRem(24);
}

.doc-creation-form__note {
  &--success {
    @include note-success;
  }

  &--error {
    margin: toRem(24) 0;

    @include note-error;
  }

  @include note;
}

.doc-creation-form__note-icon {
  height: toRem(24);
  width: toRem(24);
  flex-shrink: 0;
}

.doc-creation-form__doc-hash {
  margin: toRem(24) 0;
}
</style>
