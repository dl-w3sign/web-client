<template>
  <div
    class="checkbox-field"
    :class="{ 'checkbox-field--checked': modelValue }"
  >
    <label class="checkbox-field__label">
      <input
        v-bind="$attrs"
        class="checkbox-field__input"
        type="checkbox"
        :checked="modelValue"
        @change="updateModelValue"
      />
      <icon
        class="checkbox-field__icon"
        :name="modelValue ? $icons.checkboxChecked : $icons.checkbox"
      />
      <span v-if="label" class="checkbox-field__label-message">
        {{ label }}
      </span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

withDefaults(
  defineProps<{
    modelValue: boolean
    label?: string
  }>(),
  {
    label: '',
  },
)

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  emit('update:modelValue', eventTarget.checked)
}
</script>

<style lang="scss" scoped>
.checkbox-field {
  transition: var(--transition-duration);
  fill: var(--col-brittle);
  width: max-content;

  &:not([disabled]):hover {
    fill: var(--col-flexible);
  }

  &:not([disabled]):active {
    fill: var(--col-primary);
  }

  &--checked {
    fill: var(--col-primary);

    &:not([disabled]):hover {
      fill: var(--col-basic);
    }

    &:not([disabled]):active {
      fill: var(--col-initial);
    }
  }
}

.checkbox-field__label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-field__input {
  display: none;
}

.checkbox-field__icon {
  width: toRem(18);
  height: toRem(18);
  margin: toRem(3);

  @include respond-to('tablet') {
    width: toRem(15);
    height: toRem(15);
    margin: toRem(2.5);
  }
}

.checkbox-field__label-message {
  margin-left: toRem(8);

  @include body-large-inter;
}
</style>
