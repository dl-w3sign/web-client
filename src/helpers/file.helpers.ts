import { FILE_TYPES, ICON_NAMES } from '@/enums'
import { HashUtil, Keccak256Hash } from '@/utils'

export function getFileIconName(file: File): ICON_NAMES {
  switch (file.type) {
    case FILE_TYPES.csv:
      return ICON_NAMES.fileCsv
    case FILE_TYPES.doc:
    case FILE_TYPES.docx:
      return ICON_NAMES.fileDoc
    case FILE_TYPES.jpg:
      return ICON_NAMES.fileJpg
    case FILE_TYPES.pdf:
      return ICON_NAMES.filePdf
    case FILE_TYPES.png:
      return ICON_NAMES.filePng
    case FILE_TYPES.xls:
      return ICON_NAMES.fileXls
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
  return new Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: 'kilobyte',
  }).format(Math.round(size / 1000))
}
