<template>
  <header class="app-navbar">
    <router-link to="/" class="app-navbar__logo">
      {{ $t('navbar.logo') }}
    </router-link>
    <connect-ethereum
      class="app-navbar__connect-ethereum"
      :button-preset="BUTTON_PRESETS.outlineBrittle"
    />
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
  justify-content: space-between;
  padding: 0 6.7%;
  height: toRem(80);
  background: var(--col-intense);
  box-shadow: 0 toRem(4) toRem(24) var(--col-rare);
}

.app-navbar__logo {
  font-weight: 700;
  font-size: toRem(32);
  color: var(--col-trendy);

  &:active,
  &:hover {
    color: var(--col-dense);
  }
}

.app-navbar__connect-ethereum {
  height: toRem(48);
  width: toRem(253);
}
</style>
