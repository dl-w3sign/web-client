<template>
  <app-button
    class="connect-ethereum__connect-button"
    :disabled="web3Provider.isConnected || web3Provider.isConnecting"
    :is-waiting="web3Provider.isConnecting"
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
import { errors } from '@/errors'
import { abbrCenter, isMobile, ErrorHandler } from '@/helpers'
import { router } from '@/router'
import { useWeb3ProvidersStore } from '@/store'

const { $t, $config } = useContext()
const { provider: web3Provider } = useWeb3ProvidersStore()

const buttonText = computed<string>(() => {
  switch (true) {
    case !web3Provider?.selectedProvider && isMobile():
      return $t('connect-ethereum.connect-button-text-go-to-metamask-app')
    case !web3Provider?.selectedProvider:
      return $t('connect-ethereum.connect-button-text-install-provider')
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

      if (web3Provider.chainId !== $config.CHAIN_ID)
        await web3Provider.switchChain($config.CHAIN_ID)
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

  @include respond-to(tablet) {
    height: toRem(20);
    width: toRem(20);
  }
}
</style>
