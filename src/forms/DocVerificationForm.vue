<template>
  <form
    class="doc-verification-form"
    :class="{
      'doc-verification-form--confirmation-hidden': !isConfirmationShown,
    }"
    @submit.prevent
  >
    <transition name="fade" mode="out-in">
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
              {{ formatTimestamp(stampInfo?.docTimestamp as number) }}
            </p>
          </div>
        </div>
        <textarea-field
          :model-value="publicFileHash as string || ''"
          is-copyable
          readonly
        />
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
            {{
              stampInfo?.isPublic
                ? $t('doc-verification-form.success-msg-public')
                : $t('doc-verification-form.success-msg-not-public')
            }}
          </p>
        </div>
        <div v-if="isSignedBySomeone">
          <h4 class="doc-verification-form__list-title">
            {{ $t('doc-verification-form.list-title') }}
          </h4>
          <input-field
            :model-value="addressToSearch"
            @update:model-value="onUpdateAddressToSearch"
            class="doc-verification-form__search-input"
            :placeholder="$t('doc-verification-form.search-placeholder')"
            :left-icon-name="$icons.search"
          />
          <transition name="fade-in">
            <spinner v-if="isSearching" class="doc-verification-form__loader" />
            <div
              v-else-if="errorMessage"
              :class="[
                'doc-verification-form__note',
                'doc-verification-form__note--error',
              ]"
            >
              <icon
                class="doc-verification-form__note-icon"
                :name="$icons.exclamationCircle"
              />
              <p>
                {{ errorMessage }}
              </p>
            </div>
            <div v-else-if="stampInfo?.signers">
              <div v-for="signer in stampInfo.signers" :key="signer.address">
                <textarea-field
                  class="doc-verification-form__address"
                  :model-value="signer.address"
                  :right-icon-name="
                    signer.signatureTimestamp ? $icons.checkCircle : undefined
                  "
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
                    {{
                      signer.signatureTimestamp
                        ? formatTimestamp(signer.signatureTimestamp)
                        : $t('doc-verification-form.not-signed-yet-message')
                    }}
                  </p>
                </div>
              </div>
              <pagination-control
                v-if="!addressToSearch && stampInfo.signers.length"
                class="doc-verification-form__pagination-control"
                :items-count="stampInfo.signersTotalCount"
                :page-limit="pageLimit"
                :on-page-change="onPageChange"
              />
            </div>
          </transition>
        </div>
        <app-button preset="primary" @click="signOrExit">
          {{
            infoOfCurrentSigner?.isAdmittedToSigning
              ? $t('doc-verification-form.sign-button-text')
              : $t('doc-verification-form.exit-button-text')
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
import { AppButton, Spinner, Icon, PaginationControl } from '@/common'
import {
  useForm,
  useFormValidation,
  useTimestampContract,
  usePoseidonHashContract,
  useContext,
} from '@/composables'
import { RPC_ERROR_MESSAGES, TIMEZONES } from '@/enums'
import { FileField, InputField, TextareaField } from '@/fields'
import {
  getKeccak256FileHash,
  Bus,
  ErrorHandler,
  isAddress,
  generateZKPPointsStructAndPublicHash,
} from '@/helpers'
import {
  Keccak256Hash,
  UsePaginationCallbackArg,
  StampInfo,
  SignerInfo,
  BytesLike,
  PoseidonHash,
} from '@/types'
import { required, maxValue } from '@/validators'
import { useWindowSize } from '@vueuse/core'
import { useWeb3ProvidersStore } from '@/store'
import { ref, reactive, computed, watch } from 'vue'
import { debounce } from 'lodash-es'
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
const poseidonHashContractInstance = usePoseidonHashContract(
  $config.CTR_ADDRESS_POSEIDON_HASH,
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

const publicFileHash = ref<BytesLike | null>(null)
const errorMessage = ref('')

const addressToSearch = ref('')
const isSearching = ref(false)
const onUpdateAddressToSearch = (newAddress: string) => {
  addressToSearch.value = newAddress
  isSearching.value = true
}
const searchAddress = async (address: string) => {
  if (stampInfo.value) stampInfo.value.signers.length = 0

  if (address) {
    if (isAddress(address)) {
      const signer = await timestampContractInstance.getSignerInfo(
        address,
        publicFileHash.value as BytesLike,
      )

      if (signer) stampInfo.value?.signers.push(signer)
    } else {
      errorMessage.value = $t('doc-verification-form.not-an-address-message')
    }
  } else if (!address) {
    stampInfo.value =
      await timestampContractInstance.getStampInfoWithPagination(
        publicFileHash.value as BytesLike,
        0,
        pageLimit.value,
      )

    errorMessage.value = ''
  }

  isSearching.value = false
}
watch(
  () => addressToSearch.value,
  debounce((newValue: string) => searchAddress(newValue), 500),
)

const stampInfo = ref<StampInfo | null>()
const infoOfCurrentSigner = ref<SignerInfo | null>()
const isSignedBySomeone = ref(false)

const { width: windowWidth } = useWindowSize()
const pageLimit = computed(() => (windowWidth.value < 868 ? 2 : 3))
const onPageChange = async ({
  newItemsOffset,
  pageLimit,
}: UsePaginationCallbackArg) => {
  stampInfo.value = await timestampContractInstance.getStampInfoWithPagination(
    publicFileHash.value as BytesLike,
    newItemsOffset,
    pageLimit,
  )
}

const formatTimestamp = (timestamp: number): string => {
  return new Time(timestamp, 'X')
    .tz(TIMEZONES.CET)
    .format('hh:mm A MMMM YYYY [CET]')
}

const submitVerification = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    const secretFileHash = (await poseidonHashContractInstance.getPoseidonHash(
      (await getKeccak256FileHash(form.files?.[0] as File)) as Keccak256Hash,
    )) as PoseidonHash

    const { publicHash } = await generateZKPPointsStructAndPublicHash(
      secretFileHash,
      web3Provider.selectedAddress as string,
    )

    publicFileHash.value = publicHash

    stampInfo.value =
      await timestampContractInstance.getStampInfoWithPagination(
        publicFileHash.value,
        0,
        pageLimit.value,
      )
    if (stampInfo.value?.docTimestamp === 0)
      throw new Error('Document not found')

    if (stampInfo.value?.signers.length) {
      infoOfCurrentSigner.value = await timestampContractInstance.getSignerInfo(
        web3Provider?.selectedAddress as string,
        publicFileHash.value,
      )

      isSignedBySomeone.value = true
    }

    showConfirmation()
  } catch (err) {
    stampInfo.value?.docTimestamp === 0
      ? (errorMessage.value = $t('doc-verification-form.error-doc-not-found'))
      : (errorMessage.value = $t('doc-verification-form.error-default'))

    ErrorHandler.processWithoutFeedback(err)
    showFailure()
  }
  isSubmitting.value = false
  enableForm()
}

const signOrExit = async () => {
  if (!infoOfCurrentSigner.value?.isAdmittedToSigning) {
    emit('cancel')
    return
  }

  disableForm()
  isSubmitting.value = true
  try {
    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    await timestampContractInstance.sign(publicFileHash.value as BytesLike)

    infoOfCurrentSigner.value.isAdmittedToSigning = false
    Bus.success($t('doc-verification-form.sign-success-message'))
  } catch (error) {
    if (error?.reason === RPC_ERROR_MESSAGES.alreadySigned) {
      Bus.info($t('doc-verification-form.already-signed-message'))
      infoOfCurrentSigner.value.isAdmittedToSigning = false
      ErrorHandler.processWithoutFeedback(error)
    } else {
      ErrorHandler.process(error)
    }
  }

  isSubmitting.value = false
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  form.files = null
  publicFileHash.value = null
  stampInfo.value = undefined
  infoOfCurrentSigner.value = undefined
  isSignedBySomeone.value = false
  addressToSearch.value = ''
  isSearching.value = false
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
  stroke: var(--col-success);
  stroke-width: toRem(0);
  transition: var(--transition-duration);
  color: var(--col-intense);

  &:hover,
  &:active {
    stroke-width: toRem(2);
  }
}

.doc-verification-form__search-input {
  margin: toRem(8) 0 toRem(24);
  stroke: var(--col-brittle);

  &:hover {
    stroke: var(--col-flexible);
  }

  &:focus-within {
    stroke: var(--col-primary);
  }

  @include respond-to(tablet) {
    margin: toRem(8) 0 toRem(12);
  }
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

.doc-verification-form__pagination-control {
  margin: toRem(24) 0;

  @include respond-to(tablet) {
    margin: toRem(12) 0;
  }
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
      white-space: pre-line;
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

.fade-in-leave-active {
  display: none;
}

.fade-leave-active {
  animation: fade-in ease-out var(--transition-duration) reverse;
}

.fade-in-enter-active,
.fade-enter-active {
  animation: fade-in ease-out var(--transition-duration-slow);
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
