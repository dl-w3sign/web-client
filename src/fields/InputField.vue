<template>
  <div class="input-field">
    <label v-if="label" class="input-field__label" :for="`input-field--${uid}`">
      {{ label }}
    </label>
    <div class="input-field__input-wrapper">
      <input
        class="input-field__input"
        :class="[
          isReadonly ? 'input-field__input--readonly' : '',
          isCopied ? 'input-field__input--copied' : '',
          rightIcon ? 'input-field__input--with-right-icon' : '',
        ]"
        :id="`input-field--${uid}`"
        :readonly="isReadonly || isCopied"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateModelValue"
      />
      <app-button
        v-if="isCopied"
        class="input-field__copy-button"
        @click.prevent="copyContent"
      >
        <icon class="input-field__icon" :name="$icons.clipboardCopy" />
      </app-button>
      <icon v-else-if="rightIcon" :name="rightIcon" class="input-field__icon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon, AppButton } from '@/common'
import { getCurrentInstance } from 'vue'
import { useClipboard } from '@vueuse/core'
import { ICON_NAMES } from '@/enums'

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

const { copy } = useClipboard()
const copyContent = () => {
  copy(props.modelValue)
}
</script>

<style lang="scss" scoped>
.input-field__label {
  display: block;
  margin-bottom: toRem(8);

  @include field-label;
}

.input-field__input-wrapper {
  position: relative;
}

.input-field__input {
  display: block;
  width: 100%;

  &--readonly {
    @include field-readonly;
  }

  &--copied {
    font-size: toRem(14);
    border: none;
    background: var(--col-lucky);
    color: var(--col-home);
    padding: toRem(13.5) toRem(59) toRem(13.5) toRem(12);
    border-radius: toRem(2);
  }

  &--with-right-icon {
    padding-right: toRem(59);
  }

  &::placeholder {
    @include field-placeholder;
  }

  @include field-text;

  @include field-border;
}

.input-field__copy-button {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: toRem(46);
  fill: var(--col-wet);
  border-radius: 0 toRem(2) toRem(2) 0;

  &:hover {
    fill: var(--col-crude);
  }

  &:active {
    fill: var(--col-alt);
  }
}

.input-field__icon {
  position: absolute;
  top: toRem(12);
  right: toRem(11);
  height: toRem(24);
  width: toRem(24);
}
</style>
