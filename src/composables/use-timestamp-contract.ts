import { ref } from 'vue'
import {
  TimestampContract,
  TimestampContract__factory,
  PromiseOrValue,
  BytesLike,
  ZKPPointsStructType,
} from '@/types'
import { BN } from '@/utils'
import { useWeb3ProvidersStore } from '@/store'
import { ContractTransaction } from 'ethers'

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
  ) => Promise<StampInfo | null>
  getSignerInfo: (
    address: PromiseOrValue<string>,
    publicHash: PromiseOrValue<BytesLike>,
  ) => Promise<SignerInfo | null>
  createStamp: (
    publicHash: PromiseOrValue<BytesLike>,
    isSign: PromiseOrValue<boolean>,
    indicatedAddresses: PromiseOrValue<string>[],
    ZKPPointsStruct: ZKPPointsStructType,
  ) => Promise<ContractTransaction | null>
  sign: (
    publicHash: PromiseOrValue<BytesLike>,
  ) => Promise<ContractTransaction | null>
}

export const useTimestampContract = (
  address?: string,
): UseTimestampContract => {
  const _instance = ref<TimestampContract | undefined>()
  const _instance_rw = ref<TimestampContract | undefined>()
  const { provider } = useWeb3ProvidersStore()

  if (address && provider.currentProvider && provider.currentSigner) {
    _instance.value = TimestampContract__factory.connect(
      address,
      provider.currentProvider,
    )
    _instance_rw.value = TimestampContract__factory.connect(
      address,
      provider.currentSigner,
    )
  }

  const getStampInfoWithPagination = async (
    publicHash: PromiseOrValue<BytesLike>,
    offset: PromiseOrValue<number>,
    limit: PromiseOrValue<number>,
  ): Promise<StampInfo | null> => {
    if (!_instance.value) throw new Error('contract instance unavailable')
    const receipt = await _instance.value.getStampInfoWithPagination(
      publicHash,
      offset,
      limit,
    )

    if (receipt) {
      return {
        isPublic: receipt.isPublic,

        docTimestamp: new BN(receipt.timestamp._hex).toNumber(),

        signers: receipt.signersInfo.map(signerInfo => ({
          address: signerInfo.signer,
          signatureTimestamp: new BN(
            signerInfo.signatureTimestamp._hex,
          ).toNumber(),
          isAdmittedToSigning: signerInfo.isAddmitted,
        })),

        signersTotalCount: receipt.isPublic
          ? new BN(receipt.usersSigned._hex).toNumber()
          : new BN(receipt.usersToSign._hex).toNumber(),
      }
    } else {
      return null
    }
  }

  const getSignerInfo = async (
    address: PromiseOrValue<string>,
    publicHash: PromiseOrValue<BytesLike>,
  ): Promise<SignerInfo | null> => {
    if (!_instance.value) throw new Error('contract instance unavailable')
    const receipt = await _instance.value.getUserInfo(address, publicHash)

    if (receipt) {
      return {
        address: receipt.signer,
        signatureTimestamp: new BN(receipt.signatureTimestamp._hex).toNumber(),
        isAdmittedToSigning: (await receipt).isAddmitted,
      }
    } else {
      return null
    }
  }

  const createStamp = async (
    publicHash: PromiseOrValue<BytesLike>,
    isSign: PromiseOrValue<boolean>,
    indicatedAddresses: PromiseOrValue<string>[],
    ZKPPointsStruct: ZKPPointsStructType,
  ): Promise<ContractTransaction | null> => {
    if (!_instance_rw.value) throw new Error('contract instance unavailable')
    const tx = await _instance_rw.value.createStamp(
      publicHash,
      isSign,
      indicatedAddresses,
      ZKPPointsStruct,
    )
    return tx ? tx : null
  }

  const sign = async (
    publicHash: PromiseOrValue<BytesLike>,
  ): Promise<ContractTransaction | null> => {
    if (!_instance_rw.value) throw new Error('contract instance unavailable')
    const tx = await _instance_rw.value.sign(publicHash)
    return tx ? tx : null
  }

  return {
    getStampInfoWithPagination,
    getSignerInfo,
    createStamp,
    sign,
  }
}
