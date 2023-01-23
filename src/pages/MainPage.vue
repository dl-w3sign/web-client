<template>
  <div class="main-page">
    <div class="main-page__introduction">
      <div class="main-page__welcome">
        <h1 class="main-page__welcome-top">
          {{ $t('main-page.welcome-beginning') }}
          <icon class="main-page__welcome-top-icon" :name="$icons.wavingHand" />
        </h1>
        <h1>
          {{ $t('main-page.welcome-continuing') }}
        </h1>
        <svg class="main-page__welcome-background-img">
          <use xlink:href="/branding/ribbon.svg#ribbon" />
        </svg>
      </div>
      <p class="main-page__description">
        {{ $t('main-page.description') }}
      </p>
    </div>
    <div
      v-if="web3Provider?.isConnected.value"
      class="main-page__connect-ethereum main-page__connect-ethereum--connected"
    >
      <p class="main-page__connect-ethereum-message">
        {{ $t('main-page.connected-ethereum-message') }}
      </p>
    </div>
    <div v-else class="main-page__connect-ethereum">
      <p
        :class="[
          'main-page__connect-ethereum-message',
          'main-page__connect-ethereum-message--bounded',
        ]"
      >
        {{ $t('main-page.connect-ethereum-message') }}
      </p>
      <connect-ethereum
        class="main-page__connect-ethereum-button"
        :button-preset="BUTTON_PRESETS.primary"
      />
    </div>
    <div class="main-page__container">
      <div class="main-page__card">
        <h5>
          {{ $t('main-page.doc-creation-card-title') }}
        </h5>
        <img src="/branding/doc-creation-model.png" />
        <app-button
          :text="$t('main-page.doc-creation-card-button-text')"
          :preset="BUTTON_PRESETS.primary"
          :state="
            web3Provider?.isConnected.value
              ? undefined
              : BUTTON_STATES.noneEvents
          "
          @click="showDocCreationModal"
        />
        <doc-creation-modal
          :is-shown="isDocCreationModalShown"
          @update:is-shown="hideDocCreationModal"
        />
      </div>
      <div class="main-page__card">
        <h5>
          {{ $t('main-page.doc-verification-card-title') }}
        </h5>
        <img src="/branding/doc-verification-model.png" />
        <app-button
          :text="$t('main-page.doc-verification-card-button-text')"
          :preset="BUTTON_PRESETS.primary"
          :state="
            web3Provider?.isConnected.value
              ? undefined
              : BUTTON_STATES.noneEvents
          "
          @click="showDocVerificationModal"
        />
        <doc-verification-modal
          :is-shown="isDocVerificationModalShown"
          @update:is-shown="hideDocVerificationModal"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, Icon, ConnectEthereum } from '@/common'
import { UseProvider } from '@/composables'
import { BUTTON_PRESETS, BUTTON_STATES, APP_KEYS } from '@/enums'
import { DocCreationModal, DocVerificationModal } from '@/modals'
import { inject, ref } from 'vue'

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)

const isDocCreationModalShown = ref(false)
const showDocCreationModal = () => {
  isDocCreationModalShown.value = true
}
const hideDocCreationModal = () => {
  isDocCreationModalShown.value = false
}

const isDocVerificationModalShown = ref(false)
const showDocVerificationModal = () => {
  isDocVerificationModalShown.value = true
}
const hideDocVerificationModal = () => {
  isDocVerificationModalShown.value = false
}
</script>

<style lang="scss" scoped>
.main-page__introduction {
  margin: 0 auto;
  padding: toRem(44) toRem(44) toRem(28);
  fill: var(--col-peaceful);
  transition: var(--transition-duration-slow);
  width: max-content;

  &:hover {
    fill: var(--col-quiet);
  }
}

.main-page__welcome {
  position: relative;
  z-index: var(--z-main-page-welcome);
  padding: 0 toRem(28) toRem(23);
}

.main-page__welcome-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRem(16);
  margin-bottom: toRem(7);
}

.main-page__welcome-top-icon {
  height: toRem(72);
  width: toRem(72);
}

.main-page__welcome-background-img {
  position: absolute;
  bottom: toRem(0);
  left: toRem(0);
  z-index: var(--z-main-page-welcome-background-img);
  width: toRem(977);
  height: toRem(51);
}

.main-page__description {
  font-size: toRem(20);
  line-height: 1.4;
  color: var(--col-fancy);
  text-align: center;
  width: toRem(698);
  margin: 0 auto;
}

.main-page__connect-ethereum {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--col-great);
  width: toRem(822);
  height: toRem(104);
  border-radius: var(--border-radius-large);
  margin: 0 auto toRem(24);
  padding: 0 toRem(64);

  &--connected {
    justify-content: center;
    opacity: 0;
    transition-property: visibility;
    transition-delay: 4s;
    animation: vanish 4s;
  }
}

.main-page__connect-ethereum-message {
  font-size: toRem(20);
  line-height: 1.4;
  text-align: center;

  &--bounded {
    width: toRem(214);
  }
}

.main-page__connect-ethereum-button {
  width: toRem(256);
  gap: toRem(8);
}

.main-page__container {
  display: flex;
  justify-content: center;
  gap: toRem(32);
  margin-bottom: toRem(99);
}

.main-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: toRem(16);
  color: var(--col-fine);
  background: var(--col-great);
  border-radius: var(--border-radius-large);
  width: toRem(395);
  height: toRem(395);
  padding: toRem(27) toRem(81);
}

@keyframes vanish {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
