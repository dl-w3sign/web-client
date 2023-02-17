import { utils } from 'ethers'

export interface AddEthereumChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[] // Currently ignored.
}

export const POLYGON_MAINNET_NETWORK_CONFIG = Object.freeze({
  chainId: utils.hexValue(137),
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
}) as Readonly<AddEthereumChainParameter>

export const Q_MAINNET_NETWORK_CONFIG = Object.freeze({
  chainId: utils.hexValue(35441),
  chainName: 'Q Mainnet',
  nativeCurrency: {
    name: 'Q  ',
    symbol: 'Q  ',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.q.org'],
  blockExplorerUrls: ['https://explorer.q.org'],
}) as Readonly<AddEthereumChainParameter>
