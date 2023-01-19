import { ref, computed } from 'vue'
import {
  UseProvider,
  TimestampContract,
  TimestampContract__factory,
  Keccak256Hash,
} from '@/types'
import { BN } from '@/utils'

type Signer = {
  address: string
  signatureTimestamp: number
}

export const useTimestampContract = (
  provider: UseProvider,
  address: string,
) => {
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

  const docTimestamp = ref<number>()

  const signers = ref<Signer[]>([])

  const signersCount = ref(0)

  const signerInfo = ref<Signer>()

  const isSignedBySigner = computed(() =>
    typeof signerInfo.value?.signatureTimestamp === 'undefined'
      ? undefined
      : signerInfo.value?.signatureTimestamp
      ? true
      : false,
  )

  const getStampInfoWithPagination = async (
    fileHash: Keccak256Hash,
    offset: number,
    limit: number,
  ) => {
    const receipt = await _instance.value?.getStampInfoWithPagination(
      fileHash,
      offset,
      limit,
    )

    if (receipt) {
      docTimestamp.value = new BN(receipt.timestamp._hex).toNumber()

      signers.value = receipt.signersInfo.map(signerInfo => ({
        address: signerInfo.signer,
        signatureTimestamp: new BN(
          signerInfo.signatureTimestamp._hex,
        ).toNumber(),
      }))

      signersCount.value = new BN(receipt.signersCount._hex).toNumber()
    }
  }

  const getUserInfo = async (userAddress: string, fileHash: Keccak256Hash) => {
    const receipt = await _instance.value?.getUserInfo(userAddress, fileHash)

    if (receipt) {
      signerInfo.value = {
        address: receipt.signer,
        signatureTimestamp: new BN(receipt.signatureTimestamp._hex).toNumber(),
      }
    }
  }

  const createStamp = async (fileHash: Keccak256Hash, isSign: boolean) => {
    return await _instance_rw.value?.createStamp(fileHash, isSign)
  }

  const sign = async (fileHash: Keccak256Hash) => {
    await _instance_rw.value?.sign(fileHash)
  }

  return {
    docTimestamp,
    signers,
    signersCount,
    signerInfo,
    isSignedBySigner,

    useTimestampContract,
    getStampInfoWithPagination,
    getUserInfo,
    createStamp,
    sign,
  }
}
