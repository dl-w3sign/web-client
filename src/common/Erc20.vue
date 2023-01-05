<script lang="ts" setup>
import { useErc20, UseProvider } from '@/composables'
import { reactive, ref } from 'vue'
import { ErrorHandler } from '@/helpers'

const props = defineProps<{
  provider: UseProvider
}>()

const isLoaded = ref(false)
const isLoadFailed = ref(false)

const transferForm = reactive({
  address: '',
  amount: '',
})

const mintForm = reactive({
  to: '',
  amount: '',
})

const erc20 = useErc20(
  props.provider,
  '0xBd7D317a57eF8211d2A40d2CF8E9cCF3c79a1aa0',
)

const tryMint = async () => {
  try {
    await erc20.mint(mintForm.to, +mintForm.amount)
    await init()
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const tryTransfer = async () => {
  try {
    await erc20.transfer(transferForm.address, +transferForm.amount)
    await init()
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const init = async () => {
  isLoaded.value = false
  isLoadFailed.value = false
  try {
    await erc20.loadDetails()
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
    isLoadFailed.value = true
  }
  isLoaded.value = true
}

init()
</script>

<template>
  <div class="erc20">
    <template v-if="isLoaded">
      <template v-if="isLoadFailed">
        <error-message :message="$t('erc20.loading-error-msg')" />
      </template>
      <template v-else>
        <h2 class="erc20__title">
          {{ $t('erc20.title') }}
        </h2>
        <div class="erc20__entries-wrp">
          <div class="erc20__entry">
            <span class="erc20__entry-lbl">
              {{ $t('erc20.name-lbl') }}
            </span>
            <span class="erc20__entry-value">
              {{ erc20.name.value }}
            </span>
          </div>
          <div class="erc20__entry">
            <span class="erc20__entry-lbl">
              {{ $t('erc20.symbol-lbl') }}
            </span>
            <span class="erc20__entry-value">
              {{ erc20.symbol.value }}
            </span>
          </div>
          <div class="erc20__entry">
            <span class="erc20__entry-lbl">
              {{ $t('erc20.decimals-lbl') }}
            </span>
            <span class="erc20__entry-value">
              {{ erc20.decimals.value }}
            </span>
          </div>
          <div class="erc20__entry">
            <span class="erc20__entry-lbl">
              {{ $t('erc20.total-supply-lbl') }}
            </span>
            <span class="erc20__entry-value">
              {{ erc20.totalSupply.value }}
            </span>
          </div>
          <div class="erc20__entry">
            <span class="erc20__entry-lbl">
              {{ $t('erc20.balance-lbl') }}
            </span>
            <span class="erc20__entry-value">
              {{ erc20.balance.value }}
            </span>
          </div>
        </div>
        <div class="erc20__actions-wrp">
          <div class="erc20__action">
            <span class="erc20__action-lbl">
              {{ $t('erc20.transfer-lbl') }}
            </span>
            <div class="erc20__action-control">
              <input-field
                v-model="transferForm.address"
                :placeholder="'address'"
              />
              <input-field
                v-model="transferForm.amount"
                :placeholder="'amount'"
              />
              <app-button :text="'submit'" @click="tryTransfer" />
            </div>
          </div>
          <div class="erc20__action">
            <span class="erc20__action-lbl">
              {{ $t('erc20.mint-lbl') }}
            </span>
            <div class="erc20__action-control">
              <input-field v-model="mintForm.to" :placeholder="'to'" />
              <input-field v-model="mintForm.amount" :placeholder="'amount'" />
              <app-button :text="'submit'" @click="tryMint" />
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.erc20 {
  display: flex;
  flex-direction: column;
  gap: toRem(24);
}

.erc20__title {
  font-size: toRem(36);
  font-weight: 700;
}

.erc20__entries-wrp {
  display: flex;
  flex-direction: column;
  gap: toRem(12);
}

.erc20__entry {
  display: flex;
  align-items: center;
  gap: toRem(24);
}

.erc20__entry-lbl {
  font-size: toRem(18);
  font-weight: 700;

  &:after {
    content: ':';
  }
}

.erc20__entry-value {
  font-style: italic;
}

.erc20__actions-wrp {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: toRem(24);
}

.erc20__action {
  display: flex;
  flex-direction: column;
  gap: toRem(12);
}

.erc20__action-lbl {
  font-size: toRem(18);
  font-weight: 500;
}

.erc20__action-control {
  display: flex;
  flex-direction: column;
  gap: toRem(12);
}
</style>
