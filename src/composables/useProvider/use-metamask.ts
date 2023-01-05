import { ethers } from 'ethers'
import {
  connectEthAccounts,
  getEthExplorerAddressUrl,
  getEthExplorerTxUrl,
  handleEthError,
  requestAddEthChain,
  requestSwitchEthChain,
} from '@/helpers'
import { computed, ref } from 'vue'
import {
  EthProviderRpcError,
  EthTransactionResponse,
  ChainId,
  ProviderInstance,
  ProviderWrapper,
  TransactionResponse,
  TxRequestBody,
} from '@/types'
import { Deferrable } from '@ethersproject/properties'
import { TransactionRequest } from '@ethersproject/abstract-provider'

export const useMetamask = (provider: ProviderInstance): ProviderWrapper => {
  const chainId = ref<ChainId>('')
  const selectedAddress = ref('')

  const currentProvider = computed(
    () =>
      new ethers.providers.Web3Provider(
        provider as ethers.providers.ExternalProvider,
        'any',
      ),
  )
  const currentSigner = computed(() => currentProvider.value.getSigner())

  const isConnected = computed(() =>
    Boolean(selectedAddress.value && chainId.value),
  )

  const init = async () => {
    _setListeners()
    await _updateProviderState()
  }

  const _setListeners = () => {
    const tempProviderStub = currentProvider.value.provider as {
      on: (eventName: string, cb: () => void) => void
    }

    tempProviderStub.on('accountsChanged', () => {
      _updateProviderState()
    })
    tempProviderStub.on('chainChanged', () => {
      _updateProviderState()
    })
    tempProviderStub.on('disconnect', () => {
      selectedAddress.value = ''
    })
  }

  const _updateProviderState = async () => {
    try {
      const network = await currentProvider.value.detectNetwork()
      chainId.value = network.chainId

      const currentAccounts = await currentProvider.value.listAccounts()
      selectedAddress.value = currentAccounts[0]
    } catch (error) {
      handleEthError(error as EthProviderRpcError)
    }
  }

  const connect = async () => {
    try {
      await connectEthAccounts(currentProvider.value)
    } catch (error) {
      handleEthError(error as EthProviderRpcError)
    }
  }

  const switchChain = async (chainId: ChainId) => {
    try {
      await requestSwitchEthChain(currentProvider.value, Number(chainId))
    } catch (error) {
      handleEthError(error as EthProviderRpcError)
    }
  }

  const addChain = async (
    chainId: ChainId,
    chainName: string,
    chainRpcUrl: string,
  ) => {
    try {
      await requestAddEthChain(
        currentProvider.value,
        Number(chainId),
        chainName,
        chainRpcUrl,
      )
    } catch (error) {
      handleEthError(error as EthProviderRpcError)
    }
  }

  const signAndSendTransaction = async (txRequestBody: TxRequestBody) => {
    try {
      const transactionResponse = await currentSigner.value.sendTransaction(
        txRequestBody as Deferrable<TransactionRequest>,
      )
      await transactionResponse.wait()

      return transactionResponse
    } catch (error) {
      handleEthError(error as EthProviderRpcError)
    }
  }

  const getHashFromTxResponse = (txResponse: TransactionResponse) => {
    const transactionResponse = txResponse as EthTransactionResponse

    return transactionResponse.hash
  }

  const getTxUrl = (explorerUrl: string, txHash: string) => {
    return getEthExplorerTxUrl(explorerUrl, txHash)
  }

  const getAddressUrl = (explorerUrl: string, address: string) => {
    return getEthExplorerAddressUrl(explorerUrl, address)
  }

  return {
    currentProvider,
    currentSigner,

    chainId,
    selectedAddress,
    isConnected,

    init,
    connect,
    switchChain,
    addChain,
    signAndSendTransaction,
    getHashFromTxResponse,
    getTxUrl,
    getAddressUrl,
  }
}
