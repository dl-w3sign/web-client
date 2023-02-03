import BigNumber from 'bignumber.js'

export type BnLike = string | number | BigNumber | BN

export class BN {
  #bn: BigNumber

  constructor(bigLike: BnLike) {
    this.#bn = this._bn(bigLike)
  }

  toNumber(): number {
    return this.#bn.toNumber()
  }

  private _bn(value: BnLike): BigNumber {
    if (BigNumber.isBigNumber(value)) {
      return value
    }

    if (value instanceof BN) {
      return value.#bn
    }

    try {
      return new BigNumber(value)
    } catch (error) {
      throw new TypeError(`Cannot convert the given "${value}" to BN!`)
    }
  }
}
