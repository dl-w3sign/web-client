<template>
  <transition name="fade">
    <div v-if="isAppInitialized" class="app__wrapper">
      <app-navbar class="app__navbar" />
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component class="app__main" :is="Component" />
        </transition>
      </router-view>
    </div>
    <div v-else class="app__init">
      <animation class="app__loader" :animation-data="LoaderJSON" is-infinite />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { AppNavbar, Animation } from '@/common'
import { useNotifications, useContext } from '@/composables'
import { ErrorHandler } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { DesignatedProvider } from '@/types'
import { ref } from 'vue'
import LoaderJSON from '../loader.json'

const web3Store = useWeb3ProvidersStore()
const { provider: web3Provider } = useWeb3ProvidersStore()
const { $config } = useContext()

const isAppInitialized = ref(false)
const init = async () => {
  try {
    useNotifications()

    await web3Store.detectProviders()

    if (web3Store.metamask)
      web3Provider.init(web3Store.metamask as DesignatedProvider)

    document.title = $config.APP_NAME
  } catch (error) {
    ErrorHandler.process(error)
  }
  isAppInitialized.value = true
}

init()
</script>

<style lang="scss" scoped>
.app__wrapper {
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
  height: calc(100vh - toRem(80));

  @include respond-to(850px) {
    height: calc(100vh - toRem(72));
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
