<template>
  <div class="main-page">
    <div class="main-page__introduction">
      <div class="main-page__welcome">
        <h1>
          {{ $t('main-page.welcome-message') }}
        </h1>
        <svg class="main-page__welcome-background-img">
          <use href="/branding/ribbon.svg#ribbon" />
        </svg>
      </div>
      <h4 class="main-page__description">
        {{ $t('main-page.description') }}
      </h4>
    </div>
    <div
      class="main-page__container"
      :class="{
        'main-page__container--lifted':
          web3Store.provider.isConnected && web3Store.isValidChain,
      }"
    >
      <transition name="fade">
        <div
          v-show="!web3Store.provider.isConnected || !web3Store.isValidChain"
          class="main-page__connect-ethereum"
          :class="{
            'main-page__connect-ethereum--connected':
              web3Store.provider.isConnected,
          }"
        >
          <h4 class="main-page__connect-ethereum-message">
            {{ ethereumMessage }}
          </h4>
          <connect-ethereum
            v-if="!web3Store.provider.isConnected"
            class="main-page__connect-ethereum-button"
            preset="primary"
          />
        </div>
      </transition>
      <div class="main-page__card">
        <h2 class="main-page__card-title">
          {{ $t('main-page.doc-creation-card-title') }}
        </h2>
        <div class="main-page__card-illustration-wrp">
          <doc-creation-illustration
            class="main-page__card-illustration"
            :is-active="
              web3Store.provider.isConnected && web3Store.isValidChain
            "
          />
        </div>
        <app-button
          class="main-page__card-button"
          preset="primary"
          :text="$t('main-page.doc-creation-card-button-text')"
          :disabled="!web3Store.provider.isConnected || !web3Store.isValidChain"
          @click="isDocCreationModalShown = true"
        />
        <doc-creation-modal v-model:is-shown="isDocCreationModalShown" />
      </div>
      <div class="main-page__card">
        <h2 class="main-page__card-title">
          {{ $t('main-page.doc-verification-card-title') }}
        </h2>
        <div class="main-page__card-illustration-wrp">
          <doc-verification-illustration
            class="main-page__card-illustration"
            :is-active="
              web3Store.provider.isConnected && web3Store.isValidChain
            "
          />
        </div>
        <app-button
          class="main-page__card-button"
          preset="primary"
          :text="$t('main-page.doc-verification-card-button-text')"
          :disabled="!web3Store.provider.isConnected || !web3Store.isValidChain"
          @click="isDocVerificationModalShown = true"
        />
        <doc-verification-modal
          v-model:is-shown="isDocVerificationModalShown"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton, ConnectEthereum } from '@/common'
import { useContext } from '@/composables'
import {
  DocCreationIllustration,
  DocVerificationIllustration,
} from '@/illustrations'
import { DocCreationModal, DocVerificationModal } from '@/modals'
import { useWeb3ProvidersStore } from '@/store'
import { ref, computed } from 'vue'

const web3Store = useWeb3ProvidersStore()
const { $t } = useContext()

const isDocCreationModalShown = ref(false)
const isDocVerificationModalShown = ref(false)

const ethereumMessage = computed(() => {
  switch (true) {
    case !web3Store.provider.isConnected:
      return $t('main-page.connect-ethereum-message')
    case !web3Store.isValidChain:
      return $t('main-page.switch-ethereum-message')
    default:
      return $t('main-page.connected-ethereum-message')
  }
})
</script>

<style lang="scss" scoped>
.main-page__introduction {
  margin: 0 auto;
  padding: toRem(44) toRem(44) toRem(28);
  fill: var(--col-peaceful);
  transition: fill var(--transition-duration-slow);
  max-width: max-content;
  text-align: center;

  &:hover {
    fill: var(--col-quiet);
  }

  @include respond-to(xmedium) {
    padding: toRem(38) toRem(38) toRem(24);
  }

  @include respond-to(medium) {
    padding: toRem(36) toRem(36) toRem(22);
  }

  @include respond-to(tablet) {
    padding: toRem(24) toRem(16) toRem(30);
  }
}

.main-page__welcome {
  position: relative;
  z-index: var(--z-layer-20);
  padding-bottom: toRem(22);
  width: toRem(822);

  @include respond-to(xmedium) {
    width: toRem(738);
  }

  @include respond-to(medium) {
    width: toRem(682);
  }

  @include respond-to(tablet) {
    width: toRem(564);
  }

  @include respond-to(small) {
    width: 100%;
  }
}

.main-page__welcome-background-img {
  position: absolute;
  bottom: toRem(0);
  left: toRem(0);
  z-index: var(--z-layer-negative-10);
  height: toRem(51);
  width: 100%;

  @include respond-to(xmedium) {
    height: toRem(46);
  }

  @include respond-to(medium) {
    height: toRem(43);
  }

  @include respond-to(tablet) {
    height: toRem(36);
  }
}

.main-page__description {
  color: var(--col-fancy);
  max-width: toRem(698);
  margin: 0 auto;

  @include respond-to(medium) {
    max-width: toRem(650);
  }

  @include respond-to(tablet) {
    max-width: toRem(520);
  }

  @include respond-to(small) {
    max-width: 100%;
  }
}

.main-page__connect-ethereum {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: toRem(16);
  background: var(--col-great);
  height: toRem(104);
  border-radius: var(--border-radius-large);
  padding: toRem(24) 7.8%;
  transition: background-color var(--transition-duration-slow);

  &--connected {
    justify-content: center;
  }

  &:hover {
    background: var(--col-mild);
  }

  @include respond-to(tablet) {
    flex-direction: column;
    height: toRem(168);
    margin: 0 toRem(16);
  }
}

.main-page__connect-ethereum-message {
  text-align: center;
  white-space: pre-line;
}

.main-page__connect-ethereum-button {
  width: toRem(256);
}

.main-page__container {
  position: relative;
  display: flex;
  gap: toRem(32);
  padding-top: toRem(128);
  transition: padding var(--transition-duration-slow) ease;
  max-width: max-content;
  margin: 0 auto toRem(44);

  &--lifted {
    transition-delay: 3.7s;
    padding-top: 0;
  }

  @include respond-to(medium) {
    gap: toRem(16);

    &:not(.main-page__container--lifted) {
      padding-top: toRem(120);
    }
  }

  @include respond-to(tablet) {
    flex-direction: column;
    max-width: toRem(600);
    margin: 0 auto toRem(32);
    padding: 0 toRem(16);

    &:not(.main-page__container--lifted) {
      padding-top: toRem(184);
    }
  }
}

.main-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: toRem(16);
  color: var(--col-fine);
  background: var(--col-great);
  border-radius: var(--border-radius-large);
  padding: toRem(27) toRem(81);
  transition: background-color var(--transition-duration-slow);

  &:hover {
    background: var(--col-mild);
  }

  @include respond-to(xmedium) {
    padding: toRem(27) toRem(60);
  }

  @include respond-to(medium) {
    padding: toRem(27) toRem(50);
  }

  @include respond-to(tablet) {
    width: 100%;
  }
}

.main-page__card-title {
  @include caption;
}

.main-page__card-illustration-wrp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: toRem(233);
  width: toRem(233);
  overflow: hidden;

  @include respond-to(xsmall) {
    height: toRem(163);
    width: toRem(163);
  }
}

.main-page__card-illustration {
  transform: scale(0.83511);

  @include respond-to(xsmall) {
    transform: scale(0.584);
  }
}

.main-page__card-button {
  @include respond-to(tablet) {
    max-width: toRem(233);
  }

  @include respond-to(xsmall) {
    max-width: toRem(163);
  }
}

.fade-leave-to {
  animation: fade 2s ease 2s;
}

.fade-enter-from {
  display: none;
}

.fade-enter-to {
  opacity: 0;
  animation: fade var(--transition-duration-slow) ease
    var(--transition-duration) reverse;
}

@keyframes fade {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
