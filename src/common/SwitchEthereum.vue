<template>
  <select-field
    class="switch-ethereum__select-field"
    :is-waiting="web3Store.isChainSwitching"
    :preset="
      web3Store.isValidChain || web3Store.isChainSwitching
        ? 'outline-brittle'
        : 'outline-wise'
    "
    :model-value="web3Store.provider.chainId"
    @update:model-value="web3Store.trySwitchOrAddChain"
  >
    <template #head>
      <div class="switch-ethereum__select-head">
        <icon
          class="switch-ethereum__button-icon"
          :name="
            getIconNameByChainId(
              web3Store.isChainSwitching
                ? (web3Store.chainIdOnSwitching as ChainId)
                : (web3Store.provider.chainId as ChainId),
            )
          "
        />
        <p class="switch-ethereum__chain-title">
          {{
            getTitleByChainId(
              web3Store.isChainSwitching
                ? (web3Store.chainIdOnSwitching as ChainId)
                : (web3Store.provider.chainId as ChainId),
            )
          }}
        </p>
      </div>
    </template>
    <template #dropdown="{ selectField }">
      <div
        :id="`dropdown-${uid}`"
        class="switch-ethereum__select-dropdown"
        v-show="selectField.isOpen"
      >
        <button
          v-for="admittedChainId in web3Store.admittedChainIds"
          :key="admittedChainId"
          class="switch-ethereum__select-item-button"
          @click="selectField.select(admittedChainId)"
        >
          <icon
            class="switch-ethereum__button-icon"
            :name="getIconNameByChainId(admittedChainId)"
          />
          {{ getTitleByChainId(admittedChainId) }}
        </button>
      </div>
    </template>
  </select-field>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { SelectField } from '@/fields'
import { getIconNameByChainId, getTitleByChainId } from '@/helpers'
import { useWeb3ProvidersStore } from '@/store'
import { ChainId } from '@/types'
import { v4 as generateUid } from 'uuid'

const web3Store = useWeb3ProvidersStore()
const uid = generateUid()
</script>

<style lang="scss" scoped>
.switch-ethereum__select-head {
  display: flex;
  align-items: center;
  width: 100%;
  gap: toRem(12);
  margin: 0 toRem(12) 0 toRem(15);

  @include respond-to(small) {
    margin: 0 toRem(4) 0 toRem(7);
  }
}

.switch-ethereum__select-item-button {
  display: flex;
  align-items: center;
  gap: toRem(12);
  padding: toRem(12) toRem(15);

  @include outline-brittle-dropdown-item;
}

.switch-ethereum__button-icon {
  height: toRem(24);
  width: toRem(24);
  color: var(--col-wise);
  flex-shrink: 0;
}

.switch-ethereum__chain-title {
  @include respond-to(small) {
    display: none;
  }

  @include body-large;
}

.switch-ethereum__select-dropdown {
  margin-top: toRem(12);

  @include outline-brittle-dropdown;
}
</style>
