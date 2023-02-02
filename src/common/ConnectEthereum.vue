<template>
  <app-button
    class="connect-ethereum__connect-button"
    :size="BUTTON_SIZES.large"
    :state="buttonState"
    :preset="BUTTON_PRESETS.genius"
    @click="connectOrReferToInstallMetamask"
  >
    <icon class="connect-ethereum__button-icon" :name="$icons.metamask" />
    {{ buttonText }}
  </app-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { AppButton, Icon } from '@/common'
import { useContext } from '@/composables'
import { BUTTON_SIZES, BUTTON_STATES, BUTTON_PRESETS } from '@/enums'
import { abbrCenter } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'

const { $t, $config } = useContext()
const { provider: web3Provider } = useWeb3ProvidersStore()

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
    case !web3Provider.selectedProvider:
      return $t('connect-ethereum.connect-button-text-install-provider')
    case web3Provider.isInitFailed:
      return $t('connect-ethereum.connect-button-text-failed-load')
    case web3Provider.isIniting:
      return $t('connect-ethereum.connect-button-text-loading')
    case web3Provider.isConnecting:
      return $t('connect-ethereum.connect-button-text-connecting')
    case !!web3Provider.selectedAddress:
      return abbrCenter(web3Provider.selectedAddress as string)
    default:
      return $t('connect-ethereum.connect-button-text')
  }
})

const connectOrReferToInstallMetamask = async () => {
  if (web3Provider.selectedProvider) {
    await web3Provider.connect()

    if (web3Provider.chainId !== $config.CHAIN_ID)
      await web3Provider.switchChain($config.CHAIN_ID)
  } else {
    window.open($config.WEB3_PROVIDER_INSTALL_LINK)
  }
}
</script>

<style lang="scss" scoped>
.connect-ethereum__connect-button {
  gap: toRem(8.33);
  width: toRem(320);
}

.connect-ethereum__button-icon {
  height: toRem(31.2);
  width: toRem(34.67);
}
</style>
