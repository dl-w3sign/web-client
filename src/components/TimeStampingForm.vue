<template>
  <form
    class="time-stamping-form__form"
    enctype="multipart/form-data"
    @submit.prevent="submit"
  >
    <p class="time-stamping-form__form-title">
      {{ $t('time-stamping-form.time-stamping') }}
    </p>
    <div class="time-stamping-form__form-wrapper">
      <div class="time-stamping-form__form-hash-input-wrapper">
        <p class="time-stamping-form__form-hash-title">
          {{ $t('time-stamping-form.enter-hash') }}
        </p>
        <input
          v-model="userHash"
          :disabled="isInputHashDisabled"
          :maxlength="hashInputLength"
          :size="hashWrapperLength"
          class="time-stamping-form__form-hash-input"
          type="text"
          @input="loadHash"
        />
      </div>
      <div class="time-stamping-form__form-file-input-wrapper">
        <input
          ref="fileInput"
          :disabled="isInputFileDisabled"
          class="time-stamping-form__form-file-input"
          type="file"
          @change="loadFile"
        />
        <button
          :disabled="isFileClearDisabled"
          class="time-stamping-form__form-file-clear-btn"
          @click="clearFile"
        >
          {{ $t('time-stamping-form.clear') }}
        </button>
      </div>
    </div>

    <div class="time-stamping-form__form-actions">
      <button
        :disabled="isSubmitDisabled"
        class="time-stamping-form__form-create-btn"
        @click="createTimeStamp"
      >
        {{ $t('time-stamping-form.create-time-stamp') }}
      </button>

      <button
        :disabled="isSubmitDisabled"
        class="time-stamping-form__form-check-btn"
        @click="checkTimeStamp"
      >
        {{ $t('time-stamping-form.check') }}
      </button>
    </div>
  </form>

  <div :class="{ 'time-stamping-form__form-result--is-error': isError }">
    <p>{{ result }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import UploadFile from '@/helpers/UploadFile.helper.js'
import UploadHash from '@/helpers/UploadHash.helper.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userHash = ref('')
const fileInput = ref(null)
const inputData = ref(null)
const isProcessing = ref(false)
const result = ref('')
const isError = ref(false)
const isInputHashDisabled = computed(
  () => isProcessing.value || (inputData.value && !userHash.value.length),
)
const isInputFileDisabled = computed(
  () => isProcessing.value || userHash.value.length,
)
const isFileClearDisabled = computed(
  () => isProcessing.value || !inputData.value || userHash.value.length,
)
const isSubmitDisabled = computed(() => isProcessing.value || !inputData.value)

const hashLength = 64
const hashInputLength = hashLength + 2
const hashWrapperLength = 70
const hashRegex = new RegExp(`0x[A-Fa-f0-9]{${hashLength}}`)

const loadFile = event => {
  inputData.value = event.target.files[0]
}

const clearFile = () => {
  inputData.value = null
  fileInput.value.value = null
  isError.value = false
  result.value = ''
}

const loadHash = () => {
  if (userHash.value.match(hashRegex)) {
    inputData.value = userHash.value
  } else {
    inputData.value = null
  }
}

const createTimeStamp = async () => {
  isProcessing.value = true
  isError.value = false
  result.value = ''

  try {
    if (typeof inputData.value !== 'string') {
      await UploadFile.uploadFileForCreate(inputData.value)
    } else {
      await UploadHash.sendForCreate(inputData.value)
    }
    result.value = t('time-stamping-form.created')
  } catch (e) {
    console.log(e)
    isError.value = true
    result.value = t('time-stamping-form.somethings-gone-wrong')
  }
  isProcessing.value = false
}

const checkTimeStamp = async () => {
  isProcessing.value = true
  isError.value = false
  let response
  result.value = ''

  try {
    if (typeof inputData.value !== 'string') {
      response = await UploadFile.uploadFileForCheck(inputData.value)
    } else {
      response = await UploadHash.sendForCheck(inputData.value)
    }
    result.value = new Date(parseInt(response.data.attributes.value) * 1000)
  } catch (e) {
    isError.value = true
    result.value = t('time-stamping-form.somethings-gone-wrong')
  }

  isProcessing.value = false
}
</script>

<style lang="scss">
.time-stamping-form__form-actions {
  padding-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 30rem;
  margin: auto;
}

.time-stamping-form__form-title {
  padding-bottom: 10rem;
  font-size: 2em;
  color: #e3e3e3;
}

.time-stamping-form__form-hash-title {
  margin-right: 1rem;
}

.time-stamping-form__form-wrapper {
  display: flex;
  color: #e3e3e3;
}

.time-stamping-form__form-file-clear-btn {
  color: #b01030;

  &:not([disabled]):hover {
    border-color: #b01030;
    cursor: pointer;
  }
  &:disabled {
    color: #999797;
    cursor: not-allowed;
  }
}

.time-stamping-form__form-check-btn {
  color: #6b8e23;
  flex: 1;

  &:not([disabled]):hover {
    border-color: #6b8e23;
    cursor: pointer;
  }
  &:disabled {
    color: #999797;
    cursor: not-allowed;
  }
}

.time-stamping-form__form-create-btn {
  color: #0000ff;
  flex: 1;

  &:not([disabled]):hover {
    border-color: #0000ff;
    cursor: pointer;
  }
  &:disabled {
    color: #999797;
    cursor: not-allowed;
  }
}

.time-stamping-form__form-file-input-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}

.time-stamping-form__form-hash-input-wrapper {
  flex: 1;
  display: flex;
}

.time-stamping-form__form-hash-input {
  background-color: #454545;
  color: #ffffff;

  &:disabled {
    background-color: #262626;
  }
}

.time-stamping-form__form-result {
  &--is-error {
    color: #dc143c;
  }
}
</style>
