import { errors } from '@/errors'
import { getPoseidonHashContractAddressByChainId } from '@/helpers'
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

  const _instance = computed<PoseidonHashContract | undefined>(() => {
    if (!(web3Store.provider.currentProvider && web3Store.provider.chainId))
      return undefined

    const address = getPoseidonHashContractAddressByChainId(
      web3Store.provider.chainId,
    )

    if (address)
      return PoseidonHashContract__factory.connect(
        address,
        web3Store.provider.currentProvider,
      )
    else return undefined
  })

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
