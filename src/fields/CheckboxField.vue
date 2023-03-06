<template>
  <div class="checkbox-field">
    <label
      class="checkbox-field__label"
      :class="{ 'checkbox-field__label--checked': modelValue }"
    >
      <span class="checkbox-field__icon-wrp">
        <icon :name="modelValue ? $icons.checkboxChecked : $icons.checkbox" />
        <input
          class="checkbox-field__input"
          type="checkbox"
          :checked="modelValue"
          v-bind="$attrs"
          @change="updateModelValue"
        />
      </span>
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
.checkbox-field__label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: var(--transition-duration);
  fill: var(--col-brittle);
  width: max-content;

  &:not([disabled]):hover {
    fill: var(--col-flexible);
  }

  &:not([disabled]):active {
    fill: var(--col-initial);
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

.checkbox-field__icon-wrp {
  position: relative;
  display: block;
  width: toRem(24);
  height: toRem(24);

  @include respond-to(tablet) {
    width: toRem(20);
    height: toRem(20);
  }
}

.checkbox-field__input {
  position: absolute;
  width: toRem(0.1);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  z-index: var(--z-layer-negative-1);
}

.checkbox-field__label-message {
  margin-left: toRem(8);

  @include body-large-inter;
}
</style>
