import { useProvider, useWeb3 } from '@/composables'
import { PROVIDERS, ETHEREUM_CHAINS } from '@/enums'
import { errors } from '@/errors'
import { ErrorHandler, sleep, getNetworkConfigByChainId } from '@/helpers'
import { DesignatedProvider, ChainId } from '@/types'
import { defineStore } from 'pinia'

export const useWeb3ProvidersStore = defineStore('web3-providers-store', {
  state: () => ({
    providers: [] as DesignatedProvider[],
    provider: useProvider(),
    admittedChainIds: Object.values(ETHEREUM_CHAINS) as ChainId[],
    isInvalidNetworkModalShown: false,
    isChainSwitching: false,
    chainIdOnSwitching: undefined as ChainId | undefined,
  }),
  getters: {
    metamask: (state): DesignatedProvider | undefined =>
      state.providers.find(
        designatedProvider => designatedProvider.name === PROVIDERS.metamask,
      ),
    hasValidCurrentChain: state =>
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
    async tryConnectProvider() {
      try {
        await this.provider.connect()
      } catch (error) {
        error?.constructor === errors.ProviderUserRejectedRequest
          ? ErrorHandler.processWithoutFeedback(error)
          : ErrorHandler.process(error)
      }
    },
    async trySwitchOrAddChain(chainId: ChainId) {
      this.isChainSwitching = true
      this.chainIdOnSwitching = chainId

      try {
        await this.provider.switchChain(chainId)
        await sleep(1000)
      } catch (error) {
        switch (true) {
          case error?.constructor === errors.ProviderUserRejectedRequest:
            ErrorHandler.processWithoutFeedback(error)
            break

          // eslint-disable-next-line
          // @ts-ignore
          case error?.code === 4902:
            try {
              const networkConfig = getNetworkConfigByChainId(chainId)
              if (networkConfig) await this.provider.addChain(networkConfig)
              await sleep(1000)
            } catch (error) {
              if (error?.constructor === errors.ProviderUserRejectedRequest) {
                ErrorHandler.processWithoutFeedback(error)
                break
              }
              ErrorHandler.process(error)
            }
            break

          default:
            ErrorHandler.process(error)
        }
      }

      this.chainIdOnSwitching = undefined
      this.isChainSwitching = false
    },
    async checkConnection() {
      if (!this.provider.isConnected) {
        await this.tryConnectProvider()
        if (!this.provider.isConnected) throw new Error('Not connected')
      }

      if (!this.hasValidCurrentChain) {
        this.showInvalidNetworkModal()
        throw new Error('Not admitted chain')
      }
    },
  },
})
