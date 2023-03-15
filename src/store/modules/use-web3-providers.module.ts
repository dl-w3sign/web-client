import { useProvider, useWeb3 } from '@/composables'
import { config } from '@/config'
import { ETHEREUM_CHAINS, PROVIDERS } from '@/enums'
import { ChainId, DesignatedProvider } from '@/types'
import { defineStore } from 'pinia'

export const useWeb3ProvidersStore = defineStore('web3-providers-store', {
  state: () => ({
    providers: [] as DesignatedProvider[],
    provider: useProvider(),
    admittedChainIds: config.IS_MAINNET
      ? ([
          ETHEREUM_CHAINS.ethereum,
          ETHEREUM_CHAINS.polygon,
          ETHEREUM_CHAINS.qMainnet,
        ] as ChainId[])
      : ([
          ETHEREUM_CHAINS.goerli,
          ETHEREUM_CHAINS.mumbai,
          ETHEREUM_CHAINS.qTestnet,
        ] as ChainId[]),
    isInvalidNetworkModalShown: false,
  }),
  getters: {
    metamask: (state): DesignatedProvider | undefined =>
      state.providers.find(
        designatedProvider => designatedProvider.name === PROVIDERS.metamask,
      ),
    isValidChain: state =>
      state.admittedChainIds.includes(
        state.provider.chainId?.toString() as ChainId,
      ),
  },
  actions: {
    async detectProviders() {
      const web3 = useWeb3()
      await web3.init()
      this.providers = web3.providers.value
    },
    showInvalidNetworkModal() {
      this.isInvalidNetworkModalShown = true
    },
    hideInvalidNetworkModal() {
      this.isInvalidNetworkModalShown = false
    },
  },
})
