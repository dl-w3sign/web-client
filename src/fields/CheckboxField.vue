<template>
  <div class="checkbox-field">
    <div class="checkbox-field__wrapper">
      <input
        class="checkbox-field__input"
        type="checkbox"
        :id="`checkbox-field--${uid}`"
        :checked="modelValue"
        :disabled="isDisabled"
        @change="updateModelValue"
      />
      <div class="checkbox-field__inner">
        <label
          v-if="label"
          class="checkbox-field__label"
          :for="`checkbox-field--${uid}`"
        >
          {{ label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from 'vue'

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const uid = getCurrentInstance()?.uid
withDefaults(
  defineProps<{
    modelValue: boolean
    label?: string
    isDisabled: boolean
  }>(),
  {
    label: '',
    isDisabled: false,
  },
)

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  emit('update:modelValue', eventTarget.checked)
}
</script>

<style lang="scss" scoped>
.checkbox-field__wrapper {
  position: relative;
}

.checkbox-field__input {
  position: absolute;
  display: block;
  width: toRem(16);
  height: toRem(16);
  margin: 0;
}

.checkbox-field__inner {
  padding-left: toRem(24);
}
</style>
