<template>
  <div class="input-field">
    <label v-if="label" class="input-field__label" :for="`input-field--${uid}`">
      {{ label }}
    </label>
    <div class="input-field__input-wrapper">
      <input
        v-bind="$attrs"
        class="input-field__input"
        :class="{
          'input-field__input--with-left-icon': leftIconName,
          'input-field__input--with-right-icon': rightIconName,
        }"
        :id="`input-field--${uid}`"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateModelValue"
      />
      <icon
        v-if="leftIconName || rightIconName"
        class="input-field__icon"
        :class="
          leftIconName ? 'input-field__icon--left' : 'input-field__icon--right'
        "
        :name="leftIconName ? leftIconName : (rightIconName as ICON_NAMES)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { ICON_NAMES } from '@/enums'
import { v4 as generateUid } from 'uuid'

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  emit('update:modelValue', eventTarget.value)
}

const uid = generateUid()
withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    leftIconName?: ICON_NAMES
    rightIconName?: ICON_NAMES
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    leftIconName: undefined,
    rightIconName: undefined,
  },
)
</script>

<style lang="scss" scoped>
.input-field {
  transition: var(--transition-duration);
}

.input-field__label {
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

  @include respond-to(tablet) {
    height: toRem(20);
    width: toRem(20);
  }
}

.input-field__input {
  display: block;
  width: 100%;
  transition: var(--transition-duration);

  &--with-left-icon {
    padding-left: toRem(49);

    @include respond-to(tablet) {
      padding-left: toRem(41);
    }
  }

  & ~ .input-field__icon {
    top: 0;
    bottom: 0;
    margin: auto 0;

    &--left {
      left: toRem(16);

      @include respond-to(tablet) {
        left: toRem(12);
      }
    }

    &--right {
      right: toRem(16);

      @include respond-to(tablet) {
        right: toRem(12);
      }
    }
  }
}
</style>
