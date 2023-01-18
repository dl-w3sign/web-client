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
        @click.prevent="cancelFile"
      >
        <icon class="file-field__cancel-icon" :name="$icons.xCircle" />
      </button>
    </div>
    <div
      v-else-if="!isReadonly"
      :class="[
        'file-field__drop-zone',
        isOverDropZone ? 'file-field__drop-zone--active' : '',
      ]"
    >
      <label
        ref="dropZone"
        class="file-field__drop-zone-label"
        @click="openFileDialog"
      />
      <div v-show="!isOverDropZone" class="file-field__not-drag-block">
        <icon class="file-field__icon" :name="$icons.cloudUpload" />
        <h6 class="file-field__title">
          {{ $t('file-field.title') }}
          <button
            class="file-field__open-dialog-button"
            @click.prevent="openFileDialog"
          >
            {{ $t('file-field.open-dialog-button-text') }}
            <span class="file-field__open-dialog-button-underline" />
          </button>
        </h6>
        <p class="file-field__require">
          {{ $t('file-field.require') }}
        </p>
      </div>
      <div v-show="isOverDropZone" class="file-field__drag-block">
        <icon class="file-field__drag-icon" :name="$icons.cloudUpload" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { useContext } from '@/composables'
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
    accept: '',
    isReadonly: false,
  },
)

const checkType = (files: FileList | File[]) => {
  const fileMIMEType = files[0].type
  if (!$config.FILE_MIME_TYPES.find(type => type === fileMIMEType)) {
    throw new Error('Uncorrect format')
  }
}

const { $config } = useContext()

const dropZone = ref<HTMLLabelElement>()
const { isOverDropZone } = useDropZone(dropZone, (files: File[] | null) => {
  if (files) {
    try {
      checkType(files)
    } catch (error) {
      ErrorHandler.process(error, 'Uncorrect file type')
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
      } catch (err) {
        ErrorHandler.process(err, 'Uncorrect file type')
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
  width: toRem(544);
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
  font-size: toRem(14);
  line-height: toRem(20);
  font-weight: 400;
}

.file-field__cancel-button {
  margin-left: auto;
  height: toRem(24);
  width: toRem(24);
  fill: var(--col-fancy);
  flex-shrink: 0;

  &:hover {
    fill: var(--col-accent);
  }

  &:active {
    fill: var(--col-spot);
  }
}

.file-field__drop-zone {
  position: relative;
  background: url('/branding/background-file-field-drop-zone.png');
  display: flex;
  margin: auto;
  height: toRem(257);
  width: toRem(544);
  border-radius: var(--border-radius);

  &:hover,
  &--active {
    background: url('/branding/background-file-field-drop-zone-active.png');
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

.file-field__not-drag-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin: auto;
}

.file-field__icon {
  width: toRem(40);
  height: toRem(40);
}

.file-field__drag-block {
  margin: auto;
}

.file-field__drag-icon {
  height: toRem(80);
  width: toRem(80);
}

.file-field__title {
  font-size: toRem(20);
  line-height: 1.4;
  margin-top: toRem(16);
}

.file-field__open-dialog-button {
  position: relative;
  z-index: 100;
  font-size: inherit;
  line-height: inherit;
  color: var(--col-primary);

  &:hover {
    color: var(--col-basic);
  }

  &:active {
    color: var(--col-initial);
  }
}

.file-field__open-dialog-button-underline {
  position: absolute;
  bottom: toRem(1.7);
  display: block;
  height: toRem(0.8);
  width: 100%;
  background: var(--col-primary);
}

.file-field__require {
  font-family: 'Inter', 'Arial', sans-serif;
  color: var(--col-fine);
  font-size: toRem(16);
  font-weight: 400;
  line-height: 1.5;
  margin-top: toRem(8);
}
</style>
