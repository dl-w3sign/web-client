<template>
  <modal @update:is-shown="emit('update:is-shown', $event)">
    <div class="invalid-network-modal">
      <h3 class="invalid-network-modal__title">
        <icon
          class="invalid-network-modal__title-icon"
          :name="$icons.electricPlug"
        />
        {{ $t('invalid-network-modal.title') }}
      </h3>
      <transition name="fade" mode="out-in">
        <div
          v-if="isSwitchingOrAddingChain"
          class="invalid-network-modal__container"
        >
          <spinner />
          <h5 class="invalid-network-modal__message">
            {{ $t('invalid-network-modal.please-wait-msg') }}
          </h5>
        </div>
        <div v-else class="invalid-network-modal__container">
          <div class="invalid-network-modal__illustration-wrp">
            <invalid-network-illustration
              class="invalid-network-modal__illustration"
            />
          </div>
          <h5 class="invalid-network-modal__message">
            {{ $t('invalid-network-modal.message') }}
          </h5>
          <select-field
            class="invalid-network-modal__chain-select-field"
            preset="outline-brittle"
            v-model="chainId"
          >
            <template #head>
              <div class="invalid-network-modal__chain-select-field-head">
                <icon
                  class="invalid-network-modal__chain-select-field-icon"
                  :name="getIconNameByChainId(chainId)"
                />
                {{ getTitleByChainId(chainId) }}
              </div>
            </template>
            <template #dropup="{ selectField }">
              <div
                class="invalid-network-modal__chain-select-field-dropup"
                v-show="selectField.isOpen"
              >
                <button
                  v-for="admittedChainId in web3Store.admittedChainIds"
                  :key="admittedChainId"
                  class="invalid-network-modal__chain-select-field-dropup-item"
                  @click="selectField.select(admittedChainId)"
                >
                  <icon
                    class="invalid-network-modal__chain-select-field-icon"
                    :name="getIconNameByChainId(admittedChainId)"
                  />
                  {{ getTitleByChainId(admittedChainId) }}
                </button>
              </div>
            </template>
          </select-field>
          <app-button
            preset="primary"
            :text="$t('invalid-network-modal.button-text')"
            @click="switchAndClose"
          />
        </div>
      </transition>
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, Icon, Spinner, AppButton } from '@/common'
import { SelectField } from '@/fields'
import { getIconNameByChainId, getTitleByChainId } from '@/helpers'
import { InvalidNetworkIllustration } from '@/illustrations'
import { useWeb3ProvidersStore } from '@/store'
import { ChainId } from '@/types'
import { ref } from 'vue'

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()

const web3Store = useWeb3ProvidersStore()
const chainId = ref<ChainId>(web3Store.admittedChainIds[0])

const isSwitchingOrAddingChain = ref(false)
const switchAndClose = async () => {
  isSwitchingOrAddingChain.value = true
  await web3Store.trySwitchOrAddChain(chainId.value)
  if (web3Store.hasValidCurrentChain) emit('update:is-shown', false)
  isSwitchingOrAddingChain.value = false
}
</script>

<style lang="scss" scoped>
.invalid-network-modal__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: toRem(24);
  margin-top: toRem(24);

  @include respond-to(tablet) {
    gap: toRem(16);
    margin-top: toRem(16);
  }
}

.invalid-network-modal__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRem(16);
}

.invalid-network-modal__title-icon {
  width: toRem(40);
  height: toRem(40);

  @include respond-to(tablet) {
    width: toRem(28);
    height: toRem(28);
  }
}

.invalid-network-modal__message {
  text-align: center;
  white-space: pre-line;
}

.invalid-network-modal__illustration-wrp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: toRem(246);
  width: toRem(246);
  overflow: hidden;

  @include respond-to(tablet) {
    height: toRem(222);
    width: toRem(222);
  }
}

.invalid-network-modal__illustration {
  @include respond-to(tablet) {
    transform: scale(0.9024);
  }
}

.invalid-network-modal__chain-select-field {
  position: relative;
  height: toRem(48);
  width: 100%;
}

.invalid-network-modal__chain-select-field-head {
  display: flex;
  gap: toRem(12);
  padding: toRem(12) toRem(15);

  @include respond-to(tablet) {
    gap: toRem(8);
  }
}

.invalid-network-modal__chain-select-field-dropup {
  position: absolute;
  bottom: toRem(60);
  width: 100%;

  @include outline-brittle-dropdown;
}

.invalid-network-modal__chain-select-field-dropup-item {
  display: flex;
  gap: toRem(12);
  padding: toRem(12) toRem(15);

  @include respond-to(tablet) {
    gap: toRem(8);
  }

  @include outline-brittle-dropdown-item;
}

.invalid-network-modal__chain-select-field-icon {
  height: toRem(24);
  width: toRem(24);
}

.fade-leave-active {
  animation: fade-in ease-out var(--transition-duration) reverse;
}

.fade-enter-active {
  animation: fade-in ease-out var(--transition-duration-slow);
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
