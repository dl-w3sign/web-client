<template>
  <form
    class="doc-verification-form"
    :class="{
      'doc-verification-form--confirmation-shown': isConfirmationShown,
    }"
    @submit.prevent
  >
    <transition name="fade" mode="out-in">
      <div v-if="isSubmitting" class="doc-verification-form__container">
        <spinner />
        <p class="doc-verification-form__please-wait-msg">
          {{ $t('doc-verification-form.please-wait-msg') }}
        </p>
      </div>
      <div
        v-else-if="isConfirmationShown"
        class="doc-verification-form__container"
      >
        <div class="doc-verification-form__doc-info">
          <label
            class="doc-verification-form__doc-hash-label"
            :for="`doc-hash--${uid}`"
          >
            {{ $t('doc-verification-form.document-hash-label') }}
          </label>
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
          <textarea-field
            :id-prop="`doc-hash--${uid}`"
            class="doc-verification-form__doc-hash"
            :model-value="publicFileHash as string || ''"
            is-copied
            readonly
          />
        </div>
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
        <div
          v-if="stampInfo?.signers.length || addressToSearch"
          class="doc-verification-form__container"
        >
          <div>
            <h4 class="doc-verification-form__list-title">
              {{ $t('doc-verification-form.list-title') }}
            </h4>
            <input-field
              :model-value="addressToSearch"
              @update:model-value="searchAddress"
              class="doc-verification-form__search-input"
              :placeholder="$t('doc-verification-form.search-placeholder')"
              :left-icon-name="$icons.search"
            />
          </div>
          <div
            v-if="stampInfo?.signers"
            class="doc-verification-form__container"
          >
            <transition-group name="fade-group">
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
            </transition-group>
            <pagination-control
              v-if="!addressToSearch && stampInfo.signers.length"
              :items-count="stampInfo.signersTotalCount"
              :page-limit="pageLimit"
              :on-page-change="onPageChange"
            />
          </div>
        </div>
        <app-button :preset="BUTTON_PRESETS.primary" @click="signOrExit">
          {{
            infoOfCurrentSigner?.isAdmittedToSigning
              ? $t('doc-verification-form.sign-button-text')
              : $t('doc-verification-form.exit-button-text')
          }}
        </app-button>
      </div>
      <div v-else-if="isFailureShown" class="doc-verification-form__container">
        <file-field :model-value="form.file" is-readonly />
        <div
          class="doc-verification-form__note doc-verification-form__note--error"
        >
          <icon
            class="doc-verification-form__note-icon"
            :name="$icons.exclamationCircle"
          />
          {{ errorMessage }}
        </div>
        <app-button :preset="BUTTON_PRESETS.primary" @click="reset">
          {{ $t('doc-verification-form.reset-button-text') }}
        </app-button>
      </div>
      <div v-else class="doc-verification-form__container">
        <file-field v-model="form.file" />
        <div class="doc-verification-form__buttons">
          <app-button
            :preset="BUTTON_PRESETS.outlineBrittle"
            @click="emit('cancel')"
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
  UseTimestampContract,
  UsePoseidonHashContract,
} from '@/composables'
import {
  BUTTON_PRESETS,
  BUTTON_STATES,
  RPC_ERROR_MESSAGES,
  TIMEZONES,
} from '@/enums'
import { errors } from '@/errors'
import { FileField, InputField, TextareaField } from '@/fields'
import {
  getKeccak256FileHash,
  Bus,
  ErrorHandler,
  isAddress,
  generateZKPPointsStructAndPublicHash,
  getTimestampContractAddressByChainId,
  getPoseidonHashContractAddressByChainId,
} from '@/helpers'
import {
  Keccak256Hash,
  UsePaginationCallbackArg,
  StampInfo,
  SignerInfo,
  BytesLike,
  PoseidonHash,
  ChainId,
} from '@/types'
import { required, maxValue } from '@/validators'
import { useWindowSize } from '@vueuse/core'
import { Time } from '@/utils'
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  getCurrentInstance,
} from 'vue'
import { useWeb3ProvidersStore } from '@/store'

const uid = getCurrentInstance()?.uid

const emit = defineEmits<{
  (event: 'cancel'): void
}>()

const form = reactive({
  file: null as File | null,
})

const { $t } = useContext()
const { isFieldsValid } = useFormValidation(form, {
  file: {
    required,
    size: {
      required,
      maxValue: maxValue(10 * 1000 * 1000),
    },
  },
})
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
  disableForm,
  enableForm,
  showConfirmation,
  showFailure,
  resetState,
} = useForm()

const publicFileHash = ref<BytesLike | null>(null)
const errorMessage = ref('')

const addressToSearch = ref('')
const searchAddress = async (newAddress: string) => {
  if (newAddress) {
    if (stampInfo.value) stampInfo.value.signers.length = 0

    if (isAddress(addressToSearch.value)) {
      const signer = await timestampContractInstance.value.getSignerInfo(
        addressToSearch.value,
        publicFileHash.value as BytesLike,
      )

      if (signer) stampInfo.value?.signers.push(signer)
    }
  } else {
    stampInfo.value =
      await timestampContractInstance.value.getStampInfoWithPagination(
        publicFileHash.value as BytesLike,
        0,
        pageLimit.value,
      )
  }

  addressToSearch.value = newAddress
}

const stampInfo = ref<StampInfo | null>()
const infoOfCurrentSigner = ref<SignerInfo | null>()

const { width: windowWidth } = useWindowSize()
const pageLimit = computed(() => (windowWidth.value < 850 ? 2 : 3))
const onPageChange = async ({
  newItemsOffset,
  pageLimit,
}: UsePaginationCallbackArg) => {
  stampInfo.value =
    await timestampContractInstance.value.getStampInfoWithPagination(
      publicFileHash.value as BytesLike,
      newItemsOffset,
      pageLimit,
    )
}

const formatTimestamp = (timestamp: number): string => {
  return new Time(timestamp, 'X').tz(TIMEZONES.CET).format('hh:mm A YYYY [CET]')
}

const updateInfoOfCurrentSigner = async () => {
  if (publicFileHash.value)
    infoOfCurrentSigner.value =
      await timestampContractInstance.value.getSignerInfo(
        web3Store.provider.selectedAddress as string,
        publicFileHash.value as BytesLike,
      )
}

const getErrorMessage = (err: unknown) => {
  switch (true) {
    case stampInfo.value?.docTimestamp === 0:
      return $t('doc-verification-form.error-doc-not-found')
    case err?.constructor === TypeError:
      return $t('doc-verification-form.error-failed-to-fetch')
    default:
      return $t('doc-verification-form.error-default')
  }
}

const submitVerification = async () => {
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

    const { publicHash } = await generateZKPPointsStructAndPublicHash(
      secretFileHash,
      web3Store.provider.selectedAddress as string,
    )

    publicFileHash.value = publicHash

    stampInfo.value =
      await timestampContractInstance.value.getStampInfoWithPagination(
        publicFileHash.value,
        0,
        pageLimit.value,
      )
    if (stampInfo.value?.docTimestamp === 0)
      throw new Error('Document not found')

    if (stampInfo.value?.signers.length) {
      await updateInfoOfCurrentSigner()
    }

    showConfirmation()
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
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

  try {
    await web3Store.checkConnection()
  } catch {
    return
  }

  disableForm()
  isSubmitting.value = true
  try {
    await timestampContractInstance.value.sign(
      publicFileHash.value as BytesLike,
    )

    infoOfCurrentSigner.value.isAdmittedToSigning = false
    Bus.success($t('doc-verification-form.sign-success-message'))
  } catch (error) {
    switch (true) {
      case error?.reason === RPC_ERROR_MESSAGES.alreadySigned:
        Bus.info($t('doc-verification-form.already-signed-message'))
        infoOfCurrentSigner.value.isAdmittedToSigning = false
        ErrorHandler.processWithoutFeedback(error)
        break

      case error?.code === errors.ACTION_REJECTED:
        ErrorHandler.processWithoutFeedback(error)
        break

      default:
        ErrorHandler.process(error)
    }
  }

  isSubmitting.value = false
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  form.file = null
  publicFileHash.value = null
  stampInfo.value = undefined
  infoOfCurrentSigner.value = undefined
  addressToSearch.value = ''
  resetState()
}

watch(
  () => web3Store.provider.selectedAddress,
  () => updateInfoOfCurrentSigner(),
)

onMounted(async () => {
  try {
    await web3Store.checkConnection()
  } catch {
    emit('cancel')
    return
  }
})
</script>

<style lang="scss" scoped>
.doc-verification-form {
  margin-top: toRem(24);

  @include respond-to(850px) {
    margin-top: toRem(16);

    &--confirmation-shown {
      margin-top: toRem(12);
    }
  }
}

.doc-verification-form__container {
  display: flex;
  flex-direction: column;
  gap: toRem(24);

  @include respond-to(850px) {
    gap: toRem(16);

    .doc-verification-form--confirmation-shown & {
      gap: toRem(12);
    }
  }
}

.doc-verification-form__buttons {
  display: flex;
  gap: toRem(16);

  @include respond-to(850px) {
    gap: toRem(8);
  }
}

.doc-verification-form__please-wait-msg {
  text-align: center;

  @include h5;

  @include respond-to(850px) {
    @include text-1;
  }
}

.doc-verification-form__doc-info {
  display: flex;
  flex-wrap: wrap;
}

.doc-verification-form__doc-hash-label {
  @include text-1;

  @include respond-to(850px) {
    margin-bottom: toRem(8);

    @include text-5;
  }
}

.doc-verification-form__doc-hash {
  width: 100%;
  margin-top: toRem(8);

  @include respond-to(850px) {
    margin-top: toRem(4);
  }
}

.doc-verification-form__list-title {
  @include respond-to(850px) {
    @include text-1;
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
  margin-top: toRem(8);
  stroke: var(--col-fine);
  stroke-width: toRem(1.5);
}

.doc-verification-form__timestamp-info {
  display: flex;
  justify-content: end;
  gap: toRem(11);
  margin-top: toRem(8);

  &--top {
    margin: 0 0 0 auto;
    align-self: flex-end;
  }

  @include text-4;

  @include respond-to(850px) {
    gap: toRem(4);

    @include text-6;
  }
}

.doc-verification-form__timestamp-title {
  color: var(--col-fine);
}

.doc-verification-form__timestamp {
  color: var(--col-primary);
}

.doc-verification-form__note {
  &--success {
    @include note-success;

    @include respond-to(850px) {
      white-space: pre-line;
    }
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
  color: var(--col-intense);

  @include respond-to(850px) {
    height: toRem(20);
    width: toRem(20);
  }
}

.fade-leave-active {
  animation: fade-in ease-out var(--transition-duration) reverse;
}

.fade-enter-active {
  animation: fade-in ease-out var(--transition-duration);
}

.fade-group-leave-active {
  display: none;
}

.fade-group-enter-active {
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
