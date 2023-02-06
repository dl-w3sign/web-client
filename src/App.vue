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
  position: relative;
  height: 100vh;
  width: 100vw;

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-corner {
    background: var(--col-rarest);
  }

  @include respond-to(380px) {
    overflow: auto;
  }
}

.app__navbar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: var(--z-app-navbar);
  width: 100%;
  min-width: toRem(380);
}

.app__main {
  position: absolute;
  top: toRem(80);
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: scroll;
  height: calc(100vh - toRem(80));
  width: 100%;
  min-width: toRem(380);

  @include respond-to(850px) {
    top: toRem(72);
    height: calc(100vh - toRem(72));
  }

  @include respond-to(380px) {
    position: static;
    padding-top: toRem(72);
    height: max-content;
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
