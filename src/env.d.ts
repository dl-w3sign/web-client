/// <reference types="vite/client" />

import { config } from '@config'
import { ICON_NAMES, ROUTE_NAMES } from '@/enums'
import { WritableComputedRef } from 'vue'
import { EthereumProvider } from '@/types'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $routes: typeof ROUTE_NAMES
    $icons: typeof ICON_NAMES
    $config: typeof config
    $locale: WritableComputedRef
  }
}

interface ImportMetaEnv {
  VITE_ENVIRONMENT: string
  VITE_PORT: string
  VITE_APP_NAME: string
  VITE_APP_CTR_ADDRESS_TIMESTAMP_ETHEREUM: string
  VITE_APP_CTR_ADDRESS_TIMESTAMP_POLYGON: string
  VITE_APP_CTR_ADDRESS_TIMESTAMP_Q: string
  VITE_APP_CTR_ADDRESS_POSEIDON_HASH_ETHEREUM: string
  VITE_APP_CTR_ADDRESS_POSEIDON_HASH_POLYGON: string
  VITE_APP_CTR_ADDRESS_POSEIDON_HASH_Q: string
  VITE_APP_IS_MAINNET: string
}

declare global {
  interface Document {
    ENV: ImportMetaEnv
  }

  interface Window {
    ethereum?: EthereumProvider
  }
}
