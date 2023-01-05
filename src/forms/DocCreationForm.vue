<script lang="ts" setup>
import { ref, reactive, computed, inject } from 'vue'
import { Icon, AppBtn, Spinner } from '@/common'
import {
  useForm,
  useFormValidation,
  UseProvider,
  useTimestamp,
} from '@/composables'
import { APP_KEYS, BUTTON_PRESETS, BUTTON_STATES } from '@/enums'
import { FileField, TextField } from '@/fields'
import { ErrorHandler, getKeccak256FileHash, Bus } from '@/helpers'
import { Keccak256Hash } from '@/types'
import { required } from '@/validators'

type Wallet = {
  id: number
  address: string
}

type Form = {
  file: File | null
  wallets: Wallet[]
}

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)

const timestampContractInstance = computed(() => {
  if (web3Provider) {
    return useTimestamp(
      web3Provider,
      '0x540962EA33ba4da87dD97c93E1592844f1ce06D1',
    )
  }

  return undefined
})

const emit = defineEmits<{
  (event: 'complete'): void
}>()

const {
  isFormDisabled,
  isSubmitting,
  isConfirmationShown,
  isFailureSnown,
  showConfirmation,
  showFailure,
  disableForm,
  enableForm,
} = useForm()

const file = ref<File | null>(null)
const fileHash = ref<Keccak256Hash | null>(null)

let currentId = 0
const wallets = ref<Wallet[]>([{ id: currentId, address: '' }])
const addWallet = () => {
  wallets.value.push({
    id: ++currentId,
    address: '',
  })

  form.wallets.push({
    id: ++currentId,
    address: '',
  })
}

const form: Form = reactive({
  file: null,
  fileHash: null,
  wallets: [{ id: currentId, address: '' }],
})

const { isFormValid } = useFormValidation(form, {
  file: { required },
  wallets: { required },
})

const reset = () => {
  file.value = null
  fileHash.value = null
  wallets.value = [{ id: ++currentId, address: '' }]

  form.file = null
  form.wallets = [{ id: ++currentId, address: '' }]

  isConfirmationShown.value = false
  isFailureSnown.value = false
  isFormDisabled.value = false
}

const submit = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    fileHash.value = await getKeccak256FileHash(form.file as File)
    const addresses = form.wallets.map(wallet => wallet.address)
    await timestampContractInstance.value?.createStamp(
      fileHash.value,
      addresses,
    )
    showConfirmation()
    emit('complete')
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
    showFailure()
  }
  isSubmitting.value = false
  enableForm()
}

Bus.on(Bus.eventList.openModal, reset)
</script>

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
    <div v-else-if="isFailureSnown">
      <file-field v-model="form.file" :is-readonly="true" />
      <div class="doc-creation-form__note-error">
        <icon
          class="doc-creation-form__note-error-icon"
          :name="$icons.exclamationCircle"
        />
        <!-- This document has... -->
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
      <file-field v-model="form.file" />
      <div class="doc-creation-form__wallets">
        <text-field
          class="doc-creation-form__wallet-address-input"
          v-for="wallet in form.wallets"
          v-model="wallet.address"
          :key="wallet.id"
          :label="$t('doc-creation-form.wallet-input-label')"
          :placeholder="$t('doc-creation-form.wallet-input-placeholder')"
        />
        <app-btn
          class="doc-creation-form__add-wallet-address-button"
          :preset="BUTTON_PRESETS.outlinePrimary"
          @click.prevent="addWallet"
        >
          <icon class="doc-creation-form__plus-icon" :name="$icons.plus" />
        </app-btn>
      </div>
      <app-btn
        class="doc-creation-form__button"
        :preset="BUTTON_PRESETS.primary"
        :state="isFormDisabled ? BUTTON_STATES.notAllowed : undefined"
        @click.prevent="submit"
      >
        {{ $t('doc-creation-form.submit-button-text') }}
      </app-btn>
    </div>
    <div>{{ isFormValid() }}</div>
  </form>
</template>

<style lang="scss" scoped>
.doc-creation-form {
  width: toRem(523);
}

.doc-creation-form__wallets {
  margin-top: toRem(24);
  display: grid;
  grid-template-columns: 1fr toRem(42);
  align-items: flex-end;
  gap: toRem(16);
}

.doc-creation-form__wallet-address-input {
  grid-column: 1;

  &:not(:first-child) {
    margin-top: toRem(12);
  }
}

.doc-creation-form__add-wallet-address-button {
  box-sizing: border-box;
  height: toRem(42);
  width: toRem(42);
  flex-shrink: 0;
}

.doc-creation-form__plus-icon {
  height: toRem(14);
  width: toRem(14);
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

.fade-enter-active {
  animation: fade-in 0.25s;
}

.fade-leave-active {
  animation: fade-in 0.25s reverse;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
