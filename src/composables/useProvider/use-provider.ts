import { PROVIDERS } from '@/enums'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { useMetamask } from '@/composables/useProvider'
import {
  DesignatedProvider,
  ChainId,
  ProviderWrapper,
  TransactionResponse,
  TxRequestBody,
  AddEthereumChainParameter,
} from '@/types'
import { errors } from '@/errors'
import { providers } from 'ethers'
import { ErrorHandler, getNetworkConfigByChainId, sleep } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'

export interface UseProvider {
  currentProvider: ComputedRef<providers.Web3Provider | undefined>
  currentSigner: ComputedRef<providers.JsonRpcSigner | undefined>

  selectedProvider: Ref<PROVIDERS | undefined>
  chainId: ComputedRef<ChainId | undefined>
  selectedAddress: ComputedRef<string | undefined>
  isConnected: ComputedRef<boolean>
  isConnecting: Ref<boolean>
  isChainSwitching: Ref<boolean>
  chainIdOnSwitching: Ref<ChainId | undefined>

  init: (provider: DesignatedProvider) => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchChain: (chainId: ChainId) => Promise<void>
  addChain: (networkConfig: AddEthereumChainParameter) => Promise<void>
  trySwitchOrAddChain: (chainId: ChainId) => Promise<void>
  signAndSendTx: (txRequestBody: TxRequestBody) => Promise<TransactionResponse>
  getHashFromTxResponse: (txResponse: TransactionResponse) => string
  getTxUrl: (explorerUrl: string, txHash: string) => string
  getAddressUrl: (explorerUrl: string, address: string) => string
}

export const useProvider = (): UseProvider => {
  const providerWrp = ref<ProviderWrapper | undefined>()

  const currentProvider = computed(
    () =>
      providerWrp.value?.currentProvider as unknown as providers.Web3Provider,
  )
  const currentSigner = computed(
    () =>
      providerWrp.value?.currentSigner as unknown as providers.JsonRpcSigner,
  )

  const selectedProvider = ref<PROVIDERS | undefined>()
  const chainId = computed(
    () => providerWrp.value?.chainId as ChainId | undefined,
  )
  const selectedAddress = computed(
    () => providerWrp.value?.selectedAddress as string | undefined,
  )

  const isConnected = computed(() =>
    Boolean(chainId.value && selectedAddress.value),
  )
  const isConnecting = ref(false)

  const isChainSwitching = ref(false)
  const chainIdOnSwitching = ref<ChainId>()

  const init = async (provider: DesignatedProvider) => {
    switch (provider.name as PROVIDERS) {
      case PROVIDERS.metamask:
        providerWrp.value = useMetamask(provider.instance)
        break
      default:
        throw new Error('Invalid Provider')
    }
    selectedProvider.value = provider.name
    await providerWrp.value.init()
  }

  const connect = async () => {
    isConnecting.value = true

    if (!providerWrp.value) {
      if (selectedProvider.value) {
        const web3Store = useWeb3ProvidersStore()
        const _designatedProvider = web3Store.providers.find(
          el => el.name === selectedProvider.value,
        )

        if (_designatedProvider) {
          await init(_designatedProvider)

          if (
            providerWrp.value &&
            (providerWrp.value as ProviderWrapper).init
          ) {
            await (providerWrp.value as ProviderWrapper).init()
          }
        } else {
          ErrorHandler.processWithoutFeedback(new Error('Invalid Provider'))
        }
      }
    } else if (!providerWrp.value?.connect) {
      ErrorHandler.processWithoutFeedback(
        new errors.ProviderWrapperMethodNotFoundError(),
      )
    } else {
      try {
        await providerWrp.value.connect()
      } catch (error) {
        isConnecting.value = false
        throw error
      }
    }

    isConnecting.value = false
  }

  const disconnect = async () => {
    if (providerWrp.value?.disconnect) {
      await providerWrp.value.disconnect()
    } else {
      providerWrp.value = undefined
    }
  }

  const switchChain = async (chainId: ChainId) => {
    if (!providerWrp.value)
      throw new errors.ProviderWrapperMethodNotFoundError()

    await providerWrp.value.switchChain(chainId)
  }

  const addChain = async (networkConfig: AddEthereumChainParameter) => {
    if (!providerWrp.value || !providerWrp.value?.addChain)
      throw new errors.ProviderWrapperMethodNotFoundError()

    await providerWrp.value.addChain(networkConfig)
  }

  const trySwitchOrAddChain = async (chainId: ChainId) => {
    isChainSwitching.value = true
    chainIdOnSwitching.value = chainId

    try {
      await switchChain(chainId)
      await sleep(1000)
    } catch (error) {
      switch (true) {
        case error?.constructor === errors.ProviderUserRejectedRequest:
          ErrorHandler.processWithoutFeedback(error)
          break

        // error.code 4902 isn't supported in mobile metamask browser
        default:
          try {
            const networkConfig = getNetworkConfigByChainId(chainId)
            if (networkConfig) await addChain(networkConfig)
            await sleep(1000)
          } catch (error) {
            if (error?.constructor === errors.ProviderUserRejectedRequest) {
              ErrorHandler.processWithoutFeedback(error)
              break
            }
            ErrorHandler.process(error)
          }
          break
      }
    }

    chainIdOnSwitching.value = undefined
    isChainSwitching.value = false
  }

  const signAndSendTx = async (
    txRequestBody: TxRequestBody,
  ): Promise<TransactionResponse> => {
    if (!providerWrp.value)
      throw new errors.ProviderWrapperMethodNotFoundError()

    return providerWrp.value.signAndSendTransaction(txRequestBody)
  }

  const getHashFromTxResponse = (txResponse: TransactionResponse): string => {
    if (!providerWrp.value)
      throw new errors.ProviderWrapperMethodNotFoundError()

    return providerWrp.value.getHashFromTxResponse(txResponse)
  }

  const getTxUrl = (explorerUrl: string, txHash: string): string => {
    if (!providerWrp.value)
      throw new errors.ProviderWrapperMethodNotFoundError()

    return providerWrp.value.getTxUrl(explorerUrl, txHash)
  }

  const getAddressUrl = (explorerUrl: string, address: string): string => {
    if (!providerWrp.value)
      throw new errors.ProviderWrapperMethodNotFoundError()

    return providerWrp.value.getAddressUrl(explorerUrl, address)
  }

  return {
    currentProvider,
    currentSigner,

    selectedProvider,
    chainId,
    selectedAddress,
    isConnected,
    isConnecting,
    isChainSwitching,
    chainIdOnSwitching,

    init,
    connect,
    disconnect,
    switchChain,
    addChain,
    trySwitchOrAddChain,
    signAndSendTx,
    getHashFromTxResponse,
    getTxUrl,
    getAddressUrl,
  }
}
