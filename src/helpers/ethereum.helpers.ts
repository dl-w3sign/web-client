import {
  MUMBAI_TESTNET_NETWORK_CONFIG,
  POLYGON_MAINNET_NETWORK_CONFIG,
  Q_MAINNET_NETWORK_CONFIG,
  Q_TESTNET_NETWORK_CONFIG,
} from '@/const'
import { EIP1193, EIP1474, ETHEREUM_CHAINS, ICON_NAMES } from '@/enums'
import { errors } from '@/errors'
import { i18n } from '@/localization'
import {
  AddEthereumChainParameter,
  ChainId,
  EthProviderRpcError,
} from '@/types'
import { ethers } from 'ethers'

const { t } = i18n.global

export const connectEthAccounts = async (
  provider: ethers.providers.Web3Provider,
) => {
  await provider.send('eth_requestAccounts', [])
}

export async function requestSwitchEthChain(
  provider: ethers.providers.Web3Provider,
  chainId: number,
) {
  await provider.send('wallet_switchEthereumChain', [
    { chainId: ethers.utils.hexValue(chainId) },
  ])
}

export async function requestAddEthChain(
  provider: ethers.providers.Web3Provider,
  networkConfig: AddEthereumChainParameter,
) {
  await provider.send('wallet_addEthereumChain', [networkConfig])
}

export function handleEthError(error: EthProviderRpcError) {
  switch (error.code) {
    case EIP1193.userRejectedRequest:
      throw new errors.ProviderUserRejectedRequest(error.message)
    case EIP1193.unauthorized:
      throw new errors.ProviderUnauthorized(error.message)
    case EIP1193.unsupportedMethod:
      throw new errors.ProviderUnsupportedMethod(error.message)
    case EIP1193.disconnected:
      throw new errors.ProviderDisconnected(error.message)
    case EIP1193.chainDisconnected:
      throw new errors.ProviderChainDisconnected(error.message)
    case EIP1474.parseError:
      throw new errors.ProviderParseError(error.message)
    case EIP1474.invalidRequest:
      throw new errors.ProviderInvalidRequest(error.message)
    case EIP1474.methodNotFound:
      throw new errors.ProviderMethodNotFound(error.message)
    case EIP1474.invalidParams:
      throw new errors.ProviderInvalidParams(error.message)
    case EIP1474.internalError:
      throw new errors.ProviderInternalError(error.message)
    case EIP1474.invalidInput:
      throw new errors.ProviderInvalidInput(error.message)
    case EIP1474.resourceNotFound:
      throw new errors.ProviderResourceNotFound(error.message)
    case EIP1474.resourceUnavailable:
      throw new errors.ProviderResourceUnavailable(error.message)
    case EIP1474.transactionRejected:
      throw new errors.ProviderTransactionRejected(error.message)
    case EIP1474.methodNotSupported:
      throw new errors.ProviderMethodNotSupported(error.message)
    case EIP1474.limitExceeded:
      throw new errors.ProviderLimitExceeded(error.message)
    case EIP1474.jsonRpcVersionNotSupported:
      throw new errors.ProviderJsonRpcVersionNotSupported(error.message)
    default:
      throw error
  }
}

export function getEthExplorerTxUrl(explorerUrl: string, txHash: string) {
  return `${explorerUrl}/tx/${txHash}`
}

export function getEthExplorerAddressUrl(explorerUrl: string, address: string) {
  return `${explorerUrl}/address/${address}`
}

export function isAddress(address: string) {
  return ethers.utils.isAddress(address)
}

export function getNetworkConfigByChainId(
  chainId: ChainId,
): Readonly<AddEthereumChainParameter> | undefined {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.polygon:
      return POLYGON_MAINNET_NETWORK_CONFIG
    case ETHEREUM_CHAINS.mumbai:
      return MUMBAI_TESTNET_NETWORK_CONFIG
    case ETHEREUM_CHAINS.qMainnet:
      return Q_MAINNET_NETWORK_CONFIG
    case ETHEREUM_CHAINS.qTestnet:
      return Q_TESTNET_NETWORK_CONFIG
    default:
      return undefined
  }
}

export function getTitleByChainId(chainId: ChainId): string {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.ethereum:
    case ETHEREUM_CHAINS.goerli:
      return t('switch-ethereum.ethereum-chain-title')
    case ETHEREUM_CHAINS.polygon:
    case ETHEREUM_CHAINS.mumbai:
      return t('switch-ethereum.polygon-chain-title')
    case ETHEREUM_CHAINS.qMainnet:
    case ETHEREUM_CHAINS.qTestnet:
      return t('switch-ethereum.q-chain-title')
    default:
      return t('switch-ethereum.unknown-chain-title')
  }
}

export function getIconNameByChainId(chainId: ChainId): ICON_NAMES {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.ethereum:
    case ETHEREUM_CHAINS.goerli:
      return ICON_NAMES.ethereum
    case ETHEREUM_CHAINS.polygon:
    case ETHEREUM_CHAINS.mumbai:
      return ICON_NAMES.polygon
    case ETHEREUM_CHAINS.qMainnet:
    case ETHEREUM_CHAINS.qTestnet:
      return ICON_NAMES.q
    default:
      return ICON_NAMES.exclamation
  }
}

export function getTestnetByMainnetChainId(
  chainId: ChainId,
): ChainId | undefined {
  switch (chainId.toString()) {
    case ETHEREUM_CHAINS.ethereum:
      return ETHEREUM_CHAINS.goerli
    case ETHEREUM_CHAINS.polygon:
      return ETHEREUM_CHAINS.mumbai
    case ETHEREUM_CHAINS.qMainnet:
      return ETHEREUM_CHAINS.qTestnet
  }
}
