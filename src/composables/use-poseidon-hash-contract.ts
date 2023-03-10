import { errors } from '@/errors'
import { useWeb3ProvidersStore } from '@/store'
import {
  PoseidonHashContract,
  PoseidonHashContract__factory,
  PromiseOrValue,
  BytesLike,
} from '@/types'
import { CallOverrides } from 'ethers'
import { ref } from 'vue'

export type PoseidonHash = string // 0x...

export interface UsePoseidonHashContract {
  getPoseidonHash: (
    bytesLike: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ) => Promise<PoseidonHash | undefined>
}

export const usePoseidonHashContract = (
  address?: string,
): UsePoseidonHashContract => {
  const _instance = ref<PoseidonHashContract | undefined>()
  const _instance_rw = ref<PoseidonHashContract | undefined>()
  const { provider } = useWeb3ProvidersStore()

  if (address && provider.currentProvider && provider.currentSigner) {
    _instance.value = PoseidonHashContract__factory.connect(
      address,
      provider.currentProvider,
    )
    _instance_rw.value = PoseidonHashContract__factory.connect(
      address,
      provider.currentSigner,
    )
  }

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
