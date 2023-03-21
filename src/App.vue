<template>
  <transition name="fade">
    <div v-if="isAppInitialized" class="app__wrapper">
      <app-navbar class="app__navbar" />
      <div class="app__page">
        <router-view v-slot="{ Component, route }">
          <transition :name="route.meta.transition || 'fade'" mode="out-in">
            <component v-if="Component" :is="Component" class="app__main" />
            <div v-else class="app__main">
              <animation
                class="app__loader"
                :animation-data="LoaderJSON"
                is-infinite
              />
            </div>
          </transition>
        </router-view>
        <footer class="app__footer">
          <a href="https://github.com/dl-w3sign" target="_blank">
            {{ $t('footer.link-name-github') }}
          </a>
        </footer>
      </div>
      <invalid-network-modal
        :is-shown="web3Store.isInvalidNetworkModalShown"
        @update:is-shown="web3Store.isInvalidNetworkModalShown = false"
      />
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

  if (web3Store.provider.isConnected && !web3Store.isValidChain)
    web3Store.showInvalidNetworkModal()
}

init()

watch(
  () => web3Store.isValidChain,
  newValue => {
    newValue
      ? web3Store.hideInvalidNetworkModal()
      : web3Store.showInvalidNetworkModal()
  },
)
</script>

<style lang="scss" scoped>
.app__wrapper {
  position: relative;
  min-width: toRem(375);
}

.app__navbar {
  height: toRem(80);

  @include respond-to(tablet) {
    height: toRem(72);
  }
}

.app__page {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: calc(vh(100) - toRem(80));

  @include respond-to(tablet) {
    height: calc(vh(100) - toRem(72));
  }

  @include respond-to(375px) {
    min-height: calc(vh(100) - toRem(72) - toRem(4));
    height: max-content;
  }
}

.app__main {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app__loader {
  margin: auto;
  max-height: toRem(500);
  max-width: toRem(500);
}

.app__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-top: toRem(1) solid var(--col-brittle);
  height: toRem(52);
  font-size: toRem(14);
  line-height: toRem(20);
  font-weight: 400;
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
