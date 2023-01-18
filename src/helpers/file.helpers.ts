import { ICON_NAMES } from '@/enums'
import { HashUtil, Keccak256Hash } from '@/utils'

export function getFileIconName(file: File): ICON_NAMES {
  if (file.type === '') return ICON_NAMES.document
  const fileExt = file.name.split('.').pop()
  switch (fileExt) {
    default:
      return ICON_NAMES.document
  }
}

export async function getKeccak256FileHash(file: File): Promise<Keccak256Hash> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'object') {
        const fileAsUint8Array = new Uint8Array(reader.result)
        resolve(HashUtil.getKeccak256Hash(fileAsUint8Array))
      } else {
        reject(new TypeError('Error reading file as ArrayBuffer'))
      }
    }
    reader.onerror = () => {
      reject('Unknown file read error')
    }
    reader.readAsArrayBuffer(file)
  })
}

export function formatFileSize(size: number): string {
  return `${Math.round(size / 1000)} KB`
}
