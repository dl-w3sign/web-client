export enum PROVIDERS {
  fallback = 'fallback',
  metamask = 'metamask',
}

export enum PROVIDERS_CHECKS {
  fallback = 'isWeb3',
  metamask = 'isMetaMask',
  coinbase = 'isCoinbaseWallet',
  trust = 'isTrust',
  walletConnect = 'isWalletConnect',
  brave = 'isBraveWallet',
  ledger = 'isLedger',
  phantom = 'isPhantom',
  solflare = 'isSolflare',
}
