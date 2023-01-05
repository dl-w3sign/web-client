import { ref } from 'vue'
import { UseProvider, Erc20, Erc20__factory } from '@/types'
import { BN } from '@/utils/math.util'

export const useErc20 = (provider: UseProvider, address?: string) => {
  const _instance = ref<Erc20 | undefined>()
  const _instance_rw = ref<Erc20 | undefined>()

  if (
    address &&
    provider.currentProvider.value &&
    provider.currentSigner.value
  ) {
    _instance.value = Erc20__factory.connect(
      address,
      provider.currentProvider.value,
    )
    _instance_rw.value = Erc20__factory.connect(
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
      _instance.value = Erc20__factory.connect(
        address,
        provider.currentProvider.value,
      )
      _instance_rw.value = Erc20__factory.connect(
        address,
        provider.currentSigner.value,
      )
    }
  }

  const allowance = ref('')

  const decimals = ref<number | undefined>()

  const name = ref('')

  const owner = ref('')

  const symbol = ref('')

  const totalSupply = ref('')

  const balance = ref('')

  const loadDetails = async () => {
    if (!_instance.value) return

    await Promise.all([
      getDecimals(),
      getName(),
      getOwner(),
      getSymbol(),
      getTotalSupply(),
    ])
    if (provider.currentSigner.value) {
      balance.value = await getBalanceOf(
        await provider.currentSigner.value?.getAddress(),
      )
    }
  }

  const approve = async (spender: string, amount: number) => {
    await _instance_rw.value?.approve(
      spender,
      new BN(amount).toFraction(decimals.value).toString(),
    )
  }

  const decreaseAllowance = async (
    spender: string,
    subtractedValue: number,
  ) => {
    await _instance_rw.value?.decreaseAllowance(
      spender,
      new BN(subtractedValue).toFraction(decimals.value).toString(),
    )
  }

  const increaseAllowance = async (spender: string, addedValue: number) => {
    await _instance_rw.value?.increaseAllowance(
      spender,
      new BN(addedValue).toFraction(decimals.value).toString(),
    )
  }

  const mint = async (to: string, amount: number) => {
    await _instance_rw.value?.mint(
      to,
      new BN(amount).toFraction(decimals.value).toString(),
    )
  }

  const renounceOwnership = async () => {
    await _instance_rw.value?.renounceOwnership()
  }

  const transfer = async (address: string, amount: number) => {
    await _instance_rw.value?.transfer(
      address,
      new BN(amount).toFraction(decimals.value).toString(),
    )
  }

  const transferFrom = async (from: string, to: string, amount: number) => {
    await _instance_rw.value?.transferFrom(
      from,
      to,
      new BN(amount).toFraction(decimals.value).toString(),
    )
  }

  const getAllowance = async (owner: string, spender: string) => {
    const _allowance = await _instance.value?.allowance(owner, spender)
    if (_allowance) {
      allowance.value = _allowance.toString()
    }
  }

  const getBalanceOf = async (address: string) => {
    const _balance = await _instance.value?.balanceOf(address)

    return _balance ? _balance.toString() : ''
  }

  const getDecimals = async () => {
    if (_instance.value?.decimals) {
      decimals.value = await _instance.value?.decimals()
    }
  }

  const getName = async () => {
    if (_instance.value?.name) {
      name.value = await _instance.value?.name()
    }
  }

  const getOwner = async () => {
    if (_instance.value?.owner) {
      owner.value = await _instance.value?.owner()
    }
  }

  const getSymbol = async () => {
    if (_instance.value?.symbol) {
      symbol.value = await _instance.value?.symbol()
    }
  }

  const getTotalSupply = async () => {
    const _totalSupply = await _instance.value?.totalSupply()

    if (_totalSupply) {
      totalSupply.value = _totalSupply.toString()
    }
  }

  return {
    allowance,
    decimals,
    name,
    owner,
    symbol,
    totalSupply,
    balance,

    init,
    loadDetails,

    useErc20,
    approve,
    decreaseAllowance,
    increaseAllowance,
    mint,
    renounceOwnership,
    transfer,
    transferFrom,

    getAllowance,
    getBalanceOf,
    getDecimals,
    getName,
    getOwner,
    getSymbol,
    getTotalSupply,
  }
}
