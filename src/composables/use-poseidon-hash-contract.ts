import { config } from '@/config'
import { errors } from '@/errors'
import { useWeb3ProvidersStore } from '@/store'
import {
  PoseidonHashContract,
  PoseidonHashContract__factory,
  PromiseOrValue,
  BytesLike,
} from '@/types'
import { CallOverrides } from 'ethers'
import { computed } from 'vue'

export type PoseidonHash = string // 0x...

export interface IUsePoseidonHashContract {
  getPoseidonHash: (
    bytesLike: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ) => Promise<PoseidonHash | undefined>
}

export const usePoseidonHashContract = (): IUsePoseidonHashContract => {
  const web3Store = useWeb3ProvidersStore()

  const _instance = computed<PoseidonHashContract | undefined>(
    () =>
      web3Store.provider.currentProvider &&
      PoseidonHashContract__factory.connect(
        config.CTR_ADDRESS_POSEIDON_HASH,
        web3Store.provider.currentProvider,
      ),
  )

  const getPoseidonHash = async (
    bytesLike: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ): Promise<PoseidonHash | undefined> => {
    if (!_instance.value) throw new errors.ContractInstanceUnavailable()
    return overrides
      ? _instance.value?.['poseidon(bytes32[1])']([bytesLike], overrides)
      : _instance.value?.['poseidon(bytes32[1])']([bytesLike])
  }

  return { getPoseidonHash }
}
