<template>
  <div class="input-field">
    <label v-if="label" class="input-field__label" :for="`input-field--${uid}`">
      {{ label }}
    </label>
    <div class="input-field__input-wrapper">
      <input
        class="input-field__input"
        :class="[
          isCopied ? 'input-field__input--copied' : '',
          leftIcon ? 'input-field__input--with-left-icon' : '',
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
      <icon
        class="input-field__icon input-field__icon--left"
        v-else-if="leftIcon"
        :name="leftIcon"
      />
      <icon
        class="input-field__icon input-field__icon--right"
        v-else-if="rightIcon"
        :name="rightIcon"
      />
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
    leftIcon?: ICON_NAMES
    rightIcon?: ICON_NAMES
  }>(),
  {
    label: '',
    placeholder: '',
    isReadonly: false,
    isCopied: false,
    leftIcon: undefined,
    rightIcon: undefined,
  },
)

const { copy } = useClipboard()
const copyContent = () => {
  copy(props.modelValue)
}
</script>

<style lang="scss" scoped>
.input-field {
  transition: var(--transition-duration);
}

.input-field__label {
  display: block;
  margin-bottom: toRem(8);

  @include field-label;
}

.input-field__input-wrapper {
  position: relative;
}

.input-field__icon {
  position: absolute;
  height: toRem(24);
  width: toRem(24);
}

.input-field__input {
  display: block;
  width: 100%;

  &--copied,
  &--with-right-icon:read-only {
    padding-right: toRem(64);
  }

  &--with-left-icon {
    padding-left: toRem(49);
  }

  & ~ .input-field__icon {
    &--left {
      top: toRem(14);
      left: toRem(16);
    }
  }

  &:read-only ~ .input-field__icon {
    &--right {
      top: toRem(16);
      right: toRem(24);
    }
  }
}

.input-field__copy-button {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: toRem(64);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  stroke: var(--col-primary);

  &:hover {
    background: var(--col-basic);
    stroke: var(--col-intense);
  }

  &:active {
    background: var(--col-initial);
    stroke: var(--col-intense);
  }
}
</style>
