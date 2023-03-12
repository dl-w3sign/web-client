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
        <h5 class="doc-verification-form__please-wait-msg">
          {{ $t('doc-verification-form.please-wait-msg') }}
        </h5>
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
        <div v-if="isSignedBySomeone" class="doc-verification-form__container">
          <div>
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
          </div>
          <transition name="fade-in">
            <spinner v-if="isSearching" />
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
            <div
              v-else-if="stampInfo?.signers"
              class="doc-verification-form__container"
            >
              <transition-group name="fade-in">
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
                      {{
                        $t('doc-verification-form.signature-timestamp-title')
                      }}
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
      <div v-else-if="isFailureShown" class="doc-verification-form__container">
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
      <div v-else class="doc-verification-form__container">
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
import { errors } from '@/errors'
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
import { useWeb3ProvidersStore } from '@/store'
import { required, maxValue } from '@/validators'
import { useWindowSize } from '@vueuse/core'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { v4 as generateUid } from 'uuid'
import { Time } from '@distributedlab/utils'

const uid = generateUid()

const emit = defineEmits<{
  (event: 'cancel'): void
}>()

const form = reactive({
  files: null as File[] | null,
})

const { $t } = useContext()
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
const web3Store = useWeb3ProvidersStore()
const timestampContractInstance = useTimestampContract()
const poseidonHashContractInstance = usePoseidonHashContract()

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
    .format('hh:mm A MMM YYYY [CET]')
}

const updateInfoOfCurrentSigner = async () => {
  if (publicFileHash.value)
    infoOfCurrentSigner.value = await timestampContractInstance.getSignerInfo(
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
    const secretFileHash = (await poseidonHashContractInstance.getPoseidonHash(
      (await getKeccak256FileHash(form.files?.[0] as File)) as Keccak256Hash,
    )) as PoseidonHash

    const { publicHash } = await generateZKPPointsStructAndPublicHash(
      secretFileHash,
      web3Store.provider.selectedAddress as string,
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
      isSignedBySomeone.value = true
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
    await timestampContractInstance.sign(publicFileHash.value as BytesLike)

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
  form.files = null
  publicFileHash.value = null
  stampInfo.value = undefined
  infoOfCurrentSigner.value = undefined
  isSignedBySomeone.value = false
  addressToSearch.value = ''
  isSearching.value = false
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

  @include respond-to(tablet) {
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

  @include respond-to(tablet) {
    gap: toRem(16);

    .doc-verification-form--confirmation-shown & {
      gap: toRem(12);
    }
  }
}

.doc-verification-form__buttons {
  display: flex;
  gap: toRem(16);

  @include respond-to(tablet) {
    gap: toRem(8);
  }
}

.doc-verification-form__please-wait-msg {
  text-align: center;
}

.doc-verification-form__doc-info {
  display: flex;
  flex-wrap: wrap;
}

.doc-verification-form__doc-hash-label {
  @include body-large;

  @include respond-to(tablet) {
    margin-bottom: toRem(8);
  }
}

.doc-verification-form__doc-hash {
  width: 100%;
  margin-top: toRem(8);

  @include respond-to(tablet) {
    margin-top: toRem(4);
  }
}

.doc-verification-form__list-title {
  @include respond-to(tablet) {
    @include body-large;
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

  @include respond-to(tablet) {
    gap: toRem(4);
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

.doc-verification-form__note {
  &--success {
    @include note-success;

    @include respond-to(tablet) {
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
