import { ref } from 'vue'
import {
  TimestampContract,
  TimestampContract__factory,
  Keccak256Hash,
} from '@/types'
import { BN } from '@/utils'
import { useWeb3ProvidersStore } from '@/store'

type Signer = {
  address: string
  signatureTimestamp: number
}

export const useTimestampContract = (address: string) => {
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

  const docTimestamp = ref<number>()

  const signers = ref<Signer[]>([])

  const getStampInfo = async (fileHash: Keccak256Hash) => {
    const receipt = await _instance.value?.getStampInfo(fileHash)
    if (receipt) {
      docTimestamp.value = new BN(receipt.timestamp._hex).toNumber()
      signers.value = receipt.signersInfo.map(signerInfo => ({
        address: signerInfo.signer,
        signatureTimestamp: new BN(
          signerInfo.signatureTimestamp._hex,
        ).toNumber(),
      }))
    }
  }

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

    useTimestampContract,
    getStampInfo,
    getStampInfoWithPagination,
    createStamp,
    sign,
  }
}
