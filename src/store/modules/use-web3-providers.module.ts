import { defineStore } from 'pinia'
import { useWeb3 } from '@/composables'
import { PROVIDERS } from '@/enums'
import { DesignatedProvider } from '@/types'

export const useWeb3ProvidersStore = defineStore('web3-providers-store', {
  state: () => ({
    providers: [] as DesignatedProvider[],
  }),
  getters: {
    metamask: (state): DesignatedProvider | undefined =>
      state.providers.find(
        designatedProvider => designatedProvider.name === PROVIDERS.metamask,
      ),
  },
  actions: {
    async detectProviders() {
      const web3 = useWeb3()
      await web3.init()
      this.providers = web3.providers.value
    },
  },
})
