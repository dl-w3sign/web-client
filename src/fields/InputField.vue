<template>
  <div class="input-field">
    <label v-if="label" class="input-field__label" :for="`input-field--${uid}`">
      {{ label }}
    </label>
    <div class="input-field__input-wrapper">
      <input
        class="input-field__input"
        :class="{ 'input-field__input--with-right-icon': rightIconName }"
        :id="`input-field--${uid}`"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateModelValue"
      />
      <icon
        v-if="rightIconName"
        :name="rightIconName"
        class="input-field__icon"
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
    modelValue: string
    label?: string
    placeholder?: string
    rightIconName?: ICON_NAMES
  }>(),
  {
    label: '',
    placeholder: '',
    rightIconName: undefined,
  },
)
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

  &--with-right-icon {
    padding-right: toRem(64);
  }
}

.input-field__icon {
  position: absolute;
  top: 0;
  right: 0;
  height: toRem(24);
  width: toRem(24);
  margin: auto toRem(24) auto toRem(16);
  color: var(--col-intense);
}
</style>
