import { utils } from 'ethers'
import { BytesLike, ZKPPointsStructType } from '@/types'

const p256 = (n: number | bigint) => {
  let nstr = n.toString(16)
  while (nstr.length < 64) nstr = '0' + nstr
  return `0x${nstr}`
}

export const generateZKPPointsStructAndPublicHash = async (
  secretHash: BytesLike,
  signerAddress: string,
) => {
  // eslint-disable-next-line
  // @ts-ignore
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { hash: secretHash, msgSender: BigInt(signerAddress) },
    '/circuits/generated_circuits/hash.wasm',
    '/circuits/generated_circuits/hash_final.zkey',
  )

  proof.pi_a.pop()
  proof.pi_b.pop()
  proof.pi_c.pop()

  const ZKPPointsStruct: ZKPPointsStructType = {
    a: [p256(BigInt(proof.pi_a[0])), p256(BigInt(proof.pi_a[1]))],
    b: [
      [p256(BigInt(proof.pi_b[0][1])), p256(BigInt(proof.pi_b[0][0]))],
      [p256(BigInt(proof.pi_b[1][1])), p256(BigInt(proof.pi_b[1][0]))],
    ],
    c: [p256(BigInt(proof.pi_c[0])), p256(BigInt(proof.pi_c[1]))],
  }

  const publicHash: BytesLike = utils.hexZeroPad(
    utils.hexlify(BigInt(publicSignals[0])),
    32,
  )

  return { ZKPPointsStruct, publicHash }
}
