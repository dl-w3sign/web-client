<template>
  <transition name="fade">
    <div v-if="isAppInitialized" class="app__wrapper">
      <app-navbar class="app__navbar" />
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component class="app__main" :is="Component" />
        </transition>
      </router-view>
      <invalid-network-modal
        :is-shown="web3Store.isInvalidNetworkModalShown"
        @update:is-shown="web3Store.isInvalidNetworkModalShown = false"
      />
    </div>
    <div v-else class="app__init">
      <animation class="app__loader" :animation-data="LoaderJSON" is-infinite />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { AppNavbar, Animation } from '@/common'
import { useViewportSize, useNotifications, useContext } from '@/composables'
import { ErrorHandler } from '@/helpers'
import { InvalidNetworkModal } from '@/modals'
import { useWeb3ProvidersStore } from '@/store'
import { ref, watch } from 'vue'
import LoaderJSON from '../loader.json'

const web3Store = useWeb3ProvidersStore()
const { $config } = useContext()
const { assignVhCssVariable } = useViewportSize()

const isAppInitialized = ref(false)
const init = async () => {
  try {
    assignVhCssVariable()
    useNotifications()

    await web3Store.detectProviders()

    if (web3Store.metamask) await web3Store.provider.init(web3Store.metamask)

    document.title = $config.APP_NAME
  } catch (error) {
    ErrorHandler.process(error)
  }

  isAppInitialized.value = true

  if (web3Store.provider.isConnected && !web3Store.hasValidCurrentChain)
    web3Store.showInvalidNetworkModal()
}

init()

watch(
  () => web3Store.hasValidCurrentChain,
  newValue => {
    if (!newValue) web3Store.showInvalidNetworkModal()
  },
)
</script>

<style lang="scss" scoped>
.app__wrapper {
  position: relative;
  min-width: toRem(380);
}

.app__navbar {
  height: toRem(80);

  @include respond-to(850px) {
    height: toRem(72);
  }
}

.app__main {
  overflow-y: scroll;
  height: calc(vh(100) - toRem(80));

  @include respond-to(850px) {
    height: calc(vh(100) - toRem(72));
  }

  @include respond-to(380px) {
    height: max-content;
  }
}

.app__loader {
  max-height: toRem(500);
  max-width: toRem(500);
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
