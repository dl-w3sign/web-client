<template>
  <transition name="fade">
    <div v-if="isAppInitialized">
      <app-navbar class="app__navbar" />
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component class="app__main" :is="Component" />
        </transition>
      </router-view>
    </div>
    <animation
      v-else
      class="app__init"
      :animation-data="LoaderJSON"
      :is-infinite="true"
    />
  </transition>
</template>

<script lang="ts" setup>
import { AppNavbar, Animation } from '@/common'
import { useNotifications, useProvider, useContext } from '@/composables'
import { APP_KEYS } from '@/enums'
import { Bus, ErrorHandler } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { DesignatedProvider } from '@/types'
import { ref, provide } from 'vue'
import LoaderJSON from '../loader.json'

const web3Store = useWeb3ProvidersStore()
const web3Provider = useProvider()
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

provide(APP_KEYS.web3Provider, web3Provider)

init()
</script>

<style lang="scss" scoped>
.app__navbar {
  position: fixed;
  z-index: var(--z-app-navbar);
  width: 100%;
}

.app__main {
  position: absolute;
  top: toRem(80);
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  height: calc(100vh - toRem(80));
  width: 100vw;
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
