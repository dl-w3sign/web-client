<script lang="ts" setup>
import { Icon } from '@/common'
import { useContext } from '@/composables'
import { ErrorHandler, getFileIconName } from '@/helpers'
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

<template>
  <div class="file-field">
    <div v-if="modelValue" class="file-field__file-info">
      <icon class="file-field__file-icon" :name="getFileIconName(modelValue)" />
      <h5 class="file-field__file-name">
        {{ modelValue.name }}
      </h5>
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
        </h6>
        <p class="file-field__require">
          {{ $t('file-field.require') }}
        </p>
        <button class="file-field__open-button" @click.prevent="openFileDialog">
          {{ $t('file-field.label') }}
        </button>
      </div>
      <div v-show="isOverDropZone" class="file-field__drag-block">
        <icon class="file-field__drag-icon" :name="$icons.cloudUploadActive" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-field__file-info {
  background: url('/branding/background-file-field-file-info.svg');
  display: flex;
  align-items: center;
  padding: 0 toRem(20);
  gap: toRem(12);
  height: toRem(77);
  width: toRem(523);
}

.file-field__file-name {
  font-size: toRem(20);
  line-height: toRem(23);
  font-weight: 600;
  letter-spacing: -0.015em;
  max-width: 80%;

  @include text-ellipsis;
}

.file-field__cancel-button {
  margin-left: auto;
  height: toRem(24);
  width: toRem(24);
  fill: var(--col-primary);
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
  height: toRem(172);
  width: toRem(523);
  border-radius: var(--border-radius);

  &:hover,
  &--active {
    background: url('/branding/background-file-field-drop-zone-active.png');
  }
}

.file-field__not-drag-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin: auto;
}

.file-field__drag-block {
  margin: auto;
}

.file-field__icon {
  width: toRem(44.24);
  height: toRem(44.24);
}

.file-field__drag-icon {
  width: toRem(80);
}

.file-field__file-icon {
  max-width: toRem(27.8);
}

.file-field__title {
  font-size: toRem(14);
  line-height: toRem(16);
  margin-top: toRem(10);
  color: var(--col-wet);
}

.file-field__require {
  color: var(--col-secondary);
  font-size: toRem(12);
  line-height: toRem(14);
  margin-top: toRem(4);
}

.file-field__open-button {
  position: relative;
  padding: toRem(10) toRem(16);
  font-size: toRem(12);
  line-height: toRem(14);
  color: var(--col-peaceful);
  border: toRem(1) solid var(--col-peaceful);
  border-radius: toRem(5);
  margin-top: toRem(10);
  text-transform: uppercase;

  &:hover {
    color: var(--col-quiet);
    border-color: var(--col-quiet);
  }

  &:active {
    color: var(--col-calm);
    border-color: var(--col-calm);
  }
}

.file-field__drop-zone-label {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  cursor: pointer;
}
</style>
