<template>
  <div
    class="checkbox-field"
    :class="modelValue ? 'checkbox-field--checked' : ''"
  >
    <label v-if="label" class="checkbox-field__label">
      <input
        class="checkbox-field__input"
        type="checkbox"
        :checked="modelValue"
        @change="updateModelValue"
      />
      <icon
        class="checkbox-field__icon"
        :name="modelValue ? $icons.checkboxChecked : $icons.checkbox"
      />
      <span class="checkbox-field__label-message">
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
  gap: toRem(11);
  width: max-content;
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
}

.checkbox-field__label-message {
  font-family: 'Inter', 'Arial', sans-serif;
  font-size: toRem(16);
  font-weight: 400;
  line-height: 1.5;
}
</style>
