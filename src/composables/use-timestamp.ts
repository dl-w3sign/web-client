import { ref } from 'vue'
import { EIP1474 } from '@/enums'
import { i18n } from '@/localization'
import {
  UseProvider,
  Timestamp,
  Timestamp__factory,
  Keccak256Hash,
  EthProviderRpcError,
} from '@/types'
import { BN } from '@/utils'

type Signer = {
  address: string
  signatureTimestamp: number
}

const { t } = i18n.global

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

  const createStamp = async (fileHash: Keccak256Hash, addresses: string[]) => {
    return await _instance_rw.value?.createStamp(fileHash, addresses)
  }

  const sign = async (fileHash: Keccak256Hash) => {
    await _instance_rw.value?.sign(fileHash)
  }

  const getErrorMessage = (error: EthProviderRpcError): string => {
    switch (error.code) {
      case EIP1474.internalError:
        return t('timestamp-contract.error-internal')
      default:
        return t('timestamp-contract.error-default')
    }
  }

  return {
    docTimestamp,
    signers,

    init,

    useTimestamp,
    getStampsInfo,
    getErrorMessage,
    createStamp,
    sign,
  }
}
