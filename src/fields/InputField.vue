<template>
  <div class="input-field">
    <label v-if="label" class="input-field__label" :for="`input-field--${uid}`">
      {{ label }}
    </label>
    <div class="input-field__input-wrapper">
      <input
        class="input-field__input"
        :class="{
          'input-field__input--with-left-icon': leftIcon,
        }"
        :id="`input-field--${uid}`"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateModelValue"
      />
      <icon
        class="input-field__icon input-field__icon--left"
        v-if="leftIcon"
        :name="leftIcon"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { getCurrentInstance } from 'vue'
import { ICON_NAMES } from '@/enums'

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  emit('update:modelValue', eventTarget.value)
}

const uid = getCurrentInstance()?.uid
withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    leftIcon?: ICON_NAMES
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    leftIcon: undefined,
  },
)
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
  color: var(--col-intense);
}

.input-field__input {
  display: block;
  width: 100%;

  &--with-left-icon {
    padding-left: toRem(49);
  }

  & ~ .input-field__icon {
    &--left {
      top: toRem(14);
      left: toRem(16);
    }
  }
}
</style>
