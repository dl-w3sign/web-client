<template>
  <div class="invalid-network-illustration">
    <div class="invalid-network-illustration__header">
      <div
        v-for="n in 3"
        :key="n"
        class="invalid-network-illustration__header-circle"
      />
    </div>
    <div class="invalid-network-illustration__main">
      <h2
        :class="[
          'invalid-network-illustration__skeleton',
          'invalid-network-illustration__skeleton--large',
        ]"
      />
      <div class="invalid-network-illustration__signer-address">
        <div class="invalid-network-illustration__signer-avatar" />
        <div class="invalid-network-illustration__skeleton" />
        <icon
          class="invalid-network-illustration__icon"
          :name="$icons.xCircle"
        />
      </div>
      <h2
        :class="[
          'invalid-network-illustration__skeleton',
          'invalid-network-illustration__skeleton--large',
        ]"
      />
      <div
        class="invalid-network-illustration__signer-address"
        v-for="n in 2"
        :key="n"
      >
        <div
          :class="[
            'invalid-network-illustration__signer-avatar',
            'invalid-network-illustration__signer-avatar--raw',
          ]"
        />
        <div class="invalid-network-illustration__skeleton" />
        <icon
          class="invalid-network-illustration__icon"
          :name="$icons.checkCircle"
        />
      </div>
      <icon
        class="invalid-network-illustration__cursor"
        :name="$icons.cursorAllow"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
</script>

<style lang="scss" scoped>
.invalid-network-illustration {
  display: flex;
  flex-direction: column;
  height: toRem(246);
  width: toRem(246);
  flex-shrink: 0;
}

.invalid-network-illustration__header {
  display: flex;
  align-items: center;
  gap: toRem(6);
  flex-shrink: 0;
  padding: 0 toRem(14);
  height: toRem(24);
  background: var(--col-home);
  border-top-right-radius: toRem(14);
  border-top-left-radius: toRem(14);
}

.invalid-network-illustration__header-circle {
  height: toRem(6);
  width: toRem(6);
  background: var(--col-unique);
  border-radius: 50%;
  transition: background-color var(--transition-duration);

  &:hover {
    &:nth-of-type(1) {
      background: var(--col-creative);
    }

    &:nth-of-type(2) {
      background: var(--col-implicit);
    }

    &:nth-of-type(3) {
      background: var(--col-visual);
    }
  }
}

.invalid-network-illustration__main {
  position: relative;
  background: var(--col-rich);
  border-bottom-right-radius: toRem(14);
  border-bottom-left-radius: toRem(14);
  padding: toRem(20.97) toRem(14.78) toRem(29.63) toRem(13.73);
  height: 100%;
}

.invalid-network-illustration__skeleton {
  background: var(--col-raw);
  border-radius: toRem(4.2);
  height: toRem(8.45);
  width: toRem(118.25);

  &--large {
    border-radius: toRem(6);
    height: toRem(12.67);
    width: toRem(114);
    margin: 0 0 toRem(13.78) toRem(2.11);

    &:not(:first-of-type) {
      margin-top: toRem(26.24);
      margin-bottom: toRem(16.33);
    }
  }

  @include shimmer-animation;
}

.invalid-network-illustration__signer-address {
  display: flex;
  align-items: center;
  gap: toRem(4.22);
  background: var(--col-modest);
  height: toRem(25.34);
  width: 100%;
  border-radius: toRem(11.5);
  margin-top: toRem(13.69);
  padding: 0 toRem(8.45);

  @include shimmer-animation;
}

.invalid-network-illustration__signer-avatar {
  height: toRem(16.89);
  width: toRem(16.89);
  background: var(--col-calm);
  border-radius: 50%;

  &--raw {
    background: var(--col-raw);
  }

  @include shimmer-animation;
}

.invalid-network-illustration__icon {
  height: toRem(13.78);
  width: toRem(13.78);
  margin-left: auto;
  color: var(--col-intense);
  fill: var(--col-accent);
}

.invalid-network-illustration__cursor {
  position: absolute;
  height: toRem(24);
  width: toRem(24);
  bottom: toRem(61);
  left: toRem(78);
}
</style>
