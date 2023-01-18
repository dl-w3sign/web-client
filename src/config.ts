import packageJson from '../package.json'
import { LogLevelDesc } from 'loglevel'
import { pickBy, mapKeys } from 'lodash-es'

export const config = {
  APP_NAME: import.meta.env.VITE_APP_NAME,
  LOG_LEVEL: 'trace' as LogLevelDesc,
  BUILD_VERSION: packageJson.version || import.meta.env.VITE_APP_BUILD_VERSION,
  CHAIN_ID: import.meta.env.VITE_APP_CHAIN_ID,
  CTR_ADDRESS_TIMESTAMP: import.meta.env.VITE_APP_CTR_ADDRESS_TIMESTAMP,
  WEB3_PROVIDER_INSTALL_LINK: import.meta.env
    .VITE_APP_WEB3_PROVIDER_INSTALL_LINK,
  FILE_MIME_TYPES: ['image/jpeg', 'image/png'],
} as const

Object.assign(config, _mapEnvCfg(import.meta.env))
Object.assign(config, _mapEnvCfg(document.ENV))

function _mapEnvCfg(env: ImportMetaEnv | typeof document.ENV): {
  [k: string]: string | boolean | undefined
} {
  return mapKeys(
    pickBy(env, (v, k) => k.startsWith('VITE_APP_')),
    (v, k) => k.replace(/^VITE_APP_/, ''),
  )
}
