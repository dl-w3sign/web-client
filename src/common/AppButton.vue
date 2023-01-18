<template>
  <button
    class="app-button"
    :class="[
      state ? `app-button--${state}` : '',
      preset ? `app-button--${preset}` : '',
    ]"
    :disabled="state === 'not-allowed' || state === 'waiting'"
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
  }>(),
  {
    text: '',
    state: undefined,
    preset: undefined,
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
  font-size: toRem(16);
  font-weight: 500;

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

  &--outline-primary {
    border: toRem(1) solid var(--col-primary);
    color: var(--col-primary);
    fill: var(--col-primary);

    &:not([disabled]):hover {
      border-color: var(--col-basic);
      background: var(--col-basic);
      color: var(--col-intense);
      fill: var(--col-intense);
    }

    &:not([disabled]):active,
    &.app-button--waiting {
      border-color: var(--col-initial);
      background: var(--col-initial);
      color: var(--col-intense);
      fill: var(--col-intense);
    }
  }

  &--genius {
    background: var(--col-genius);
    color: var(--col-intense);

    &:not([disabled]):hover {
      background-color: var(--col-wise);
    }

    &:not([disabled]):active,
    &.app-button--waiting {
      background-color: var(--col-smart);
    }
  }

  &--outline-accent {
    border: toRem(1) solid var(--col-speck);
    color: var(--col-speck);
    fill: var(--col-speck);

    &:not([disabled]):hover {
      border-color: var(--col-accent);
      background: var(--col-accent);
      color: var(--col-intense);
      fill: var(--col-intense);
    }

    &:not([disabled]):active,
    &.app-button--waiting {
      border-color: var(--col-spot);
      background: var(--col-spot);
      color: var(--col-intense);
      fill: var(--col-intense);
    }
  }
}
</style>
