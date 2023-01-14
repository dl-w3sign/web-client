<template>
  <app-button
    class="connect-ethereum__connect-button"
    :size="BUTTON_SIZES.large"
    :state="buttonState"
    :preset="BUTTON_PRESETS.genius"
    @click.prevent="connectOrReferToInstallMetamask"
  >
    <icon class="connect-ethereum__button-icon" :name="$icons.metamask" />
    {{ buttonText }}
  </app-button>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { AppButton, Icon } from '@/common'
import { useContext, UseProvider } from '@/composables'
import { BUTTON_SIZES, BUTTON_STATES, BUTTON_PRESETS, APP_KEYS } from '@/enums'
import { abbrCenter } from '@/helpers'

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)
const { $t, $config } = useContext()

const buttonState = computed<BUTTON_STATES | undefined>(() => {
  if (web3Provider?.isInitFailed.value) return BUTTON_STATES.notAllowed
  else if (web3Provider?.isIniting.value) return BUTTON_STATES.waiting
  else if (web3Provider?.isConnecting.value) return BUTTON_STATES.waiting
  else if (web3Provider?.isConnected.value) return BUTTON_STATES.noneEvents
  else return undefined
})
const buttonText = computed<string>(() => {
  if (!web3Provider?.selectedProvider.value)
    return $t('connect-ethereum.connect-button-text-install-provider')
  else if (web3Provider?.isInitFailed.value)
    return $t('connect-ethereum.connect-button-text-failed-load')
  else if (web3Provider?.isIniting.value)
    return $t('connect-ethereum.connect-button-text-loading')
  else if (web3Provider?.isConnecting.value)
    return $t('connect-ethereum.connect-button-text-connecting')
  else if (web3Provider?.selectedAddress.value)
    return abbrCenter(web3Provider.selectedAddress.value)
  else return $t('connect-ethereum.connect-button-text')
})

const connectOrReferToInstallMetamask = async () => {
  if (web3Provider?.selectedProvider.value) {
    await web3Provider.connect()

    if (web3Provider.chainId.value !== $config.CHAIN_ID)
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
