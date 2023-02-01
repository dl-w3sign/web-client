<template>
  <form class="doc-verification-form" @submit.prevent>
    <file-field
      v-if="!isSubmitting && !isConfirmationShown"
      v-model="form.file"
      :is-readonly="isFailureShown"
    />
    <div v-if="isSubmitting" class="doc-verification-form__loader">
      <spinner />
      <p class="doc-verification-form__please-wait-msg">
        {{ $t('doc-verification-form.please-wait-msg') }}
      </p>
    </div>
    <div v-else-if="isConfirmationShown">
      <icon
        class="doc-verification-form__confirmation-icon"
        :name="$icons.confirmation"
      />
      <p class="doc-verification-form__success-msg">
        {{ $t('doc-verification-form.success-msg') }}
      </p>
      <input-field
        :model-value="fileHash || ''"
        :label="$t('doc-verification-form.document-hash-label')"
        is-copied
      />
      <div class="doc-verification-form__timestamp-info">
        <p class="doc-verification-form__timestamp-title">
          {{ $t('doc-verification-form.doc-timestamp-title') }}
        </p>
        <p class="doc-verification-form__timestamp">
          {{
            formatTimestamp(timestampContractInstance?.docTimestamp.value || 0)
          }}
        </p>
      </div>
      <div v-if="timestampContractInstance?.signers.value.length">
        <h5 class="doc-verification-form__list-title">
          {{ $t('doc-verification-form.list-title') }}
        </h5>
        <div
          class="doc-verification-form__signer"
          v-for="signer in timestampContractInstance?.signers.value"
          :key="signer.address"
        >
          <input-field
            :model-value="signer.address"
            :right-icon="
              signer.signatureTimestamp ? $icons.checkCircle : undefined
            "
            is-readonly
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
        v-if="!isSignedByCurrentSigner && !isComplete"
        :class="[
          'doc-verification-form__button',
          'doc-verification-form__button--signer',
        ]"
        :preset="BUTTON_PRESETS.primary"
        @click="submitSignature"
      >
        {{ $t('doc-verification-form.sign-button-text') }}
      </app-button>
    </div>
    <div v-else-if="isFailureShown">
      <div class="doc-verification-form__note-error">
        <icon
          class="doc-verification-form__note-error-icon"
          :name="$icons.exclamationCircle"
        />
        {{ errorMessage }}
      </div>
      <app-button
        class="doc-verification-form__button"
        :preset="BUTTON_PRESETS.primary"
        @click="reset"
      >
        {{ $t('doc-verification-form.reset-button-text') }}
      </app-button>
    </div>
    <div v-else>
      <app-button
        class="doc-verification-form__button"
        :preset="BUTTON_PRESETS.primary"
        :state="
          isFormDisabled || !isFormValid()
            ? BUTTON_STATES.noneEvents
            : undefined
        "
        @click="submitVerification"
      >
        {{ $t('doc-verification-form.submit-button-text') }}
      </app-button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { AppButton, Spinner, Icon } from '@/common'
import {
  useForm,
  useFormValidation,
  useTimestampContract,
  useContext,
  web3Provider,
} from '@/composables'
import { BUTTON_PRESETS, BUTTON_STATES } from '@/enums'
import { FileField, InputField } from '@/fields'
import { getKeccak256FileHash, Bus, ErrorHandler } from '@/helpers'
import { Keccak256Hash } from '@/types'
import { required, maxValue } from '@/validators'
import { DateUtil } from '@/utils'
import { ref, reactive, computed } from 'vue'
import { errors } from '@/errors'

const emit = defineEmits<{
  (event: 'complete'): void
}>()

const form = reactive({
  file: null as File | null,
})

const { $t, $config } = useContext()
const { isFormValid } = useFormValidation(form, {
  file: {
    required,
    size: {
      required,
      maxValue: maxValue(10 * 1000 * 1000),
    },
  },
})

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
const isComplete = ref(false)

const timestampContractInstance = computed(() => {
  return web3Provider
    ? useTimestampContract(web3Provider, $config.CTR_ADDRESS_TIMESTAMP)
    : undefined
})
const isSignedByCurrentSigner = computed(() =>
  timestampContractInstance.value?.signers.value.find(
    signer => signer.address === web3Provider?.selectedAddress.value,
  )
    ? true
    : false,
)

const formatTimestamp = (timestamp: number): string => {
  return timestamp
    ? DateUtil.format(timestamp, 'X', 'MMM DD, YYYY [at] HH:mm')
    : $t('doc-verification-form.message-instead-timestamp')
}

const submitVerification = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    fileHash.value = await getKeccak256FileHash(form.file as File)

    if (web3Provider?.chainId !== $config.CHAIN_ID)
      await web3Provider?.switchChain($config.CHAIN_ID)

    await timestampContractInstance.value?.getStampInfo(fileHash.value)
    if (timestampContractInstance?.value?.docTimestamp.value === 0)
      throw new Error('Document not found')

    showConfirmation()
    if (isSignedByCurrentSigner.value) {
      emit('complete')
      isComplete.value = true
    }
  } catch (err) {
    if (timestampContractInstance?.value?.docTimestamp.value === 0) {
      errorMessage.value = $t('doc-verification-form.error-doc-not-found')
    } else {
      errorMessage.value = $t('doc-verification-form.error-default')
    }

    if (err?.constructor === errors.ProviderUserRejectedRequest) {
      ErrorHandler.processWithoutFeedback(err)
    } else {
      ErrorHandler.processWithoutFeedback(err)
      showFailure()
    }
  }
  isSubmitting.value = false
  enableForm()
}

const submitSignature = async () => {
  disableForm()
  isSubmitting.value = true
  isConfirmationShown.value = false
  try {
    if (web3Provider?.chainId !== $config.CHAIN_ID)
      await web3Provider?.switchChain($config.CHAIN_ID)

    await timestampContractInstance.value?.sign(fileHash.value as Keccak256Hash)

    emit('complete')
    isComplete.value = true
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
  form.file = null
  fileHash.value = null
  isComplete.value = false
  resetState()
}

Bus.on(Bus.eventList.openModal, reset)
</script>

<style lang="scss" scoped>
.doc-verification-form {
  min-width: toRem(523);
}

.doc-verification-form__button {
  margin-top: toRem(50);
  height: toRem(48);

  &--signer {
    margin-top: toRem(40);
  }
}

.doc-verification-form__loader {
  margin-top: toRem(46);
}

.doc-verification-form__please-wait-msg {
  text-align: center;
  font-size: toRem(20);
  line-height: 1.17;
  margin: toRem(46) 0 toRem(30);
}

.doc-verification-form__confirmation-icon {
  height: toRem(130);
  width: toRem(130);
  margin: 0 auto toRem(25);
}

.doc-verification-form__success-msg {
  text-align: center;
  font-size: toRem(18);
  line-height: toRem(22);
  color: var(--col-alt);
  margin-bottom: toRem(30);
}

.doc-verification-form__list-title {
  font-size: toRem(16);
  line-height: 1.2;
  color: var(--col-alt);
  margin: toRem(42) 0 toRem(20);
}

.doc-verification-form__signer {
  &:not(:last-child) {
    margin-bottom: toRem(10);
  }
}

.doc-verification-form__timestamp-info {
  display: flex;
  justify-content: end;
  gap: toRem(8);
  margin: toRem(10) auto 0;
  font-size: toRem(14);
  line-height: 1.2;
}

.doc-verification-form__timestamp-title {
  color: var(--col-neutral);
}

.doc-verification-form__timestamp {
  color: var(--col-glossy);
  font-weight: 600;
}

.doc-verification-form__note-error {
  margin-top: toRem(20);

  @include note-error;
}

.doc-verification-form__note-error-icon {
  height: toRem(27);
  width: toRem(27);
}
</style>
