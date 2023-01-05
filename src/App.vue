<script lang="ts" setup>
import { AppNavbar } from '@/common'
import { useNotifications, useProvider } from '@/composables'
import { IMAGE_SOURCES, APP_KEYS } from '@/enums'
import { ErrorHandler, Bus } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { ref, provide } from 'vue'
import { config } from '@config'
import { DesignatedProvider } from '@/types'

const web3Store = useWeb3ProvidersStore()
const web3Provider = useProvider()

const isAppInitialized = ref(false)
const init = async () => {
  try {
    useNotifications()

    await web3Store.detectProviders()
    web3Provider.init(web3Store.metamask as DesignatedProvider)

    document.title = config.APP_NAME
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

provide(APP_KEYS.web3Provider, web3Provider)
provide(APP_KEYS.setAppWrapperBackground, setAppWrapperBackground)

Bus.on(Bus.eventList.openModal, hideContent)
Bus.on(Bus.eventList.closeModal, showContent)

init()
</script>

<template>
  <div v-if="isAppInitialized" class="app__wrapper" ref="appWrapper">
    <app-navbar class="app__navbar" />
    <router-view v-slot="{ Component, route }" v-show="isContentShown">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component class="app__main" :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>
.app__wrapper {
  min-height: vh(101);
  background-image: url('/branding/background-main.jpg');
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  transition: background-image var(--transation-duration-slow) ease-in-out;
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
