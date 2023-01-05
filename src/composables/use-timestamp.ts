import { ref } from 'vue'
import {
  UseProvider,
  Timestamp,
  Timestamp__factory,
  Keccak256Hash,
} from '@/types'

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

  const signers = ref([])

  const createStamp = async (fileHash: Keccak256Hash, addresses: string[]) => {
    return await _instance_rw.value?.createStamp(fileHash, addresses)
  }

  return {
    signers,

    init,

    useTimestamp,
    createStamp,
  }
}
