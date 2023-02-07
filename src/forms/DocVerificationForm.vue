<template>
  <form
    :class="{
      'doc-verification-form': true,
      'doc-verification-form--confirmation-hidden': !isConfirmationShown,
    }"
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
              {{ formatTimestamp(stampInfo?.docTimestamp as number) }}
            </p>
          </div>
        </div>
        <textarea-field :model-value="fileHash || ''" :is-copied="true" />
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
                  {{ formatTimestamp(signer.signatureTimestamp) }}
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
        <app-button
          :preset="BUTTON_PRESETS.primary"
          @click.prevent="signOrExit"
        >
          {{
            isAlreadySignedByCurrentSigner || isJustSignedByCurrentSigner
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
    </transition>
  </form>
</template>

<script lang="ts" setup>
import { AppButton, Spinner, Icon, PaginationControl } from '@/common'
import {
  useForm,
  useFormValidation,
  useTimestampContract,
  useContext,
} from '@/composables'
import {
  APP_KEYS,
  BUTTON_PRESETS,
  BUTTON_STATES,
  RPC_ERROR_MESSAGES,
  TIMEZONES,
} from '@/enums'
import { errors } from '@/errors'
import { FileField, InputField, TextareaField } from '@/fields'
import { getKeccak256FileHash, Bus, ErrorHandler, isAddress } from '@/helpers'
import {
  Keccak256Hash,
  UseProvider,
  UsePaginationCallbackArg,
  StampInfo,
} from '@/types'
import { required, maxValue } from '@/validators'
import { useWindowSize } from '@vueuse/core'
import { Time } from '@/utils'
import { ref, reactive, inject, computed } from 'vue'

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

const addressToSearch = ref('')
const searchAddress = async (newAddress: string) => {
  addressToSearch.value = newAddress

  if (addressToSearch.value) {
    if (stampInfo.value) stampInfo.value.signers.length = 0

    if (isAddress(addressToSearch.value)) {
      const signer = await timestampContractInstance?.value?.getSignerInfo(
        addressToSearch.value,
        fileHash.value as Keccak256Hash,
      )

      if (signer) stampInfo.value?.signers.push(signer)
    }
  } else {
    stampInfo.value =
      await timestampContractInstance.value?.getStampInfoWithPagination(
        fileHash.value as Keccak256Hash,
        0,
        pageLimit.value,
      )
  }
}

const stampInfo = ref<StampInfo | null>()
const isSignedBySomeone = ref(false)
const isAlreadySignedByCurrentSigner = ref(false)
const isJustSignedByCurrentSigner = ref(false)

const timestampContractInstance = computed(() => {
  return web3Provider
    ? useTimestampContract(web3Provider, $config.CTR_ADDRESS_TIMESTAMP)
    : undefined
})

const { width: windowWidth } = useWindowSize()
const pageLimit = computed(() => (windowWidth.value > 1000 ? 3 : 2))
const onPageChange = async ({
  newItemsOffset,
  pageLimit,
}: UsePaginationCallbackArg) => {
  stampInfo.value =
    await timestampContractInstance.value?.getStampInfoWithPagination(
      fileHash.value as Keccak256Hash,
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
    fileHash.value = await getKeccak256FileHash(form.file as File)

    if (web3Provider?.chainId !== $config.CHAIN_ID)
      await web3Provider?.switchChain($config.CHAIN_ID)

    stampInfo.value =
      await timestampContractInstance.value?.getStampInfoWithPagination(
        fileHash.value,
        0,
        pageLimit.value,
      )
    if (stampInfo.value?.docTimestamp === 0)
      throw new Error('Document not found')

    if (stampInfo.value?.signers.length) {
      isSignedBySomeone.value = true
      const signerInfo = await timestampContractInstance.value?.getSignerInfo(
        web3Provider?.selectedAddress.value as string,
        fileHash.value,
      )
      if (signerInfo?.signatureTimestamp)
        isAlreadySignedByCurrentSigner.value = true
    }

    showConfirmation()
  } catch (err) {
    if (stampInfo.value?.docTimestamp === 0) {
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
    if (web3Provider?.chainId !== $config.CHAIN_ID)
      await web3Provider?.switchChain($config.CHAIN_ID)

    await timestampContractInstance.value?.sign(fileHash.value as Keccak256Hash)

    isJustSignedByCurrentSigner.value = true
    Bus.success($t('doc-verification-form.sign-success-message'))
  } catch (error) {
    alert(error)
    if (error.reason === RPC_ERROR_MESSAGES.alreadySigned) {
      Bus.emit(
        Bus.eventList.info,
        $t('doc-verification-form.already-signed-message'),
      )
      isJustSignedByCurrentSigner.value = true
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
  fileHash.value = null
  isSignedBySomeone.value = false
  isAlreadySignedByCurrentSigner.value = false
  isJustSignedByCurrentSigner.value = false
  addressToSearch.value = ''
  resetState()
}

Bus.on(Bus.eventList.openModal, reset)
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
  // display: none;
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
