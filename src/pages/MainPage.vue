<template>
  <div class="main-page">
    <div class="main-page__welcome">
      <h1 class="main-page__welcome-top">
        {{ $t('main-page.welcome-beginning') }}
      </h1>
      <h1 class="main-page__welcome-bottom">
        {{ $t('main-page.welcome-continuing') }}
      </h1>
    </div>
    <div class="main-page__container">
      <div class="main-page__description">
        <p>{{ $t('main-page.description') }}</p>
      </div>
      <transition name="fade">
        <app-button
          v-show="!web3Provider.isConnected"
          class="main-page__start-button"
          :preset="BUTTON_PRESETS.primary"
          :size="BUTTON_SIZES.large"
          :state="startButtonState"
          @click="connectOrReferToInstallMetamask"
        >
          {{ $t('main-page.start-button-text') }}
          <icon class="main-page__button-icon" :name="$icons.arrowRight" />
        </app-button>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, Icon } from '@/common'
import { useContext } from '@/composables'
import { BUTTON_PRESETS, BUTTON_SIZES, BUTTON_STATES } from '@/enums'
import { useWeb3ProvidersStore } from '@/store'
import { computed } from 'vue'

const { $config } = useContext()
const { provider: web3Provider } = useWeb3ProvidersStore()

const startButtonState = computed<BUTTON_STATES | undefined>(() => {
  switch (true) {
    case web3Provider.isInitFailed:
      return BUTTON_STATES.notAllowed
    case web3Provider.isIniting:
      return BUTTON_STATES.waiting
    case web3Provider.isConnecting:
      return BUTTON_STATES.waiting
    default:
      return undefined
  }
})

const connectOrReferToInstallMetamask = async () => {
  if (web3Provider.selectedProvider) {
    await web3Provider.connect()
    await web3Provider.switchChain($config.CHAIN_ID)
  } else {
    window.open($config.WEB3_PROVIDER_INSTALL_LINK)
  }
}
</script>

<style lang="scss" scoped>
.main-page {
  padding: toRem(116) 7.362% toRem(145);
}

.main-page__welcome-top {
  font-size: toRem(116);
  color: var(--col-intense);
}

.main-page__welcome-bottom {
  font-size: toRem(94);
  color: var(--col-primary);
  line-height: 1.154;
  margin-top: toRem(4);
}

.main-page__container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 70.69%;
  margin-top: toRem(96);
}

.main-page__description {
  background: var(--col-simple);
  border-radius: toRem(4);
  padding: toRem(25) toRem(26) toRem(25) toRem(24);
  font-size: toRem(30);
  color: var(--col-intense);
  letter-spacing: -0.015em;
  line-height: 1.165;
}

.main-page__start-button {
  margin-top: toRem(40);
  max-width: toRem(320);
  gap: toRem(10);
}

.main-page__button-icon {
  height: toRem(24);
  width: toRem(24);
}

.fade-enter-active {
  animation: fade-in var(--transition-duration);
}

.fade-leave-active {
  animation: fade-in var(--transition-duration) reverse;
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
