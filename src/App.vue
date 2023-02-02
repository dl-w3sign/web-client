<template>
  <div v-if="isAppInitialized" class="app__wrapper" ref="appWrapper">
    <div class="app__scroll">
      <app-navbar class="app__navbar" />
      <router-view v-slot="{ Component, route }" v-show="isContentShown">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component class="app__main" :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppNavbar } from '@/common'
import { useNotifications, useContext } from '@/composables'
import { IMAGE_SOURCES, APP_KEYS } from '@/enums'
import { ErrorHandler, Bus } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { DesignatedProvider } from '@/types'
import { ref, provide } from 'vue'

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

const appWrapper = ref<HTMLDivElement>()
const setAppWrapperBackground = (url?: IMAGE_SOURCES): void => {
  if (appWrapper.value) {
    url
      ? (appWrapper.value.style.backgroundImage = `url(${url})`)
      : (appWrapper.value.style.backgroundImage = '')
  }
}

const isContentShown = ref(true)
const hideContent = () => {
  isContentShown.value = false
}
const showContent = () => {
  isContentShown.value = true
}

provide(APP_KEYS.setAppWrapperBackground, setAppWrapperBackground)

Bus.on(Bus.eventList.openModal, hideContent)
Bus.on(Bus.eventList.closeModal, showContent)

init()
</script>

<style lang="scss" scoped>
.app__wrapper {
  min-height: vh(100);
  background-image: url('/branding/background-main.jpg');
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  transition: background-image var(--transation-duration-slow) ease-in-out;
  -webkit-transition: background-image var(--transation-duration-slow)
    ease-in-out;
}

.app__scroll {
  overflow-y: scroll;
  height: 100vh;
  width: 100vw;
}

.app__navbar {
  position: fixed;
  z-index: 1000;
  margin: toRem(60) 2.365% 0;
  width: calc(100% - 2.365% * 2);
}

.app__main {
  position: relative;
  top: toRem(180);
}

.fade-enter-active {
  animation: fade-in var(--transation-duration-slow);
}

.fade-leave-active {
  animation: fade-in var(--transation-duration-slow) reverse;
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
