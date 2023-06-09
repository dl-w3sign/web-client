<template>
  <div class="file-field">
    <div v-if="isReadonly && !modelValue" class="file-field__file-info" />
    <div v-if="isMultiple && modelValue" class="file-field__container">
      <transition-group name="fade" appear>
        <div
          v-for="file in modelValue"
          :key="file.name"
          class="file-field__file-info"
        >
          <icon class="file-field__file-icon" :name="getFileIconName(file)" />
          <div class="file-field__file-meta">
            <h4 class="file-field__file-name">
              {{ file.name }}
            </h4>
            <p class="file-field__file-size">
              {{ formatFileSize(file.size) }}
            </p>
          </div>
          <button
            v-if="!isReadonly"
            class="file-field__cancel-button"
            @click="cancelFileByName(file.name)"
          >
            <icon class="file-field__cancel-icon" :name="$icons.xCircle" />
          </button>
        </div>
      </transition-group>
    </div>
    <div
      class="file-field__drop-zone"
      :class="{
        'file-field__drop-zone--offset':
          !isReadonly && modelValue && isMultiple,
        'file-field__drop-zone--active': isOverDropZone,
      }"
    >
      <input
        :id="`file-field--${uid}`"
        :accept="$config.FILE_MIME_TYPES.join(', ')"
        ref="inputElement"
        type="file"
        class="file-field__input"
        v-bind="$attrs"
        @change="onChange"
      />
      <label
        v-show="!isReadonly"
        :for="`file-field--${uid}`"
        ref="dropZoneLabelElement"
        class="file-field__drop-zone-label"
      />
      <div v-if="!isMultiple && modelValue" class="file-field__file-info">
        <icon
          class="file-field__file-icon"
          :name="getFileIconName(modelValue[0])"
        />
        <div class="file-field__file-meta">
          <h4 class="file-field__file-name">
            {{ modelValue[0].name }}
          </h4>
          <p class="file-field__file-size">
            {{ formatFileSize(modelValue[0].size) }}
          </p>
        </div>
        <button
          v-if="!isReadonly"
          class="file-field__cancel-button"
          @click="cancelFileByName(modelValue[0].name)"
        >
          <icon class="file-field__cancel-icon" :name="$icons.xCircle" />
        </button>
      </div>
      <div
        v-if="!isReadonly && (isMultiple ? true : !modelValue)"
        class="file-field__drop-zone-container"
      >
        <icon
          class="file-field__drop-zone-icon"
          :class="{ 'file-field__drop-zone-icon--large': isOverDropZone }"
          :name="$icons.cloudUpload"
        />
        <h4 class="file-field__title" v-show="!isOverDropZone">
          {{ $t('file-field.title') }}
          <label :for="`file-field--${uid}`" class="file-field__browse-label">
            {{ $t('file-field.open-dialog-button-text') }}
          </label>
        </h4>
        <p class="file-field__require" v-show="!isOverDropZone">
          {{ $t('file-field.require') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { useContext } from '@/composables'
import { FILE_TYPES } from '@/enums'
import { errors } from '@/errors'
import { ErrorHandler, getFileIconName, formatFileSize } from '@/helpers'
import { ref, computed, useAttrs } from 'vue'
import { v4 as generateUid } from 'uuid'
import { unionBy } from 'lodash-es'
import { useDropZone } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'update:modelValue', value: File[] | null): void
}>()

const props = defineProps<{
  modelValue: File[] | null
}>()

const attrs = useAttrs()
const isMultiple = computed(() =>
  ['', 'multiple', true].includes(attrs.multiple as string | boolean),
)
const isReadonly = computed(() =>
  ['', 'readonly', true].includes(attrs.readonly as string | boolean),
)

const uid = generateUid()
const inputElement = ref<HTMLInputElement>()
const dropZoneLabelElement = ref<HTMLLabelElement>()
const { $t, $config } = useContext()

const tryEmitFiles = (files: File[]) => {
  try {
    files.forEach(file => {
      if (file.size > 2 * 1000 * 1000) throw new errors.FileSizeError()
      if (!$config.FILE_MIME_TYPES.includes(file.type as FILE_TYPES))
        throw new errors.FileTypeError()
    })

    if (isMultiple.value) {
      if (props.modelValue)
        emit(
          'update:modelValue',
          unionBy(props.modelValue, files, file => file.name),
        )
      else emit('update:modelValue', files)
    } else {
      emit('update:modelValue', [files[0]])
    }
  } catch (err) {
    switch (err?.constructor) {
      case errors.FileSizeError:
        ErrorHandler.process(err, $t('file-field.error-exceeded-file-size'))
        break
      case errors.FileTypeError:
        ErrorHandler.process(err, $t('file-field.error-uncorrected-file-type'))
    }
  }
}

const onChange = (event: Event) => {
  if (isReadonly.value) return
  const eventTarget = event.target as HTMLInputElement
  if (eventTarget.files?.length) tryEmitFiles([...eventTarget.files] as File[])
}

const { isOverDropZone } = useDropZone(
  dropZoneLabelElement,
  (files: File[] | null) => {
    if (isReadonly.value) return
    if (files) tryEmitFiles(files)
  },
)

const cancelFileByName = (fileName: string) => {
  if (props.modelValue?.length && props.modelValue.length > 1) {
    emit(
      'update:modelValue',
      props.modelValue.filter(file => file.name !== fileName),
    )
  } else {
    if (inputElement.value) inputElement.value.value = ''
    emit('update:modelValue', null)
  }
}
</script>

<style lang="scss" scoped>
.file-field__container {
  display: flex;
  flex-direction: column;
  gap: toRem(12);

  @include respond-to(tablet) {
    gap: toRem(8);
  }
}

.file-field__file-info {
  background: var(--col-great);
  border-radius: var(--border-radius-medium);
  display: flex;
  align-items: center;
  padding: 0 toRem(24);
  gap: toRem(10);
  height: toRem(96);
  transition: background-color, var(--transition-duration);

  &:hover,
  .file-field__drop-zone--active &,
  .file-field__drop-zone:hover & {
    background: var(--col-mild);
  }

  @include respond-to(tablet) {
    padding: 0 toRem(12);
    gap: toRem(8);
    height: toRem(68);
  }
}

.file-field__file-meta {
  flex: 1;
  overflow: hidden;
}

.file-field__file-icon {
  width: toRem(32);
  height: toRem(32);
}

.file-field__file-name {
  @include text-ellipsis;
}

.file-field__file-size {
  color: var(--col-fancy);

  @include body-medium;

  @include respond-to(tablet) {
    margin-top: toRem(4);
  }
}

.file-field__cancel-button {
  margin-left: auto;
  height: toRem(24);
  width: toRem(24);
  fill: var(--col-fine);
  flex-shrink: 0;
  color: var(--col-intense);
  transition: var(--transition-duration);
  z-index: var(--z-layer-1);

  &:hover {
    fill: var(--col-accent);
  }

  &:active {
    fill: var(--col-spot);
  }

  @include respond-to(tablet) {
    height: toRem(20);
    width: toRem(20);
  }
}

.file-field__drop-zone {
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: background-color var(--transition-duration);

  &--offset {
    margin-top: toRem(12);

    @include respond-to(tablet) {
      margin-top: toRem(8);
    }
  }
}

.file-field__drop-zone-label {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  cursor: pointer;
  border-radius: inherit;
}

.file-field__drop-zone-container {
  background-image: url('/branding/border-file-field-drop-zone.png');
  background-color: var(--col-great);
  height: toRem(257);
  width: toRem(544);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin: auto;
  transition: inherit;

  .file-field__drop-zone--active &,
  .file-field__drop-zone:hover & {
    background-color: var(--col-grand);
  }

  @include respond-to(tablet) {
    height: toRem(184);
    width: toRem(311);
    background-image: url('/branding/border-file-field-drop-zone-small.png');
  }
}

.file-field__drop-zone-icon {
  width: toRem(40);
  height: toRem(40);
  color: var(--col-negative);

  &--large {
    height: toRem(80);
    width: toRem(80);
  }
}

.file-field__title {
  margin-top: toRem(16);

  @include respond-to(tablet) {
    margin-top: toRem(8);
  }
}

.file-field__browse-label {
  display: inline-block;
  position: relative;
  z-index: var(--z-layer-100);
  font-weight: inherit;
  font-size: inherit;
  line-height: inherit;
  color: var(--col-primary);
  cursor: pointer;

  &:after {
    content: '';
    position: absolute;
    bottom: toRem(1.7);
    display: block;
    height: toRem(0.8);
    width: 100%;
    background: var(--col-primary);
  }

  &:hover {
    color: var(--col-basic);

    &:after {
      background: var(--col-basic);
    }
  }

  &:active {
    color: var(--col-initial);

    &:after {
      background: var(--col-initial);
    }
  }
}

.file-field__require {
  color: var(--col-fine);
  margin-top: toRem(8);
  text-align: center;
  white-space: pre-line;

  @include body-large-inter;
}

.file-field__input {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0 toRem(4);
  z-index: var(--z-layer-negative-1);
  display: block;
  padding: 0;
}

.fade-leave-active {
  animation: fade-in var(--transition-duration) reverse;
}

.fade-enter-active {
  animation: fade-in var(--transition-duration-slow);
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
