<template>
  <div class="notification">
    <icon class="notification__icon" :name="iconName" />
    <div class="notification__details">
      <h4 class="notification__title">
        {{ title }}
      </h4>
      <p class="notification__message">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { ICON_NAMES } from '@/enums'

withDefaults(
  defineProps<{
    title?: string
    message: string
    iconName?: ICON_NAMES
  }>(),
  {
    title: '',
    iconName: ICON_NAMES.check,
  },
)
</script>

<style lang="scss">
@import 'vue-toastification/src/scss/index';

.Vue-Toastification__toast {
  &--success {
    background: var(--col-fortunate);
  }

  &--error {
    background: var(--col-accent);
  }

  &--warning {
    background: var(--col-primary);
  }

  &--info {
    background: var(--col-glossy);
  }
}

.notification {
  display: grid;
  place-items: center;
  grid-template-columns: max-content 1fr;
  grid-gap: toRem(16);
}

.notification .notification__icon {
  max-width: toRem(48);
  max-height: toRem(48);
  fill: var(--col-intense);
}

.notification__details {
  display: grid;
  grid-gap: toRem(4);
  width: 100%;
}

.notification__title {
  color: var(--col-intense);
}

.notification__message {
  color: var(--col-intense);
}
</style>
