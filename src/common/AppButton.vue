<template>
  <button
    class="app-button"
    :class="{
      'app-button--waiting': isWaiting,
      [`app-button--${preset}`]: !!preset,
    }"
    :disabled="isDisabled || isWaiting"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

type PRESETS = 'primary' | 'outline-brittle'

withDefaults(
  defineProps<{
    text?: string
    preset?: PRESETS
    isWaiting?: boolean
  }>(),
  {
    text: '',
    preset: undefined,
    isWaiting: false,
  },
)

const attrs = useAttrs()

const isDisabled = computed(() =>
  ['', 'disabled', true].includes(attrs.disabled as string | boolean),
)
</script>

<style lang="scss" scoped>
.app-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: toRem(52);
  border-radius: var(--border-radius);
  transition-property: border, background-color, color, fill, stroke;
  transition-duration: var(--transition-duration);

  &--not-allowed {
    cursor: not-allowed;
  }

  &--none-events {
    pointer-events: none;
  }

  &--outline-brittle {
    border: toRem(1) solid var(--col-brittle);
    color: var(--col-trendy);
    fill: var(--col-trendy);

    &:not([disabled]):hover {
      border-color: var(--col-flexible);
    }

    &:not([disabled]):active,
    &.app-button--waiting {
      border-color: var(--col-primary);
    }
  }

  &--primary {
    background: var(--col-primary);
    color: var(--col-intense);
    fill: var(--col-intense);

    &:not([disabled]):hover {
      background: var(--col-basic);
    }

    &:not([disabled]):active {
      background: var(--col-initial);
    }

    &.app-button--waiting {
      background: var(--col-original);
    }

    &:not(.app-button--waiting):disabled {
      background: var(--col-negative);
      color: var(--col-positive);
      fill: var(--col-positive);
    }
  }

  &:disabled {
    cursor: not-allowed;

    &.app-button--waiting {
      cursor: wait;
    }
  }

  @include body-large;

  @include respond-to('tablet') {
    height: toRem(48);
  }
}
</style>
