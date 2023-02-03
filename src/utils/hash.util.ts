import { BytesLike, utils } from 'ethers'

export type Keccak256Hash = string // 0x...

export class HashUtil {
  public static getKeccak256Hash(data: BytesLike): Keccak256Hash {
    return utils.keccak256(data)
  }
}
