import { providers } from 'ethers'

export interface EthereumProvider extends providers.ExternalProvider {
  providers?: unknown[]
}

export type EthProviderRpcError = {
  message: string
  code: number
  data?: unknown
}
