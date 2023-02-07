<template>
  <div class="textarea-field">
    <label
      v-if="label"
      class="textarea-field__label"
      :for="`textarea-field--${uid}`"
    >
      {{ label }}
    </label>
    <div class="textarea-field__textarea-wrapper">
      <textarea
        ref="textarea"
        class="textarea-field__textarea"
        :class="[
          isReadonly ? 'textarea-field__textarea--readonly' : '',
          isCopied ? 'textarea-field__textarea--copied' : '',
          rightIcon ? 'textarea-field__textarea--with-right-icon' : '',
        ]"
        :id="`textarea-field--${uid}`"
        :readonly="isReadonly || isCopied"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateModelValue"
      />
      <app-button
        v-if="isCopied"
        class="textarea-field__copy-button"
        @click.prevent="copy()"
      >
        <icon
          class="textarea-field__icon"
          :name="copied ? $icons.check : $icons.clipboardCopy"
        />
      </app-button>
      <icon
        v-else-if="rightIcon"
        :name="rightIcon"
        class="textarea-field__icon"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon, AppButton } from '@/common'
import { useClipboard } from '@vueuse/core'
import { ICON_NAMES } from '@/enums'
import { getCurrentInstance } from 'vue'
import { useTextareaAutosize, useWindowSize } from '@vueuse/core'

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  emit('update:modelValue', eventTarget.value)
}

const uid = getCurrentInstance()?.uid
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    isReadonly?: boolean
    isCopied?: boolean
    rightIcon?: ICON_NAMES
  }>(),
  {
    label: '',
    placeholder: '',
    isReadonly: false,
    isCopied: false,
    rightIcon: undefined,
  },
)

const { copy, copied } = useClipboard({
  source: props.modelValue,
  copiedDuring: 5000,
})

const { width: windowWidth } = useWindowSize()
const { textarea } = useTextareaAutosize({
  watch: windowWidth,
})
</script>

<style lang="scss" scoped>
.textarea-field__label {
  display: block;
  margin-bottom: toRem(8);

  @include field-label;
}

.textarea-field__textarea-wrapper {
  position: relative;
}

.textarea-field__textarea {
  display: block;
  width: 100%;

  &--copied,
  &--with-right-icon {
    padding-right: toRem(64);

    @include respond-to(850px) {
      padding-right: toRem(40);
    }
  }
}

.textarea-field__icon {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  height: toRem(24);
  width: toRem(24);
  margin: auto toRem(24) auto toRem(16);
  color: var(--col-intense);
  flex-shrink: 0;

  @include respond-to(850px) {
    height: toRem(20);
    width: toRem(20);
    margin: auto toRem(12) auto toRem(8);
  }
}

.textarea-field__copy-button {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: toRem(64);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  color: var(--col-primary);

  &:hover {
    background: var(--col-basic);
    color: var(--col-intense);
  }

  &:active {
    background: var(--col-initial);
    color: var(--col-intense);
  }

  & .textarea-field__icon {
    position: static;
    color: inherit;
    transition: var(--transition-duration);
  }

  @include respond-to(850px) {
    width: toRem(32);
  }
}
</style>
