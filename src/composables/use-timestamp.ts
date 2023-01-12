import { ref } from 'vue'
import {
  UseProvider,
  Timestamp,
  Timestamp__factory,
  Keccak256Hash,
} from '@/types'
import { BN } from '@/utils'

type Signer = {
  address: string
  signatureTimestamp: number
}

export const useTimestamp = (provider: UseProvider, address?: string) => {
  const _instance = ref<Timestamp | undefined>()
  const _instance_rw = ref<Timestamp | undefined>()

  if (
    address &&
    provider.currentProvider.value &&
    provider.currentSigner.value
  ) {
    _instance.value = Timestamp__factory.connect(
      address,
      provider.currentProvider.value,
    )
    _instance_rw.value = Timestamp__factory.connect(
      address,
      provider.currentSigner.value,
    )
  }

  const init = (address: string) => {
    if (
      address &&
      provider.currentProvider.value &&
      provider.currentSigner.value
    ) {
      _instance.value = Timestamp__factory.connect(
        address,
        provider.currentProvider.value,
      )
      _instance_rw.value = Timestamp__factory.connect(
        address,
        provider.currentSigner.value,
      )
    }
  }

  const docTimestamp = ref<number>()

  const signers = ref<Signer[]>([])

  const getStampsInfo = async (fileHashes: Keccak256Hash[]) => {
    const receipt = await _instance.value?.getStampsInfo(fileHashes)
    if (receipt) {
      docTimestamp.value = new BN(receipt[0].timestamp._hex).toNumber()
      signers.value = receipt[0].signersInfo.map(signerInfo => ({
        address: signerInfo.signer,
        signatureTimestamp: new BN(
          signerInfo.signatureTimestamp._hex,
        ).toNumber(),
      }))
    }
  }

  const createStamp = async (fileHash: Keccak256Hash) => {
    return await _instance_rw.value?.createStamp(fileHash)
  }

  const sign = async (fileHash: Keccak256Hash) => {
    await _instance_rw.value?.sign(fileHash)
  }

  return {
    docTimestamp,
    signers,

    init,

    useTimestamp,
    getStampsInfo,
    createStamp,
    sign,
  }
}
