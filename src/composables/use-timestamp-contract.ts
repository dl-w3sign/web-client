import { ref } from 'vue'
import {
  UseProvider,
  TimestampContract,
  TimestampContract__factory,
  Keccak256Hash,
} from '@/types'
import { BN } from '@/utils'
import { ContractTransaction } from 'ethers'

export type SignerInfo = {
  address: string
  signatureTimestamp: number
}

export type StampInfo = {
  docTimestamp: number
  signers: SignerInfo[]
  signersTotalCount: number
}

export type UseTimestampContract = {
  getStampInfoWithPagination: (
    fileHash: Keccak256Hash,
    offset: number,
    limit: number,
  ) => Promise<StampInfo | null>
  getSignerInfo: (
    address: string,
    fileHash: Keccak256Hash,
  ) => Promise<SignerInfo | null>
  createStamp: (
    fileHash: Keccak256Hash,
    isSign: boolean,
  ) => Promise<ContractTransaction | null>
  sign: (fileHash: Keccak256Hash) => Promise<ContractTransaction | null>
}

export const useTimestampContract = (
  provider: UseProvider,
  address: string,
): UseTimestampContract => {
  const _instance = ref<TimestampContract | undefined>()
  const _instance_rw = ref<TimestampContract | undefined>()

  if (
    address &&
    provider.currentProvider.value &&
    provider.currentSigner.value
  ) {
    _instance.value = TimestampContract__factory.connect(
      address,
      provider.currentProvider.value,
    )
    _instance_rw.value = TimestampContract__factory.connect(
      address,
      provider.currentSigner.value,
    )
  }

  const getStampInfoWithPagination = async (
    fileHash: Keccak256Hash,
    offset: number,
    limit: number,
  ): Promise<StampInfo | null> => {
    const receipt = await _instance.value?.getStampInfoWithPagination(
      fileHash,
      offset,
      limit,
    )

    if (receipt) {
      return {
        docTimestamp: new BN(receipt.timestamp._hex).toNumber(),

        signers: receipt.signersInfo.map(signerInfo => ({
          address: signerInfo.signer,
          signatureTimestamp: new BN(
            signerInfo.signatureTimestamp._hex,
          ).toNumber(),
        })),

        signersTotalCount: new BN(receipt.signersCount._hex).toNumber(),
      }
    } else {
      return null
    }
  }

  const getSignerInfo = async (
    address: string,
    fileHash: Keccak256Hash,
  ): Promise<SignerInfo | null> => {
    const receipt = await _instance.value?.getUserInfo(address, fileHash)

    if (receipt) {
      return {
        address: receipt.signer,
        signatureTimestamp: new BN(receipt.signatureTimestamp._hex).toNumber(),
      }
    } else {
      return null
    }
  }

  const createStamp = async (
    fileHash: Keccak256Hash,
    isSign: boolean,
  ): Promise<ContractTransaction | null> => {
    const tx = await _instance_rw.value?.createStamp(fileHash, isSign)
    return tx ? tx : null
  }

  const sign = async (
    fileHash: Keccak256Hash,
  ): Promise<ContractTransaction | null> => {
    const tx = await _instance_rw.value?.sign(fileHash)
    return tx ? tx : null
  }

  return {
    getStampInfoWithPagination,
    getSignerInfo,
    createStamp,
    sign,
  }
}
