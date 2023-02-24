<template>
  <div class="notification">
    <icon class="notification__icon" :name="iconName" />
    <p class="notification__message">
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { ICON_NAMES } from '@/enums'

withDefaults(
  defineProps<{
    message: string
    iconName?: ICON_NAMES
  }>(),
  {
    iconName: ICON_NAMES.check,
  },
)
</script>

<style lang="scss">
@import 'vue-toastification/src/scss/index';

.Vue-Toastification__toast {
  align-items: center;
  cursor: default;

  &--default,
  &--info {
    color: var(--col-primary);

    @include note-info;
  }

  &--success {
    color: var(--col-intense);

    @include note-success;
  }

  &--error {
    color: var(--col-accent);

    @include note-error;
  }

  &--warning {
    color: var(--col-wise);

    @include note-warning;
  }

  @include note;

  @include respond-to(601px) {
    border-radius: 0;
  }
}

.Vue-Toastification__close-button {
  position: absolute;
  top: toRem(8);
  right: toRem(16);
  opacity: 1;
  height: toRem(24);
  align-items: flex-start;
  transition: var(--transition-duration);
  color: var(--col-negative);

  &:hover {
    color: var(--col-fancy);
  }

  &:active {
    color: var(--col-trendy);
  }
}

.notification {
  display: flex;
  gap: toRem(8);
  padding-right: toRem(20);
}

.notification .notification__icon {
  max-width: toRem(24);
  max-height: toRem(24);
}

.notification__message {
  color: var(--col-trendy);
}
</style>
