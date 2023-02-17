<template>
  <select-field
    class="switch-ethereum__select-field"
    :state="isSwitching ? BUTTON_STATES.waiting : undefined"
    :preset="
      hasCurrentChainIdInListOfAvailable || chainIdOnSwitching
        ? 'outline-brittle'
        : 'outline-wise'
    "
    :model-value="web3Provider?.chainId"
    @update:model-value="switchChain"
  >
    <template #head>
      <div class="switch-ethereum__select-head">
        <icon
          class="switch-ethereum__button-icon"
          :name="
            getChainIconNameById(
              isSwitching ? chainIdOnSwitching : web3Provider?.chainId,
            )
          "
        />
        <p class="switch-ethereum__chain-title">
          {{
            getChainTitleById(
              isSwitching ? chainIdOnSwitching : web3Provider?.chainId,
            )
          }}
        </p>
      </div>
    </template>
    <template #default="{ selectField }">
      <div class="switch-ethereum__select-dropdown" v-show="selectField.isOpen">
        <button
          v-for="chainId in chainsIds"
          :key="chainId"
          class="switch-ethereum__select-item-button"
          @click="selectField.select(chainId)"
        >
          <icon
            class="switch-ethereum__button-icon"
            :name="getChainIconNameById(chainId)"
          />
          {{ getChainTitleById(chainId) }}
        </button>
      </div>
    </template>
  </select-field>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { useContext } from '@/composables'
import {
  POLYGON_MAINNET_NETWORK_CONFIG,
  Q_MAINNET_NETWORK_CONFIG,
} from '@/const'
import { ETHEREUM_CHAINS, ICON_NAMES, BUTTON_STATES } from '@/enums'
import { errors } from '@/errors'
import { SelectField } from '@/fields'
import { ErrorHandler, Bus, sleep } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { ChainId } from '@/types'
import { computed, ref } from 'vue'

const { provider: web3Provider } = useWeb3ProvidersStore()
const { $t } = useContext()

const chainsIds = Object.values(ETHEREUM_CHAINS) as ChainId[]
const hasCurrentChainIdInListOfAvailable = computed(() =>
  chainsIds.includes(web3Provider.chainId?.toString() as ChainId),
)

const getChainTitleById = (chainId: ChainId): string => {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.ethereum:
      return $t('switch-ethereum.ethereum-chain-title')
    case ETHEREUM_CHAINS.polygon:
      return $t('switch-ethereum.polygon-chain-title')
    case ETHEREUM_CHAINS.q:
      return $t('switch-ethereum.q-chain-title')
    default:
      return $t('switch-ethereum.unknown-chain-title')
  }
}

const getChainIconNameById = (chainId: ChainId): ICON_NAMES => {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.ethereum:
      return ICON_NAMES.ethereum
    case ETHEREUM_CHAINS.polygon:
      return ICON_NAMES.polygon
    case ETHEREUM_CHAINS.q:
      return ICON_NAMES.q
    default:
      return ICON_NAMES.exclamation
  }
}

const getNetworkConfigByChainId = (chainId: ChainId) => {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.polygon:
      return POLYGON_MAINNET_NETWORK_CONFIG
    case ETHEREUM_CHAINS.q:
      return Q_MAINNET_NETWORK_CONFIG
    default:
      return undefined
  }
}

const isSwitching = ref(false)
const chainIdOnSwitching = ref<ChainId>()
const switchChain = async (chainId: ChainId) => {
  if (web3Provider.chainId?.toString() !== chainId) {
    isSwitching.value = true
    chainIdOnSwitching.value = chainId

    try {
      await web3Provider?.switchChain(chainId)
      await sleep(1000)
    } catch (error) {
      switch (true) {
        case error?.constructor === errors.ProviderUserRejectedRequest:
          ErrorHandler.processWithoutFeedback(error)
          break

        case error?.code === 4902:
          try {
            const networkConfig = getNetworkConfigByChainId(chainId)
            if (networkConfig) await web3Provider.addChain(networkConfig)
            await sleep(1000)
          } catch (error) {
            if (error?.constructor === errors.ProviderUserRejectedRequest) {
              ErrorHandler.processWithoutFeedback(error)
              break
            }
            Bus.emit(Bus.eventList.error)
          }
          break

        default:
          Bus.emit(Bus.eventList.error)
      }
    }

    chainIdOnSwitching.value = undefined
    isSwitching.value = false
  }
}
</script>

<style lang="scss" scoped>
.switch-ethereum__select-head {
  display: flex;
  align-items: center;
  width: 100%;
  gap: toRem(12);
  margin-left: toRem(15);

  @include respond-to(580px) {
    margin-left: toRem(7);
  }
}

.switch-ethereum__select-item-button {
  display: flex;
  align-items: center;
  gap: toRem(12);
  height: toRem(48);
  padding: 0 toRem(15);

  @include outline-brittle-dropdown-item;
}

.switch-ethereum__button-icon {
  height: toRem(24);
  width: toRem(24);
  color: var(--col-wise);
  flex-shrink: 0;
}

.switch-ethereum__chain-title {
  @include respond-to(580px) {
    display: none;
  }

  @include text-1;
}

.switch-ethereum__select-dropdown {
  width: toRem(180);
  margin-top: toRem(24);

  @include respond-to(850px) {
    margin-top: toRem(16);
  }

  @include respond-to(580px) {
    position: absolute;
    top: toRem(80);
    right: toRem(16);
    margin-top: 0;
  }

  @include outline-brittle-dropdown;
}
</style>
