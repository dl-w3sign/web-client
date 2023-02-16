<template>
  <div class="file-field">
    <div v-if="modelValue" class="file-field__file-info">
      <icon class="file-field__file-icon" :name="getFileIconName(modelValue)" />
      <div class="file-field__file-meta">
        <h4 class="file-field__file-name">
          {{ modelValue.name }}
        </h4>
        <p class="file-field__file-size">
          {{ formatFileSize(modelValue.size) }}
        </p>
      </div>
      <button
        v-if="!isReadonly"
        class="file-field__cancel-button"
        @click="cancelFile"
      >
        <icon class="file-field__cancel-icon" :name="$icons.xCircle" />
      </button>
    </div>
    <div
      v-else-if="!isReadonly"
      class="file-field__drop-zone"
      :class="{ 'file-field__drop-zone--active': isOverDropZone }"
    >
      <label
        ref="dropZone"
        class="file-field__drop-zone-label"
        @click="openFileDialog"
      />
      <div class="file-field__drop-zone-container">
        <icon
          class="file-field__drop-zone-icon"
          :class="{ 'file-field__drop-zone-icon--large': isOverDropZone }"
          :name="$icons.cloudUpload"
        />
        <h6 class="file-field__title" v-show="!isOverDropZone">
          {{ $t('file-field.title') }}
          <button
            class="file-field__open-dialog-button"
            @click.prevent="openFileDialog"
          >
            {{ $t('file-field.open-dialog-button-text') }}
          </button>
        </h6>
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
import { errors } from '@/errors'
import { ErrorHandler, getFileIconName, formatFileSize } from '@/helpers'
import { ref, watch } from 'vue'
import { useDropZone, useFileDialog } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
}>()

const props = withDefaults(
  defineProps<{
    modelValue: File | null
    isReadonly?: boolean
  }>(),
  {
    isReadonly: false,
  },
)

const checkType = (files: FileList | File[]) => {
  const fileMIMEType = files[0].type
  if (!$config.FILE_MIME_TYPES.find(type => type === fileMIMEType)) {
    throw new errors.FileTypeError()
  }
}

const checkSize = (files: FileList | File[]) => {
  if (files[0].size > 1 * 1000 * 1000) throw new errors.FileSizeError()
}

const { $t, $config } = useContext()

const dropZone = ref<HTMLLabelElement>()
const { isOverDropZone } = useDropZone(dropZone, (files: File[] | null) => {
  if (files) {
    try {
      checkType(files)
      checkSize(files)
    } catch (err) {
      switch (err?.constructor) {
        case errors.FileTypeError:
          ErrorHandler.process(err, $t('file-field.error-uncorrect-file-type'))
          break
        case errors.FileSizeError:
          ErrorHandler.process(err, $t('file-field.error-exceeded-file-size'))
          break
      }

      return
    }
  }
  props.modelValue
    ? emit('update:modelValue', files?.length ? files[0] : props.modelValue)
    : emit('update:modelValue', files?.length ? files[0] : null)
})

const fileDialog = useFileDialog({
  multiple: false,
  accept: $config.FILE_MIME_TYPES.join(', '),
})

const openFileDialog = () => {
  fileDialog.reset()
  fileDialog.open()
}

const cancelFile = () => {
  emit('update:modelValue', null)
}

const emitFileFromFileDialog = (fileList: FileList | null) => {
  emit('update:modelValue', fileList?.length ? fileList[0] : null)
}

watch(
  () => fileDialog.files,
  newValue => {
    if (newValue.value) {
      try {
        checkType(newValue.value)
        checkSize(newValue.value)
      } catch (err) {
        switch (err?.constructor) {
          case errors.FileTypeError:
            ErrorHandler.process(
              err,
              $t('file-field.error-uncorrect-file-type'),
            )
            break
          case errors.FileSizeError:
            ErrorHandler.process(err, $t('file-field.error-exceeded-file-size'))
            break
        }

        return
      }
    }
    emitFileFromFileDialog(newValue.value)
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.file-field__file-info {
  background: var(--col-great);
  border-radius: var(--border-radius-medium);
  display: flex;
  align-items: center;
  padding: 0 toRem(24);
  gap: toRem(10);
  height: toRem(96);
  transition: background-color, var(--transition-duration);

  &:hover {
    background: var(--col-mild);
  }

  @include respond-to(850px) {
    padding: 0 toRem(16);
    height: toRem(76);
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

  @include respond-to(850px) {
    @include text-5;
  }
}

.file-field__file-size {
  color: var(--col-fancy);

  @include text-4;

  @include respond-to(850px) {
    margin-top: toRem(4);
  }
}

.file-field__cancel-button {
  margin-left: auto;
  height: toRem(24);
  width: toRem(24);
  fill: var(--col-fancy);
  flex-shrink: 0;
  color: var(--col-intense);
  transition: var(--transition-duration-fast);

  &:hover {
    fill: var(--col-accent);
  }

  &:active {
    fill: var(--col-spot);
  }

  @include respond-to(850px) {
    height: toRem(20);
    width: toRem(20);
  }
}

.file-field__drop-zone {
  position: relative;
  background-image: url('/branding/border-file-field-drop-zone.png');
  background-color: var(--col-great);
  display: flex;
  margin: auto;
  height: toRem(257);
  width: toRem(544);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-duration-fast);

  &:hover,
  &--active {
    background-color: var(--col-grand);
  }

  @include respond-to(850px) {
    height: toRem(184);
    width: toRem(311);
    background-image: url('/branding/border-file-field-drop-zone-small.png');
  }
}

.file-field__drop-zone-label {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  cursor: pointer;
  border-radius: var(--border-radius);
}

.file-field__drop-zone-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin: auto;
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

  @include h4;

  @include respond-to(850px) {
    margin-top: toRem(8);

    @include h5;
  }
}

.file-field__open-dialog-button {
  position: relative;
  z-index: var(--z-file-field-open-dialog-button);
  font-size: inherit;
  line-height: inherit;
  color: var(--col-primary);

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

  @include text-2;

  @include respond-to(850px) {
    max-width: toRem(240);

    @include text-4;
  }
}
</style>
