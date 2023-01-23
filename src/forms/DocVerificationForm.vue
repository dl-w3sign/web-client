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
            {{ formatTimestamp(stampInfo?.docTimestamp as number) }}
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
      <div v-if="stampInfo?.signers.length">
        <h4>
          {{ $t('doc-verification-form.list-title') }}
        </h4>
        <input-field
          :model-value="addressToSearch"
          @update:model-value="searchAddress"
          class="doc-verification-form__search-input"
          :placeholder="$t('doc-verification-form.search-placeholder')"
          :left-icon="$icons.search"
        />
        <div v-if="foundSigner" class="doc-verification-form__address">
          <input-field
            class="doc-verification-form__address"
            :model-value="foundSigner.address"
            :is-readonly="true"
            :right-icon="$icons.checkCircle"
          />
          <div class="doc-verification-form__timestamp-info">
            <p
              class="doc-verification-form__timestamp-title"
              v-if="foundSigner.signatureTimestamp"
            >
              {{ $t('doc-verification-form.signature-timestamp-title') }}
            </p>
            <p class="doc-verification-form__timestamp">
              {{ formatTimestamp(foundSigner.signatureTimestamp) }}
            </p>
          </div>
        </div>
        <div v-show="!addressToSearch">
          <div v-for="signer in stampInfo.signers" :key="signer.address">
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
                {{ formatTimestamp(signer.signatureTimestamp) }}
              </p>
            </div>
          </div>
          <pagination-control
            class="doc-verification-form__pagination-control"
            :items-count="stampInfo.signersTotalCount"
            :page-limit="pageLimit"
            :on-page-change="onPageChange"
          />
        </div>
      </div>
      <app-button :preset="BUTTON_PRESETS.primary" @click.prevent="signOrExit">
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
} from '@/enums'
import { errors } from '@/errors'
import { FileField, InputField } from '@/fields'
import { getKeccak256FileHash, Bus, ErrorHandler, isAddress } from '@/helpers'
import {
  Keccak256Hash,
  UseProvider,
  UsePaginationCallbackArg,
  SignerInfo,
  StampInfo,
} from '@/types'
import { required, maxValue } from '@/validators'
import { useWindowSize } from '@vueuse/core'
import { DateUtil } from '@/utils'
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
const foundSigner = ref<SignerInfo | null>()
const searchAddress = async (newAddress: string) => {
  addressToSearch.value = newAddress

  if (isAddress(addressToSearch.value)) {
    const signer = await timestampContractInstance?.value?.getSignerInfo(
      addressToSearch.value,
      fileHash.value as Keccak256Hash,
    )
    if (signer) foundSigner.value = signer
  } else {
    foundSigner.value = undefined
  }
}

const stampInfo = ref<StampInfo | null>()
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
  return DateUtil.format(timestamp, 'X', 'MMM DD, YYYY [at] HH.mm')
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

    const signerInfo = await timestampContractInstance.value?.getSignerInfo(
      web3Provider?.selectedAddress.value as string,
      fileHash.value,
    )
    if (signerInfo?.signatureTimestamp)
      isAlreadySignedByCurrentSigner.value = true

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
  isAlreadySignedByCurrentSigner.value = false
  isJustSignedByCurrentSigner.value = false
  addressToSearch.value = ''
  foundSigner.value = undefined
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

.doc-verification-form__pagination-control {
  margin: toRem(24) 0;
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
