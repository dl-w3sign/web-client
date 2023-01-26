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
        @click.prevent="copy()"
      >
        <icon
          class="input-field__icon input-field__icon--copy"
          :name="copied ? $icons.check : $icons.clipboardCopy"
        />
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

const { copy, copied } = useClipboard({
  source: props.modelValue,
  copiedDuring: 5000,
})
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

  &--copied,
  &--with-right-icon {
    padding-right: toRem(64);
  }
}

.input-field__copy-button {
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
}

.input-field__icon {
  position: absolute;
  top: toRem(16);
  right: 0;
  height: toRem(24);
  width: toRem(24);
  margin: auto toRem(24) auto toRem(16);
  color: var(--col-intense);

  &--copy {
    color: inherit;
  }
}
</style>
