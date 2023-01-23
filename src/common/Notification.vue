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

<script lang="ts">
import { Icon } from '@/common'

import { defineComponent, PropType } from 'vue'
import { ICON_NAMES } from '@/enums'

export default defineComponent({
  name: 'notification',
  components: { Icon },
  props: {
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    iconName: {
      type: String as PropType<ICON_NAMES>,
      default: ICON_NAMES.check,
    },
  },
  setup() {
    return {}
  },
})
</script>

<style lang="scss">
@import 'vue-toastification/src/scss/index';

.Vue-Toastification__toast {
  &--success {
    @include note-success;
  }

  &--error {
    @include note-error;
  }

  @include note;
}

.Vue-Toastification__close-button {
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
}

.notification .notification__icon {
  max-width: toRem(24);
  max-height: toRem(24);
}

.notification__details {
  display: grid;
  grid-gap: toRem(4);
  width: 100%;
}

.notification__title {
  font-size: toRem(16);
  line-height: toRem(24);
  font-weight: 700;
}
</style>
