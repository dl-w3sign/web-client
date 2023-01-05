<script lang="ts" setup>
import { AppBtn, Spinner, Icon } from '@/common'
import { useForm } from '@/composables'
import { BUTTON_PRESETS, BUTTON_STATES } from '@/enums'
import { FileField, TextField } from '@/fields'
import { getKeccak256FileHash, Bus, ErrorHandler } from '@/helpers'
import { Keccak256Hash } from '@/types'
import { ref } from 'vue'
import { ethers } from 'ethers'
import ContractArtifact from '../../src/abi/timestamp.json'

const emit = defineEmits<{
  (event: 'complete'): void
}>()

const file = ref<File | null>(null)
const fileHash = ref<Keccak256Hash | null>(null)
const signers = ref<string[]>([])
const signerAddress = ref<string | null>(null)
const isSignerInList = ref(false)

const {
  isFormDisabled,
  isSubmitting,
  isConfirmationShown,
  isFailureSnown,
  disableForm,
  enableForm,
  showConfirmation,
  showFailure,
  resetState,
} = useForm()

const reset = () => {
  file.value = null
  fileHash.value = null
  signers.value = []
  signerAddress.value = null
  isSignerInList.value = false
  resetState()
}

const submitVerification = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    signerAddress.value = await signer.getAddress()

    const timestampContract = new ethers.Contract(
      '0x540962EA33ba4da87dD97c93E1592844f1ce06D1',
      ContractArtifact,
      signer,
    )

    fileHash.value = await getKeccak256FileHash(file.value as File)
    const tx = await timestampContract.getStampsInfo([fileHash.value])

    if (tx[0].timestamp._hex === '0x00') {
      isSubmitting.value = false
      showFailure()
      return
    }

    signers.value = tx[0].signersInfo
    showConfirmation()
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
  }
  isSubmitting.value = false
  enableForm()
}

const submitSignature = async () => {
  disableForm()
  isSubmitting.value = true
  isConfirmationShown.value = false
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const timestampContract = new ethers.Contract(
      '0x540962EA33ba4da87dD97c93E1592844f1ce06D1',
      ContractArtifact,
      signer,
    )

    await timestampContract.sign(fileHash.value)
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
  }
  emit('complete')
  isSignerInList.value = false
  isSubmitting.value = false
  showConfirmation()
  enableForm()
}

Bus.on(Bus.eventList.openModal, reset)
</script>

<template>
  <form class="doc-verification-form">
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
      <text-field
        :model-value="fileHash || ''"
        :is-copied="true"
        :label="$t('doc-verification-form.document-hash-label')"
      />
      <h5 class="doc-verification-form__list-title">
        {{ $t('doc-verification-form.list-title') }}
      </h5>
      <text-field
        class="doc-verification-form__signer-address"
        v-for="signer in signers"
        :key="signer.signer"
        :model-value="signer.signer"
        :is-readonly="true"
        :right-icon="
          signer.signatureTimestamp._hex !== '0x00'
            ? $icons.checkCircle
            : undefined
        "
      />
      <app-btn
        v-if="isSignerInList"
        :class="[
          'doc-verification-form__button',
          'doc-verification-form__button--sign',
        ]"
        :preset="BUTTON_PRESETS.primary"
        @click.prevent="submitSignature"
      >
        {{ $t('doc-verification-form.sign-button-text') }}
      </app-btn>
    </div>
    <div v-else-if="isFailureSnown">
      <file-field v-model="file" :is-readonly="true" />
      <div class="doc-verification-form__note-error">
        <icon
          class="doc-verification-form__note-error-icon"
          :name="$icons.exclamationCircle"
        />
        <!-- This document has not been uploaded yet -->
      </div>
      <app-btn
        class="doc-verification-form__button"
        :preset="BUTTON_PRESETS.primary"
        @click.prevent="reset"
      >
        {{ $t('doc-verification-form.reset-button-text') }}
      </app-btn>
    </div>
    <div v-else>
      <file-field v-model="file" />
      <app-btn
        class="doc-verification-form__button"
        :preset="BUTTON_PRESETS.primary"
        :state="isFormDisabled ? BUTTON_STATES.notAllowed : undefined"
        @click.prevent="submitVerification"
      >
        {{ $t('doc-verification-form.submit-button-text') }}
      </app-btn>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.doc-verification-form {
  width: toRem(523);
}

.doc-verification-form__button {
  margin-top: toRem(50);
  height: toRem(48);

  &--sign {
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
  margin: toRem(32) 0 toRem(19);
}

.doc-verification-form__signer-address {
  &:not(:last-child) {
    margin-bottom: toRem(10);
  }
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
