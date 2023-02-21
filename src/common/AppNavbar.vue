<template>
  <header class="app-navbar">
    <div class="app-navbar__container">
      <svg class="app-navbar__logo">
        <use href="/branding/logo.svg#logo" />
      </svg>
      <transition name="fade">
        <switch-ethereum
          v-if="web3Provider?.isConnected"
          class="app-navbar__switch-ethereum"
        />
      </transition>
      <connect-ethereum
        class="app-navbar__connect-ethereum"
        :button-preset="BUTTON_PRESETS.outlineBrittle"
      />
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ConnectEthereum, SwitchEthereum } from '@/common'
import { BUTTON_PRESETS } from '@/enums'
import { useWeb3ProvidersStore } from '@/store'

const { provider: web3Provider } = useWeb3ProvidersStore()
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
  gap: toRem(16);
  padding: 0 6.7%;
  width: 100%;
  max-width: toRem(1440);

  @include respond-to(850px) {
    gap: toRem(8);
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

  @include respond-to(850px) {
    height: toRem(44);
    width: toRem(44);
  }
}

.app-navbar__connect-ethereum {
  height: toRem(48);
  width: toRem(218);

  @include text-5;

  @include respond-to(850px) {
    width: toRem(208);
  }
}

.app-navbar__switch-ethereum {
  z-index: var(--z-switch-ethereum);
  height: toRem(48);
  width: toRem(179);
  margin-left: auto;

  // stylelint-disable-next-line
  :deep(#dropdown) {
    margin-top: toRem(24);
    width: toRem(179);

    @include respond-to(850px) {
      margin-top: toRem(16);
    }

    @include respond-to(580px) {
      position: absolute;
      top: toRem(80);
      right: toRem(16);
      margin-top: 0;
    }
  }

  @include respond-to(580px) {
    width: toRem(64);
  }
}

.fade-enter-active {
  animation: fade-in var(--transition-duration-slow);
}

.fade-leave-active {
  animation: fade-in var(--transition-duration-slow) reverse;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
