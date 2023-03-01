<template>
  <transition name="fade">
    <div v-if="isAppInitialized" class="app__wrapper">
      <app-navbar class="app__navbar" />
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component v-if="Component" :is="Component" class="app__main" />
          <div v-else class="app__main">
            <div class="app__loader-wrp">
              <animation
                class="app__loader"
                :animation-data="LoaderJSON"
                is-infinite
              />
            </div>
          </div>
        </transition>
      </router-view>
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
      await web3Provider.init(web3Store.metamask as DesignatedProvider)

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
  min-width: toRem(375);
}

.app__navbar {
  height: toRem(80);

  @include respond-to('tablet') {
    height: toRem(72);
  }
}

.app__main {
  overflow-y: scroll;
  height: calc(100vh - toRem(80));

  @include respond-to('tablet') {
    height: calc(100vh - toRem(72));
  }

  @include respond-to(375px) {
    height: max-content;
  }
}

.app__loader-wrp {
  height: 100%;
  display: flex;
}

.app__loader {
  margin: auto;
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
