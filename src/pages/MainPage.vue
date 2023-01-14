<script lang="ts" setup>
import { AppButton, Icon } from '@/common'
import { UseProvider, useContext } from '@/composables'
import { BUTTON_PRESETS, BUTTON_SIZES, BUTTON_STATES, APP_KEYS } from '@/enums'
import { computed, inject } from 'vue'

const { $config } = useContext()
const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)
const startButtonState = computed<BUTTON_STATES | undefined>(() => {
  if (web3Provider?.isInitFailed.value) return BUTTON_STATES.notAllowed
  else if (web3Provider?.isIniting.value) return BUTTON_STATES.waiting
  else if (web3Provider?.isConnecting.value) return BUTTON_STATES.waiting
  else return undefined
})

const connectOrReferToInstallMetamask = async () => {
  if (web3Provider?.selectedProvider.value) {
    await web3Provider.connect()
    await web3Provider.switchChain($config.CHAIN_ID)
  } else {
    window.open($config.WEB3_PROVIDER_INSTALL_LINK)
  }
}
</script>

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
          v-show="!web3Provider?.isConnected.value"
          class="main-page__start-button"
          :preset="BUTTON_PRESETS.primary"
          :size="BUTTON_SIZES.large"
          :state="startButtonState"
          @click.prevent="connectOrReferToInstallMetamask"
        >
          {{ $t('main-page.start-button-text') }}
          <icon class="main-page__button-icon" :name="$icons.arrowRight" />
        </app-button>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-page {
  padding: toRem(116) 7.362% toRem(145);
}

.main-page__welcome-top {
  font-size: 8.1vw;
  color: var(--col-intense);
  line-height: 1;
}

.main-page__welcome-bottom {
  font-size: 6.5vw;
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
  font-size: 2.09vw;
  color: var(--col-intense);
  letter-spacing: -0.015em;
  line-height: 1.165;
}

.main-page__start-button {
  margin-top: toRem(40);
  width: toRem(320);
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
