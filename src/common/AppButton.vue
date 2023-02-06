<template>
  <button
    class="app-button"
    :class="[
      state ? `app-button--${state}` : '',
      preset ? `app-button--${preset}` : '',
    ]"
    :disabled="state === 'not-allowed' || state === 'waiting' || isDisabled"
    v-bind="$attrs"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script lang="ts" setup>
import { BUTTON_STATES, BUTTON_PRESETS } from '@/enums'

withDefaults(
  defineProps<{
    text?: string
    state?: BUTTON_STATES
    preset?: BUTTON_PRESETS
    isDisabled?: boolean
  }>(),
  {
    text: '',
    state: undefined,
    preset: undefined,
    isDisabled: false,
  },
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
  transition: var(--transition-duration);

  &--waiting {
    cursor: wait;
  }

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

    &.app-button--none-events {
      background: var(--col-negative);
      color: var(--col-positive);
      fill: var(--col-positive);
    }
  }

  @include text-1;

  @include respond-to(850px) {
    height: toRem(48);

    @include text-5;
  }
}
</style>
