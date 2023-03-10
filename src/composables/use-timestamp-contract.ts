import { config } from '@/config'
import { errors } from '@/errors'
import { useWeb3ProvidersStore } from '@/store'
import { BigNumber } from '@/utils'
import {
  TimestampContract,
  TimestampContract__factory,
  PromiseOrValue,
  BytesLike,
  ZKPPointsStructType,
} from '@/types'
import {
  ContractTransaction,
  CallOverrides,
  PayableOverrides,
  Overrides,
} from 'ethers'
import { computed } from 'vue'

export type SignerInfo = {
  address: string
  signatureTimestamp: number
  isAdmittedToSigning: boolean
}

export type StampInfo = {
  isPublic: boolean
  docTimestamp: number
  signers: SignerInfo[]
  signersTotalCount: number
}

export type UseTimestampContract = {
  getStampInfoWithPagination: (
    publicHash: PromiseOrValue<BytesLike>,
    offset: PromiseOrValue<number>,
    limit: PromiseOrValue<number>,
    overrides?: CallOverrides,
  ) => Promise<StampInfo | null>
  getSignerInfo: (
    address: PromiseOrValue<string>,
    publicHash: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ) => Promise<SignerInfo | null>
  getFee: (overrides?: CallOverrides) => Promise<BigNumber | null>
  createStamp: (
    publicHash: PromiseOrValue<BytesLike>,
    isSign: PromiseOrValue<boolean>,
    indicatedAddresses: PromiseOrValue<string>[],
    ZKPPointsStruct: ZKPPointsStructType,
    overrides?: PayableOverrides,
  ) => Promise<ContractTransaction | null>
  sign: (
    publicHash: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> | undefined },
  ) => Promise<ContractTransaction | null>
}

export const useTimestampContract = (): UseTimestampContract => {
  const web3Store = useWeb3ProvidersStore()

  const _instance = computed<TimestampContract | undefined>(
    () =>
      web3Store.provider.currentProvider &&
      TimestampContract__factory.connect(
        config.CTR_ADDRESS_TIMESTAMP,
        web3Store.provider.currentProvider,
      ),
  )

  const _instance_rw = computed<TimestampContract | undefined>(
    () =>
      web3Store.provider.currentSigner &&
      TimestampContract__factory.connect(
        config.CTR_ADDRESS_TIMESTAMP,
        web3Store.provider.currentSigner,
      ),
  )

  const getStampInfoWithPagination = async (
    publicHash: PromiseOrValue<BytesLike>,
    offset: PromiseOrValue<number>,
    limit: PromiseOrValue<number>,
    overrides?: CallOverrides,
  ): Promise<StampInfo | null> => {
    if (!_instance.value) throw new errors.ContractInstanceUnavailable()
    const receipt = overrides
      ? await _instance.value.getStampInfoWithPagination(
          publicHash,
          offset,
          limit,
          overrides,
        )
      : await _instance.value.getStampInfoWithPagination(
          publicHash,
          offset,
          limit,
        )

    if (receipt) {
      return {
        isPublic: receipt.isPublic,

        docTimestamp: BigNumber.from(receipt.timestamp._hex).toNumber(),

        signers: receipt.signersInfo.map(signerInfo => ({
          address: signerInfo.signer,
          signatureTimestamp: BigNumber.from(
            signerInfo.signatureTimestamp._hex,
          ).toNumber(),
          isAdmittedToSigning: signerInfo.isAddmitted,
        })),

        signersTotalCount: receipt.isPublic
          ? BigNumber.from(receipt.usersSigned._hex).toNumber()
          : BigNumber.from(receipt.usersToSign._hex).toNumber(),
      }
    } else {
      return null
    }
  }

  const getSignerInfo = async (
    address: PromiseOrValue<string>,
    publicHash: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides,
  ): Promise<SignerInfo | null> => {
    if (!_instance.value) throw new errors.ContractInstanceUnavailable()
    const receipt = overrides
      ? await _instance.value.getUserInfo(address, publicHash, overrides)
      : await _instance.value.getUserInfo(address, publicHash)

    if (receipt) {
      return {
        address: receipt.signer,
        signatureTimestamp: BigNumber.from(
          receipt.signatureTimestamp._hex,
        ).toNumber(),
        isAdmittedToSigning: receipt.isAddmitted,
      }
    } else {
      return null
    }
  }

  const getFee = async (overrides?: CallOverrides) => {
    if (!_instance.value) throw new errors.ContractInstanceUnavailable()
    const receipt = overrides
      ? await _instance.value.fee(overrides)
      : await _instance.value.fee()

    return receipt ? BigNumber.from(receipt._hex) : null
  }

  const createStamp = async (
    publicHash: PromiseOrValue<BytesLike>,
    isSign: PromiseOrValue<boolean>,
    indicatedAddresses: PromiseOrValue<string>[],
    ZKPPointsStruct: ZKPPointsStructType,
    overrides?: PayableOverrides,
  ): Promise<ContractTransaction | null> => {
    if (!_instance_rw.value) throw new errors.ContractInstanceUnavailable()
    const tx = overrides
      ? await _instance_rw.value.createStamp(
          publicHash,
          isSign,
          indicatedAddresses,
          ZKPPointsStruct,
          overrides,
        )
      : await _instance_rw.value.createStamp(
          publicHash,
          isSign,
          indicatedAddresses,
          ZKPPointsStruct,
        )

    return tx ? tx : null
  }

  const sign = async (
    publicHash: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> | undefined },
  ): Promise<ContractTransaction | null> => {
    if (!_instance_rw.value) throw new errors.ContractInstanceUnavailable()
    const tx = overrides
      ? await _instance_rw.value.sign(publicHash, overrides)
      : await _instance_rw.value.sign(publicHash)

    return tx ? tx : null
  }

  return {
    getStampInfoWithPagination,
    getSignerInfo,
    getFee,
    createStamp,
    sign,
  }
}
