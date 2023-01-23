<template>
  <form class="doc-verification-form">
    <div v-if="isSubmitting">
      <spinner class="doc-verification-form__loader" />
      <p class="doc-verification-form__please-wait-msg">
        {{ $t('doc-verification-form.please-wait-msg') }}
      </p>
    </div>
    <div v-else-if="isConfirmationShown">
      <div class="doc-verification-form__doc-info">
        <input-field
          :model-value="fileHash || ''"
          :is-copied="true"
          :label="$t('doc-verification-form.document-hash-label')"
        />
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
      <div
        class="doc-verification-form__note doc-verification-form__note--success"
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
          <input-field
            class="doc-verification-form__address"
            :model-value="signer.address"
            :is-readonly="true"
            :right-icon="$icons.checkCircle"
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
        :preset="BUTTON_PRESETS.primary"
        @click.prevent="signOrExit"
      >
        {{
          isSignedByCurrentSigner || isSigned
            ? $t('doc-verification-form.exit-button-text')
            : $t('doc-verification-form.sign-button-text')
        }}
      </app-button>
    </div>
    <div v-else-if="isFailureShown">
      <file-field :model-value="form.file" :is-readonly="true" />
      <div
        class="doc-verification-form__note doc-verification-form__note--error"
      >
        <icon
          class="doc-verification-form__note-icon"
          :name="$icons.exclamationCircle"
        />
        {{ errorMessage }}
      </div>
      <app-button :preset="BUTTON_PRESETS.primary" @click.prevent="reset">
        {{ $t('doc-verification-form.reset-button-text') }}
      </app-button>
    </div>
    <div v-else>
      <file-field v-model="form.file" />
      <div class="doc-verification-form__buttons">
        <app-button
          :preset="BUTTON_PRESETS.outlineBrittle"
          @click.prevent="cancel"
        >
          {{ $t('doc-verification-form.cancel-button-text') }}
        </app-button>
        <app-button
          :preset="BUTTON_PRESETS.primary"
          :state="
            isFormDisabled || !isFieldsValid
              ? BUTTON_STATES.noneEvents
              : undefined
          "
          @click.prevent="submitVerification"
        >
          {{ $t('doc-verification-form.submit-button-text') }}
        </app-button>
      </div>
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
} from '@/composables'
import { APP_KEYS, BUTTON_PRESETS, BUTTON_STATES } from '@/enums'
import { FileField, InputField } from '@/fields'
import { getKeccak256FileHash, Bus, ErrorHandler } from '@/helpers'
import { Keccak256Hash, UseProvider } from '@/types'
import { required, maxValue } from '@/validators'
import { DateUtil } from '@/utils'
import { ref, reactive, inject, computed } from 'vue'
import { errors } from '@/errors'

const props = withDefaults(
  defineProps<{
    cancel?: () => void
  }>(),
  {
    cancel: undefined,
  },
)

const form = reactive({
  file: null as File | null,
})

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)

const { $t, $config } = useContext()
const { isFieldsValid } = useFormValidation(form, {
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
const isSigned = ref(false)

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
  return DateUtil.format(timestamp, 'X', 'MMM DD, YYYY [at] HH.mm')
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

const signOrExit = async () => {
  if (isSignedByCurrentSigner.value || isSigned.value) {
    props.cancel()
    return
  }

  disableForm()
  isSubmitting.value = true
  isConfirmationShown.value = false
  try {
    if (web3Provider?.chainId !== $config.CHAIN_ID)
      await web3Provider?.switchChain($config.CHAIN_ID)

    await timestampContractInstance.value?.sign(fileHash.value as Keccak256Hash)

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
  form.file = null
  fileHash.value = null
  isSigned.value = false
  resetState()
}

Bus.on(Bus.eventList.openModal, reset)
</script>

<style lang="scss" scoped>
.doc-verification-form__buttons {
  display: flex;
  gap: toRem(16);
  margin-top: toRem(24);
}

.doc-verification-form__loader {
  margin: toRem(24) 0;
}

.doc-verification-form__please-wait-msg {
  text-align: center;
  font-size: toRem(18);
  line-height: toRem(24);
}

.doc-verification-form__doc-info {
  position: relative;
}

.doc-verification-form__address {
  fill: var(--col-success);
}

.doc-verification-form__timestamp-info {
  display: flex;
  justify-content: end;
  gap: toRem(11);
  margin: toRem(8) auto toRem(24);
  font-size: toRem(14);
  line-height: 1.2;

  &--top {
    position: absolute;
    top: toRem(4);
    right: 0;
    margin: 0;
  }
}

.doc-verification-form__timestamp-title {
  font-size: toRem(14);
  line-height: toRem(20);
  color: var(--col-fine);
}

.doc-verification-form__timestamp {
  font-size: toRem(14);
  line-height: toRem(20);
  font-weight: 400;
  color: var(--col-primary);
}

.doc-verification-form__list-title {
  margin-bottom: toRem(8);
}

.doc-verification-form__note {
  margin: toRem(24) 0;

  &--success {
    @include note-success;
  }

  &--error {
    @include note-error;
  }

  @include note;
}

.doc-verification-form__note-icon {
  height: toRem(24);
  width: toRem(24);
  flex-shrink: 0;
}
</style>
