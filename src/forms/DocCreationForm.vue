<template>
  <form class="doc-creation-form" @submit.prevent>
    <transition name="fade">
      <div v-if="isSubmitting">
        <spinner class="doc-creation-form__loader" />
        <p class="doc-creation-form__please-wait-msg">
          {{ $t('doc-creation-form.please-wait-msg') }}
        </p>
      </div>
      <div v-else-if="isConfirmationShown">
        <div class="doc-creation-form__note doc-creation-form__note--success">
          <icon
            class="doc-creation-form__note-icon"
            :name="$icons.checkCircle"
          />
          <p>
            {{ $t('doc-creation-form.success-msg') }}
          </p>
        </div>
        <textarea-field
          class="doc-creation-form__doc-hash"
          :model-value="fileHash || ''"
          is-copyable
          readonly
        />
        <app-button :preset="BUTTON_PRESETS.primary" @click="reset">
          {{ $t('doc-creation-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else-if="isFailureShown">
        <file-field :model-value="form.files" readonly />
        <div class="doc-creation-form__note doc-creation-form__note--error">
          <icon
            class="doc-creation-form__note-icon"
            :name="$icons.exclamationCircle"
          />
          <p v-if="errorMessage">
            {{ errorMessage }}
          </p>
        </div>
        <app-button :preset="BUTTON_PRESETS.primary" @click="reset">
          {{ $t('doc-creation-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else>
        <file-field v-model="form.files" />
        <checkbox-field
          v-show="form.files"
          class="doc-creation-form__checkbox"
          v-model="form.isSign"
          :label="$t('doc-creation-form.checkbox-is-sign')"
        />
        <div class="doc-creation-form__buttons">
          <app-button
            :preset="BUTTON_PRESETS.outlineBrittle"
            @click="emit('cancel')"
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
            @click="submit"
          >
            {{ $t('doc-creation-form.submit-button-text') }}
          </app-button>
        </div>
      </div>
    </transition>
  </form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { Icon, AppButton, Spinner } from '@/common'
import {
  useContext,
  useForm,
  useFormValidation,
  useTimestampContract,
} from '@/composables'
import { BUTTON_PRESETS, BUTTON_STATES, RPC_ERROR_MESSAGES } from '@/enums'
import { FileField, TextareaField, CheckboxField } from '@/fields'
import { ErrorHandler, getKeccak256FileHash } from '@/helpers'
import { required, maxValue } from '@/validators'
import { EthProviderRpcError, Keccak256Hash } from '@/types'
import { useWeb3ProvidersStore } from '@/store'

const emit = defineEmits<{
  (event: 'cancel'): void
}>()

const { $t, $config } = useContext()
const { provider: web3Provider } = useWeb3ProvidersStore()

const timestampContractInstance = useTimestampContract(
  $config.CTR_ADDRESS_TIMESTAMP,
)

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
  files: null as File[] | null,
  isSign: true,
})

const { isFieldsValid } = useFormValidation(form, {
  files: {
    0: {
      required,
      size: {
        required,
        maxValue: maxValue(2 * 1000 * 1000),
      },
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
    fileHash.value = await getKeccak256FileHash(form.files?.[0] as File)

    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    await timestampContractInstance.createStamp(fileHash.value, form.isSign)

    showConfirmation()
  } catch (err) {
    err?.error
      ? (errorMessage.value = getErrorMessage(
          err?.error as EthProviderRpcError,
        ))
      : (errorMessage.value = $t('doc-creation-form.error-default'))

    showFailure()
    ErrorHandler.processWithoutFeedback(err)
  }
  isSubmitting.value = false
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  fileHash.value = null

  form.files = null
  form.isSign = true

  isConfirmationShown.value = false
  isFailureShown.value = false
  isFormDisabled.value = false
}
</script>

<style lang="scss" scoped>
.doc-creation-form__checkbox {
  margin-top: toRem(24);

  @include respond-to('tablet') {
    margin-top: toRem(16);
  }
}

.doc-creation-form__buttons {
  display: flex;
  gap: toRem(16);
  margin-top: toRem(24);

  @include respond-to('tablet') {
    gap: toRem(8);
    margin-top: toRem(16);
  }
}

.doc-creation-form__loader {
  margin: toRem(24) 0;

  @include respond-to('tablet') {
    margin: toRem(16) 0;
  }
}

.doc-creation-form__please-wait-msg {
  text-align: center;

  @include h5;

  @include respond-to('tablet') {
    @include text-1;
  }
}

.doc-creation-form__note {
  &--success {
    @include note-success;
  }

  &--error {
    margin: toRem(24) 0;

    @include note-error;

    @include respond-to('tablet') {
      margin: toRem(16) 0;
    }
  }

  @include note;
}

.doc-creation-form__note-icon {
  height: toRem(24);
  width: toRem(24);
  flex-shrink: 0;
  color: var(--col-intense);

  @include respond-to('tablet') {
    height: toRem(20);
    width: toRem(20);
  }
}

.doc-creation-form__doc-hash {
  margin: toRem(24) 0;

  @include respond-to('tablet') {
    margin: toRem(16) 0;
  }
}

.fade-leave-from {
  display: none;
}

.fade-enter-active {
  animation: fade var(--transition-duration);
}

@keyframes fade {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
