<template>
  <app-button
    class="connect-ethereum__connect-button"
    :state="buttonState"
    :preset="buttonPreset"
    @click.prevent="connectOrReferToInstallMetamask"
  >
    {{ buttonText }}
    <icon class="connect-ethereum__button-icon" :name="$icons.metamask" />
  </app-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { AppButton, Icon } from '@/common'
import { useContext } from '@/composables'
import { BUTTON_STATES, BUTTON_PRESETS } from '@/enums'
import { errors } from '@/errors'
import { abbrCenter, isMobile, ErrorHandler } from '@/helpers'
import { router } from '@/router'
import { useWeb3ProvidersStore } from '@/store'

defineProps<{
  buttonPreset?: BUTTON_PRESETS
}>()

const { $t, $config } = useContext()
const {
  provider: web3Provider,
  hasValidCurrentChain,
  showInvalidNetworkModal,
} = useWeb3ProvidersStore()

const buttonState = computed<BUTTON_STATES | undefined>(() => {
  switch (true) {
    case web3Provider.isInitFailed:
      return BUTTON_STATES.notAllowed
    case web3Provider.isIniting:
      return BUTTON_STATES.waiting
    case web3Provider.isConnecting:
      return BUTTON_STATES.waiting
    case web3Provider.isConnected:
      return BUTTON_STATES.noneEvents
    default:
      return undefined
  }
})
const buttonText = computed<string>(() => {
  switch (true) {
    case !web3Provider?.selectedProvider && isMobile():
      return $t('connect-ethereum.connect-button-text-go-to-metamask-app')
    case !web3Provider?.selectedProvider:
      return $t('connect-ethereum.connect-button-text-install-provider')
    case web3Provider?.isInitFailed:
      return $t('connect-ethereum.connect-button-text-failed-load')
    case web3Provider?.isIniting:
      return $t('connect-ethereum.connect-button-text-loading')
    case web3Provider?.isConnecting:
      return $t('connect-ethereum.connect-button-text-connecting')
    case !!web3Provider?.selectedAddress:
      return abbrCenter(web3Provider.selectedAddress as string)
    default:
      return $t('connect-ethereum.connect-button-text')
  }
})

const APP_URL = `https://metamask.app.link/dapp/${window.location.host}${router.currentRoute.value.fullPath}`
const redirect = () => {
  try {
    window.open(APP_URL)
  } catch (error) {
    window.location.reload()
  }
}

const handleMobileVersion = () => {
  if (navigator.userAgent.includes('MetaMask')) {
    web3Provider?.connect()
    return
  }

  redirect()
}

const connectOrReferToInstallMetamask = async () => {
  if (isMobile()) {
    handleMobileVersion()
    return
  }

  if (web3Provider?.selectedProvider) {
    try {
      await web3Provider.connect()
      if (!hasValidCurrentChain) showInvalidNetworkModal()
    } catch (error) {
      error?.constructor === errors.ProviderUserRejectedRequest
        ? ErrorHandler.processWithoutFeedback(error)
        : ErrorHandler.process(error)
    }
  } else {
    window.open($config.WEB3_PROVIDER_INSTALL_LINK)
  }
}
</script>

<style lang="scss" scoped>
.connect-ethereum__connect-button {
  gap: toRem(10);
}

.connect-ethereum__button-icon {
  height: toRem(24);
  width: toRem(24);

  .app-navbar & {
    height: toRem(20);
    width: toRem(20);
  }

  @include respond-to(850px) {
    height: toRem(20);
    width: toRem(20);
  }
}
</style>
