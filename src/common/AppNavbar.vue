<template>
  <header class="app-navbar">
    <div class="app-navbar__container">
      <svg class="app-navbar__logo">
        <use href="/branding/logo.svg#logo" />
      </svg>
      <connect-ethereum
        class="app-navbar__connect-ethereum"
        :button-preset="BUTTON_PRESETS.outlineBrittle"
      />
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ConnectEthereum } from '@/common'
import { BUTTON_PRESETS } from '@/enums'
</script>

<style lang="scss" scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--col-intense);
  box-shadow: 0 toRem(4) toRem(24) var(--col-rare);
}

.app-navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6.7%;
  width: 100%;
  max-width: toRem(1440);

  @include respond-to(850px) {
    padding: 0 4.5%;
  }
}

.app-navbar__logo {
  height: toRem(48);
  width: toRem(48);
  color: var(--col-intense);
  fill: var(--col-trendy);
  transition: var(--transition-duration);

  &:hover {
    color: var(--col-quiet);
    fill: var(--col-primary);
  }
}

.app-navbar__connect-ethereum {
  height: toRem(48);
  width: toRem(226);

  @include text-5;

  @include respond-to(850px) {
    width: toRem(216);
  }
}
</style>
