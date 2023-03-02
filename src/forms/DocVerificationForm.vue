<template>
  <form
    class="doc-verification-form"
    :class="{
      'doc-verification-form--confirmation-hidden': !isConfirmationShown,
    }"
    @submit.prevent
  >
    <transition name="fade">
      <div v-if="isSubmitting">
        <spinner class="doc-verification-form__loader" />
        <h5 class="doc-verification-form__please-wait-msg">
          {{ $t('doc-verification-form.please-wait-msg') }}
        </h5>
      </div>
      <div v-else-if="isConfirmationShown">
        <div class="doc-verification-form__doc-info">
          <h5 class="doc-verification-form__doc-hash-title">
            {{ $t('doc-verification-form.document-hash-title') }}
          </h5>
          <div
            :class="[
              'doc-verification-form__timestamp-info',
              'doc-verification-form__timestamp-info--top',
            ]"
          >
            <p class="doc-verification-form__timestamp-title">
              {{ $t('doc-verification-form.doc-timestamp-title') }}
            </p>
            <p class="doc-verification-form__timestamp">
              {{
                formatTimestamp(
                  timestampContractInstance?.docTimestamp.value || 0,
                )
              }}
            </p>
          </div>
        </div>
        <textarea-field :model-value="fileHash || ''" is-copyable readonly />
        <div
          :class="[
            'doc-verification-form__note',
            'doc-verification-form__note--success',
          ]"
        >
          <icon
            class="doc-verification-form__note-icon"
            :name="$icons.checkCircle"
          />
          <p>
            {{ $t('doc-verification-form.success-msg') }}
          </p>
        </div>
        <div v-if="timestampContractInstance?.signers.value.length">
          <h4 class="doc-verification-form__list-title">
            {{ $t('doc-verification-form.list-title') }}
          </h4>
          <div
            v-for="signer in timestampContractInstance?.signers.value"
            :key="signer.address"
          >
            <textarea-field
              class="doc-verification-form__address"
              :model-value="signer.address"
              :right-icon-name="$icons.checkCircle"
              readonly
            />
            <div class="doc-verification-form__timestamp-info">
              <p
                class="doc-verification-form__timestamp-title"
                v-if="signer.signatureTimestamp"
              >
                {{ $t('doc-verification-form.signature-timestamp-title') }}
              </p>
              <p class="doc-verification-form__timestamp">
                {{ formatTimestamp(signer.signatureTimestamp || 0) }}
              </p>
            </div>
          </div>
        </div>
        <app-button
          :class="[
            'doc-verification-form__button',
            'doc-verification-form__button--signer',
          ]"
          preset="primary"
          @click="signOrExit"
        >
          {{
            isSignedByCurrentSigner || isSigned
              ? $t('doc-verification-form.exit-button-text')
              : $t('doc-verification-form.sign-button-text')
          }}
        </app-button>
      </div>
      <div v-else-if="isFailureShown">
        <file-field :model-value="form.files" readonly />
        <div
          class="doc-verification-form__note doc-verification-form__note--error"
        >
          <icon
            class="doc-verification-form__note-icon"
            :name="$icons.exclamationCircle"
          />
          {{ errorMessage }}
        </div>
        <app-button preset="primary" @click="reset">
          {{ $t('doc-verification-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else>
        <file-field v-model="form.files" />
        <div class="doc-verification-form__buttons">
          <app-button preset="outline-brittle" @click="emit('cancel')">
            {{ $t('doc-verification-form.cancel-button-text') }}
          </app-button>
          <app-button
            preset="primary"
            :disabled="isFormDisabled || !isFieldsValid"
            @click="submitVerification"
          >
            {{ $t('doc-verification-form.submit-button-text') }}
          </app-button>
        </div>
      </div>
    </transition>
  </form>
</template>

<script lang="ts" setup>
import { AppButton, Spinner, Icon } from '@/common'
import {
  useForm,
  useFormValidation,
  useTimestampContract,
  useContext,
} from '@/composables'
import { TIMEZONES } from '@/enums'
import { FileField, TextareaField } from '@/fields'
import { getKeccak256FileHash, Bus, ErrorHandler } from '@/helpers'
import { Keccak256Hash } from '@/types'
import { required, maxValue } from '@/validators'
import { useWeb3ProvidersStore } from '@/store'
import { ref, reactive, computed } from 'vue'
import { Time } from '@distributedlab/utils'

const emit = defineEmits<{
  (event: 'cancel'): void
}>()

const form = reactive({
  files: null as File[] | null,
})

const { $t, $config } = useContext()
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
const { provider: web3Provider } = useWeb3ProvidersStore()
const timestampContractInstance = useTimestampContract(
  $config.CTR_ADDRESS_TIMESTAMP,
)

const {
  isFormDisabled,
  isSubmitting,
  isConfirmationShown,
  isFailureShown,
  disableForm,
  enableForm,
  showConfirmation,
  showFailure,
  resetState,
} = useForm()

const fileHash = ref<Keccak256Hash | null>(null)
const errorMessage = ref('')
const isSigned = ref(false)

const isSignedByCurrentSigner = computed(
  () =>
    !!timestampContractInstance.signers.value.find(
      signer => signer.address === web3Provider.selectedAddress,
    ),
)

const formatTimestamp = (timestamp: number): string => {
  return new Time(timestamp, 'X').tz(TIMEZONES.CET).format('hh:mm A YYYY [CET]')
}

const submitVerification = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    fileHash.value = await getKeccak256FileHash(form.files?.[0] as File)

    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    await timestampContractInstance.getStampInfo(fileHash.value)
    if (timestampContractInstance.docTimestamp.value === 0)
      throw new Error('Document not found')

    showConfirmation()
  } catch (err) {
    timestampContractInstance.docTimestamp.value === 0
      ? (errorMessage.value = $t('doc-verification-form.error-doc-not-found'))
      : (errorMessage.value = $t('doc-verification-form.error-default'))

    ErrorHandler.processWithoutFeedback(err)
    showFailure()
  }
  isSubmitting.value = false
  enableForm()
}

const signOrExit = async () => {
  if (isSignedByCurrentSigner.value || isSigned.value) {
    emit('cancel')
    return
  }

  disableForm()
  isSubmitting.value = true
  isConfirmationShown.value = false
  try {
    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    await timestampContractInstance.sign(fileHash.value as Keccak256Hash)

    isSigned.value = true
    Bus.success($t('doc-verification-form.sign-success-message'))
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
  }
  isSubmitting.value = false
  showConfirmation()
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  form.files = null
  fileHash.value = null
  isSigned.value = false
  resetState()
}
</script>

<style lang="scss" scoped>
.doc-verification-form {
  &--confirmation-hidden {
    @include respond-to(tablet) {
      margin-top: toRem(16);
    }
  }
}

.doc-verification-form__buttons {
  display: flex;
  gap: toRem(16);
  margin-top: toRem(24);

  @include respond-to(tablet) {
    gap: toRem(8);
    margin-top: toRem(16);
  }
}

.doc-verification-form__loader {
  margin: toRem(24) 0;

  @include respond-to(tablet) {
    margin: toRem(16) 0;
  }
}

.doc-verification-form__please-wait-msg {
  text-align: center;
}

.doc-verification-form__doc-info {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: toRem(8);

  @include respond-to(tablet) {
    margin-bottom: toRem(4);
  }
}

.doc-verification-form__doc-hash-title {
  @include body-large;

  @include respond-to(tablet) {
    margin-bottom: toRem(8);
  }
}

.doc-verification-form__address {
  fill: var(--col-success);
}

.doc-verification-form__timestamp-info {
  display: flex;
  justify-content: end;
  gap: toRem(11);
  margin: toRem(8) auto toRem(24);

  &--top {
    margin: 0 0 0 auto;
    align-self: flex-end;
  }

  @include respond-to(tablet) {
    gap: toRem(4);

    &:not(.doc-verification-form__timestamp-info--top) {
      margin-bottom: toRem(12);
    }
  }

  @include body-medium;
}

.doc-verification-form__timestamp-title {
  color: var(--col-fine);
}

.doc-verification-form__timestamp {
  color: var(--col-primary);
}

.doc-verification-form__list-title {
  margin-bottom: toRem(8);

  @include respond-to(tablet) {
    @include body-large;
  }
}

.doc-verification-form__note {
  margin: toRem(24) 0;

  &--success {
    @include note-success;

    @include respond-to(tablet) {
      margin: toRem(12) 0;
    }
  }

  &--error {
    @include note-error;

    @include respond-to(tablet) {
      margin: toRem(16) 0;
    }
  }

  @include note;
}

.doc-verification-form__note-icon {
  height: toRem(24);
  width: toRem(24);
  flex-shrink: 0;
  color: var(--col-intense);

  @include respond-to(tablet) {
    height: toRem(20);
    width: toRem(20);
  }
}

.fade-leave-from {
  display: none;
}

.fade-enter-active {
  animation: fade ease-out var(--transition-duration-fast);
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
