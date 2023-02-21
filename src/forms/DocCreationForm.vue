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
          :model-value="publicFileHash as string || ''"
          is-copied
          readonly
        />
        <app-button :preset="BUTTON_PRESETS.primary" @click="reset">
          {{ $t('doc-creation-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else-if="isFailureShown">
        <file-field :model-value="form.file" is-readonly />
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
        <file-field v-model="form.file" />
        <transition name="fade">
          <div v-show="form.file" class="doc-creation-form__container">
            <checkbox-field
              v-model="form.isSign"
              :label="$t('doc-creation-form.checkbox-is-sign')"
            />
            <checkbox-field
              v-model="form.isIndicatingAddresses"
              :label="$t('doc-creation-form.checkbox-is-indicating-addresses')"
            />
          </div>
        </transition>
        <transition name="fade">
          <div v-show="form.file && form.isIndicatingAddresses">
            <h4 class="doc-creation-form__wallets-addresses-title">
              {{ $t('doc-creation-form.wallets-addresses-title') }}
            </h4>
            <input-field
              :placeholder="$t('doc-creation-form.wallet-address-placeholder')"
              :model-value="walletAddress"
              @update:model-value="addIndicatedAddress"
            />
            <textarea-field
              class="doc-creation-form__wallet-address"
              v-for="address in form.indicatedAddresses"
              :key="address"
              :model-value="address"
              @remove="removeIndicatedAddress(address)"
              is-removable
              readonly
            />
          </div>
        </transition>
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
import { ref, reactive, computed } from 'vue'
import { Icon, AppButton, Spinner } from '@/common'
import {
  useContext,
  useForm,
  useFormValidation,
  useTimestampContract,
  usePoseidonHashContract,
  UseTimestampContract,
  UsePoseidonHashContract,
} from '@/composables'
import { BUTTON_PRESETS, BUTTON_STATES, RPC_ERROR_MESSAGES } from '@/enums'
import { FileField, TextareaField, CheckboxField, InputField } from '@/fields'
import {
  ErrorHandler,
  getKeccak256FileHash,
  isAddress,
  generateZKPPointsStructAndPublicHash,
  getTimestampContractAddressByChainId,
  getPoseidonHashContractAddressByChainId,
} from '@/helpers'
import { required, maxValue, requiredIf } from '@/validators'
import {
  EthProviderRpcError,
  Keccak256Hash,
  PoseidonHash,
  BytesLike,
  ChainId,
} from '@/types'
import { useWeb3ProvidersStore } from '@/store'

const emit = defineEmits<{
  (event: 'cancel'): void
}>()

const { $t } = useContext()
const web3Store = useWeb3ProvidersStore()

const timestampContractInstance = computed<UseTimestampContract>(() =>
  useTimestampContract(
    getTimestampContractAddressByChainId(web3Store.provider.chainId as ChainId),
  ),
)
const poseidonHashContractInstance = computed<UsePoseidonHashContract>(() =>
  usePoseidonHashContract(
    getPoseidonHashContractAddressByChainId(
      web3Store.provider.chainId as ChainId,
    ),
  ),
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

const publicFileHash = ref<BytesLike | null>(null)
const walletAddress = ref('')
const errorMessage = ref('')

const form = reactive({
  file: null as File | null,
  isSign: true,
  isIndicatingAddresses: false,
  indicatedAddresses: [] as string[],
})

const { isFieldsValid } = useFormValidation(form, {
  file: {
    required,
    size: {
      required,
      maxValue: maxValue(10 * 1000 * 1000),
    },
  },
  indicatedAddresses: {
    required: requiredIf(() => form.isIndicatingAddresses),
    // TODO: simple string[] array validation
  },
})

const addIndicatedAddress = (address: string) => {
  if (isAddress(address) && !form.indicatedAddresses.includes(address)) {
    form.indicatedAddresses.unshift(address)
    setTimeout(() => (walletAddress.value = '')) // TODO: to discuss
  }

  walletAddress.value = address
}

const removeIndicatedAddress = (address: string) => {
  form.indicatedAddresses = form.indicatedAddresses.filter(
    indicatedAddress => indicatedAddress !== address,
  )
}

const getErrorMessage = (error: EthProviderRpcError): string => {
  switch (error.message) {
    case RPC_ERROR_MESSAGES.hashCollision:
      return $t('doc-creation-form.error-hash-collision')
    default:
      return $t('doc-creation-form.error-default')
  }
}

const submit = async () => {
  try {
    await web3Store.checkConnection()
  } catch {
    return
  }

  disableForm()
  isSubmitting.value = true
  try {
    const secretFileHash =
      (await poseidonHashContractInstance.value.getPoseidonHash(
        (await getKeccak256FileHash(form.file as File)) as Keccak256Hash,
      )) as PoseidonHash

    const { ZKPPointsStruct, publicHash } =
      await generateZKPPointsStructAndPublicHash(
        secretFileHash,
        web3Store.provider.selectedAddress as string,
      )

    publicFileHash.value = publicHash

    await timestampContractInstance.value.createStamp(
      publicFileHash.value,
      form.isSign,
      form.isIndicatingAddresses ? form.indicatedAddresses.reverse() : [],
      ZKPPointsStruct,
    )

    showConfirmation()
  } catch (err) {
    if (err?.error)
      errorMessage.value = getErrorMessage(err.error as EthProviderRpcError)
    else errorMessage.value = $t('doc-creation-form.error-default')

    showFailure()
    ErrorHandler.processWithoutFeedback(err)
  }
  isSubmitting.value = false
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  publicFileHash.value = null

  form.file = null
  form.isSign = true
  form.isIndicatingAddresses = false
  form.indicatedAddresses = []

  isConfirmationShown.value = false
  isFailureShown.value = false
  isFormDisabled.value = false
}
</script>

<style lang="scss" scoped>
.doc-creation-form__container {
  display: flex;
  gap: toRem(24);
  margin-top: toRem(24);

  @include respond-to(850px) {
    flex-direction: column;
    gap: toRem(16);
    margin-top: toRem(16);
  }
}

.doc-creation-form__wallets-addresses-title {
  margin: toRem(24) 0 toRem(8);

  @include text-2;

  @include respond-to(850px) {
    margin-top: toRem(16);

    @include text-4;
  }
}

.doc-creation-form__wallet-address {
  margin-top: toRem(24);

  @include respond-to(850px) {
    margin-top: toRem(16);
  }
}

.doc-creation-form__buttons {
  display: flex;
  gap: toRem(16);
  margin-top: toRem(24);

  @include respond-to(850px) {
    gap: toRem(8);
    margin-top: toRem(16);
  }
}

.doc-creation-form__loader {
  margin: toRem(24) 0;

  @include respond-to(850px) {
    margin: toRem(16) 0;
  }
}

.doc-creation-form__please-wait-msg {
  text-align: center;

  @include h5;

  @include respond-to(850px) {
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

    @include respond-to(850px) {
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

  @include respond-to(850px) {
    height: toRem(20);
    width: toRem(20);
  }
}

.doc-creation-form__doc-hash {
  margin: toRem(24) 0;

  @include respond-to(850px) {
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
