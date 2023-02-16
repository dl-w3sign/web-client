<template>
  <form
    :class="{
      'doc-verification-form': true,
      'doc-verification-form--confirmation-hidden': !isConfirmationShown,
    }"
    @submit.prevent
  >
    <transition name="fade">
      <div v-if="isSubmitting">
        <spinner class="doc-verification-form__loader" />
        <p class="doc-verification-form__please-wait-msg">
          {{ $t('doc-verification-form.please-wait-msg') }}
        </p>
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
              {{ formatTimestamp(stampInfo?.docTimestamp) }}
            </p>
          </div>
        </div>
        <textarea-field :model-value="publicFileHash || ''" is-copied />
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
        <div v-if="isSignedBySomeone">
          <h4 class="doc-verification-form__list-title">
            {{ $t('doc-verification-form.list-title') }}
          </h4>
          <input-field
            :model-value="addressToSearch"
            @update:model-value="searchAddress"
            class="doc-verification-form__search-input"
            :placeholder="$t('doc-verification-form.search-placeholder')"
            :left-icon="$icons.search"
          />
          <div v-if="stampInfo?.signers">
            <div v-for="signer in stampInfo.signers" :key="signer.address">
              <textarea-field
                class="doc-verification-form__address"
                :model-value="signer.address"
                :is-readonly="true"
                :right-icon="
                  signer.signatureTimestamp ? $icons.checkCircle : undefined
                "
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
        </div>
        <app-button :preset="BUTTON_PRESETS.primary" @click="signOrExit">
          {{
            isAlreadySignedByCurrentSigner || isJustSignedByCurrentSigner
              ? $t('doc-verification-form.exit-button-text')
              : $t('doc-verification-form.sign-button-text')
          }}
        </app-button>
      </div>
      <div v-else-if="isFailureShown">
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
      <div v-else>
        <file-field v-model="form.file" />
        <div class="doc-verification-form__buttons">
          <app-button :preset="BUTTON_PRESETS.outlineBrittle" @click="cancel">
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
} from '@/composables'
import {
  BUTTON_PRESETS,
  BUTTON_STATES,
  RPC_ERROR_MESSAGES,
  TIMEZONES,
} from '@/enums'
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
  BytesLike,
  PoseidonHash,
} from '@/types'
import { required, maxValue } from '@/validators'
import { useWindowSize } from '@vueuse/core'
import { Time } from '@/utils'
import { ref, reactive, computed } from 'vue'
import { useWeb3ProvidersStore } from '@/store'

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
const searchAddress = async (newAddress: string) => {
  addressToSearch.value = newAddress

  if (addressToSearch.value) {
    if (stampInfo.value) stampInfo.value.signers.length = 0

    if (isAddress(addressToSearch.value)) {
      const signer = await timestampContractInstance.getSignerInfo(
        addressToSearch.value,
        publicFileHash.value as BytesLike,
      )

      if (signer) stampInfo.value?.signers.push(signer)
    }
  } else {
    stampInfo.value =
      await timestampContractInstance.getStampInfoWithPagination(
        publicFileHash.value as BytesLike,
        0,
        pageLimit.value,
      )
  }
}

const stampInfo = ref<StampInfo | null>()
const isSignedBySomeone = ref(false)
const isAlreadySignedByCurrentSigner = ref(false)
const isJustSignedByCurrentSigner = ref(false)

const { width: windowWidth } = useWindowSize()
const pageLimit = computed(() => (windowWidth.value < 850 ? 2 : 3))
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
  return new Time(timestamp, 'X').tz(TIMEZONES.CET).format('hh:mm A YYYY [CET]')
}

const submitVerification = async () => {
  disableForm()
  isSubmitting.value = true
  try {
    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    const secretFileHash = (await poseidonHashContractInstance.getPoseidonHash(
      (await getKeccak256FileHash(form.file as File)) as Keccak256Hash,
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
      isSignedBySomeone.value = true
      const signerInfo = await timestampContractInstance.getSignerInfo(
        web3Provider?.selectedAddress as string,
        publicFileHash.value,
      )
      if (signerInfo?.signatureTimestamp)
        isAlreadySignedByCurrentSigner.value = true
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
  if (
    isAlreadySignedByCurrentSigner.value ||
    isJustSignedByCurrentSigner.value
  ) {
    if (props.cancel) props.cancel()
    return
  }

  disableForm()
  isSubmitting.value = true
  isConfirmationShown.value = false
  try {
    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)

    await timestampContractInstance.sign(publicFileHash.value as BytesLike)

    isJustSignedByCurrentSigner.value = true
    Bus.success($t('doc-verification-form.sign-success-message'))
  } catch (error) {
    if (error?.reason === RPC_ERROR_MESSAGES.alreadySigned) {
      Bus.emit(
        Bus.eventList.info,
        $t('doc-verification-form.already-signed-message'),
      )
      isJustSignedByCurrentSigner.value = true
    }

    if (error?.reason === RPC_ERROR_MESSAGES.isNotAdmitted) {
      Bus.emit(
        Bus.eventList.error,
        $t('doc-verification-form.is-not-admitted-message'),
      )
    }

    ErrorHandler.processWithoutFeedback(error)
  }
  isSubmitting.value = false
  showConfirmation()
  enableForm()
}

const reset = () => {
  errorMessage.value = ''
  form.file = null
  publicFileHash.value = null
  isSignedBySomeone.value = false
  isAlreadySignedByCurrentSigner.value = false
  isJustSignedByCurrentSigner.value = false
  addressToSearch.value = ''
  resetState()
}
</script>

<style lang="scss" scoped>
.doc-verification-form {
  &--confirmation-hidden {
    @include respond-to(850px) {
      margin-top: toRem(16);
    }
  }
}

.doc-verification-form__buttons {
  display: flex;
  gap: toRem(16);
  margin-top: toRem(24);

  @include respond-to(850px) {
    gap: toRem(8);
    margin-top: toRem(16);
  }
}

.doc-verification-form__loader {
  margin: toRem(24) 0;

  @include respond-to(850px) {
    margin: toRem(16) 0;
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
  margin-bottom: toRem(8);

  @include respond-to(850px) {
    margin-bottom: toRem(4);
  }
}

.doc-verification-form__doc-hash-title {
  @include text-1;

  @include respond-to(850px) {
    margin-bottom: toRem(8);

    @include text-5;
  }
}

.doc-verification-form__address {
  fill: var(--col-success);
  stroke: var(--col-success);
  stroke-width: toRem(0);
  transition: var(--transition-duration-slow);

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

  @include respond-to(850px) {
    margin: toRem(8) 0 toRem(12);
  }
}

.doc-verification-form__timestamp-info {
  display: flex;
  justify-content: end;
  gap: toRem(11);
  margin: toRem(8) auto toRem(24);
  font-size: toRem(14);
  line-height: 1.2;

  &--top {
    margin: 0 0 0 auto;
    align-self: flex-end;
  }

  @include respond-to(850px) {
    gap: toRem(4);

    &:not(.doc-verification-form__timestamp-info--top) {
      margin-bottom: toRem(12);
    }
  }
}

.doc-verification-form__timestamp-title {
  color: var(--col-fine);

  @include text-4;

  @include respond-to(850px) {
    @include text-6;
  }
}

.doc-verification-form__timestamp {
  color: var(--col-primary);

  @include text-4;

  @include respond-to(850px) {
    @include text-6;
  }
}

.doc-verification-form__pagination-control {
  margin: toRem(24) 0;

  @include respond-to(850px) {
    margin: toRem(12) 0;
  }
}

.doc-verification-form__list-title {
  margin-bottom: toRem(8);

  @include respond-to(850px) {
    @include text-1;
  }
}

.doc-verification-form__note {
  margin: toRem(24) 0;

  &--success {
    @include note-success;

    @include respond-to(850px) {
      margin: toRem(12) 0;
    }
  }

  &--error {
    @include note-error;

    @include respond-to(850px) {
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

  @include respond-to(850px) {
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

.fade-list-leave-active {
  // TODO: to discuss
}

.fade-list-enter-active {
  animation: fade ease var(--transition-duration-fast);
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
