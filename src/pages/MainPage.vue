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
          <use href="branding/ribbon.svg#ribbon" />
        </svg>
      </div>
      <p class="main-page__description">
        {{ $t('main-page.description') }}
      </p>
    </div>
    <div
      :class="{
        'main-page__container': true,
        'main-page__container--lifted': !isConnectEthereumShown,
      }"
    >
      <transition name="fade">
        <div
          v-if="isConnectEthereumShown"
          :class="{
            'main-page__connect-ethereum': true,
            'main-page__connect-ethereum--connected':
              web3Provider?.isConnected.value,
          }"
        >
          <p
            :class="{
              'main-page__connect-ethereum-message': true,
              'main-page__connect-ethereum-message--bounded':
                !web3Provider?.isConnected.value,
            }"
          >
            {{
              web3Provider?.isConnected.value
                ? $t('main-page.connected-ethereum-message')
                : $t('main-page.connect-ethereum-message')
            }}
          </p>
          <connect-ethereum
            v-if="!web3Provider?.isConnected.value"
            class="main-page__connect-ethereum-button"
            :button-preset="BUTTON_PRESETS.primary"
          />
        </div>
      </transition>
      <div class="main-page__card">
        <h2 class="main-page__card-title">
          {{ $t('main-page.doc-creation-card-title') }}
        </h2>
        <div class="main-page__card-illustration">
          <div class="main-page__illustration">
            <div class="main-page__illustration-header">
              <div class="main-page__illustration-header-tool-circle" />
              <div class="main-page__illustration-header-tool-circle" />
              <div class="main-page__illustration-header-tool-circle" />
            </div>
            <div class="main-page__illustration-main">
              <ul class="main-page__illustration-info-bar">
                <li class="main-page__illustration-info-bar-item">
                  <icon
                    class="main-page__illustration-icon"
                    :name="ICON_NAMES.download"
                  />
                  {{ $t('main-page.illustration-info-item-created') }}
                </li>
                <li
                  :class="[
                    'main-page__illustration-info-bar-item',
                    'main-page__illustration-info-bar-item--success',
                  ]"
                >
                  <icon
                    class="main-page__illustration-icon"
                    :name="ICON_NAMES.check2"
                  />
                  {{ $t('main-page.illustration-info-item-checked') }}
                </li>
              </ul>
              <h3
                :class="[
                  'main-page__illustration-skeleton',
                  'main-page__illustration-skeleton--large',
                ]"
              />
              <div
                class="main-page__illustration-document"
                v-for="n in 3"
                :key="n"
              >
                <icon
                  :class="[
                    'main-page__illustration-icon',
                    'main-page__illustration-icon--large',
                  ]"
                  :name="getFileIconName(n)"
                />
                <div>
                  <h4
                    :class="[
                      'main-page__illustration-skeleton',
                      'main-page__illustration-skeleton--medium',
                    ]"
                  />
                  <p
                    :class="{
                      'main-page__illustration-skeleton': true,
                      'main-page__illustration-skeleton--medium-wider': n === 1,
                      'main-page__illustration-skeleton--medium-wide': n === 2,
                      'main-page__illustration-skeleton--medium-widest':
                        n === 3,
                    }"
                  />
                  <p
                    v-if="n === 1 || n === 2"
                    :class="[
                      'main-page__illustration-skeleton',
                      'main-page__illustration-skeleton--medium-short',
                    ]"
                  />
                </div>
                <icon
                  :class="[
                    'main-page__illustration-icon',
                    'main-page__illustration-icon--medium',
                    'main-page__illustration-icon--left-centred-white',
                  ]"
                  :name="getStatusIconName(n)"
                />
              </div>
            </div>
          </div>
        </div>
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
        <h2 class="main-page__card-title">
          {{ $t('main-page.doc-verification-card-title') }}
        </h2>
        <div class="main-page__card-illustration">
          <div class="main-page__illustration">
            <div class="main-page__illustration-header">
              <div class="main-page__illustration-header-tool-circle" />
              <div class="main-page__illustration-header-tool-circle" />
              <div class="main-page__illustration-header-tool-circle" />
            </div>
            <div class="main-page__illustration-main">
              <h3 class="main-page__illustration-title">
                {{ $t('main-page.doc-verification-illustration-title') }}
                <span class="main-page__illustration-spinner" />
              </h3>
              <div class="main-page__illustration-progress">
                <div class="main-page__illustration-progress-bar" />
              </div>
              <h4
                :class="[
                  'main-page__illustration-skeleton',
                  'main-page__illustration-skeleton--large',
                ]"
              />
              <div
                class="main-page__illustration-signer-info"
                v-for="n in 2"
                :key="n"
              >
                <div class="main-page__illustration-signer-address">
                  <div
                    :class="{
                      'main-page__illustration-signer-avatar': true,
                      'main-page__illustration-signer-avatar--smart': n === 2,
                    }"
                  />
                  <h5
                    :class="[
                      'main-page__illustration-skeleton',
                      'main-page__illustration-skeleton--medium-longest',
                    ]"
                  />
                  <icon
                    :class="[
                      'main-page__illustration-icon',
                      'main-page__illustration-icon--medium',
                      'main-page__illustration-icon--left-centred-white',
                    ]"
                    :name="ICON_NAMES.checkCircle"
                  />
                </div>
                <div class="main-page__illustration-signer-timestamp">
                  <h5
                    :class="[
                      'main-page__illustration-skeleton',
                      'main-page__illustration-skeleton--small-wide',
                    ]"
                  />
                  <p
                    :class="[
                      'main-page__illustration-skeleton',
                      'main-page__illustration-skeleton--small',
                    ]"
                  />
                </div>
              </div>
              <div class="main-page__illustration-pagination">
                <div
                  v-for="n in 3"
                  :key="n"
                  :class="[
                    'main-page__illustration-skeleton',
                    'main-page__illustration-skeleton--small-short',
                  ]"
                />
              </div>
            </div>
          </div>
        </div>
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
import { BUTTON_PRESETS, BUTTON_STATES, APP_KEYS, ICON_NAMES } from '@/enums'
import { DocCreationModal, DocVerificationModal } from '@/modals'
import { inject, ref, watch } from 'vue'

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

const isConnectEthereumShown = ref(true)
const hideConnectEthereum = () => {
  isConnectEthereumShown.value = false
}
const showConnectEthereum = () => {
  isConnectEthereumShown.value = true
}

watch(
  () => web3Provider?.isConnected.value,
  newValue => {
    setTimeout(() => {
      newValue ? hideConnectEthereum() : showConnectEthereum()
    })
  },
)

const getFileIconName = (n: number) => {
  switch (n) {
    case 1:
      return ICON_NAMES.fileDoc
    case 2:
      return ICON_NAMES.fileCsv
    case 3:
      return ICON_NAMES.fileXls
    default:
      return ICON_NAMES.document
  }
}

const getStatusIconName = (n: number) => {
  switch (n) {
    case 1:
      return ICON_NAMES.downloadCircle2
    default:
      return ICON_NAMES.checkCircle
  }
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
  position: absolute;
  top: 0;
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
  position: relative;
  display: flex;
  justify-content: center;
  gap: toRem(32);
  margin-bottom: toRem(44);
  padding-top: toRem(128);
  transition: padding var(--transition-duration-slow) ease;

  &--lifted {
    transition-delay: 3.7s;
    padding-top: 0;
  }
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

.main-page__card-title {
  font-size: toRem(16);
  line-height: toRem(24);
  font-weight: 500;
}

.main-page__card-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  height: toRem(233);
  width: toRem(233);
}

.main-page__illustration {
  display: flex;
  flex-direction: column;
  height: toRem(279);
  width: toRem(279);
  font-family: 'Inter', 'Arial', sans-serif;
  font-size: toRem(12);
  line-height: 1;
  font-weight: 600;
  flex-shrink: 0;
  transform: scale(0.83511);
}

.main-page__illustration-header {
  display: flex;
  align-items: center;
  gap: toRem(8);
  flex-shrink: 0;
  padding: 0 toRem(14.6);
  height: toRem(32);
  background: var(--col-home);
  border-top-right-radius: toRem(16);
  border-top-left-radius: toRem(16);
}

.main-page__illustration-header-tool-circle {
  height: toRem(8);
  width: toRem(8);
  background: var(--col-intense);
  opacity: 0.8;
  border-radius: 50%;
}

.main-page__illustration-main {
  background: var(--col-intense);
  border-bottom-right-radius: toRem(16);
  border-bottom-left-radius: toRem(16);
  padding: toRem(13.2);
  height: 100%;
}

.main-page__illustration-info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRem(8.76);
  margin: toRem(2.8) auto toRem(25.9);
}

.main-page__illustration-info-bar-item {
  display: flex;
  align-items: center;
  gap: toRem(4);
  background: var(--col-tender);
  padding: toRem(8) toRem(12);
  border-radius: toRem(14);
  color: var(--col-primary);

  &--success {
    background: var(--col-simple);
    color: var(--col-success);
  }
}

.main-page__illustration-icon {
  height: toRem(12);
  width: toRem(12);

  &--medium {
    height: toRem(16.52);
    width: toRem(16.52);
  }

  &--large {
    height: toRem(33.5);
    width: toRem(33.5);
  }

  &--left-centred-white {
    margin-left: auto;
    align-self: center;
    color: var(--col-intense);
  }
}

.main-page__illustration-skeleton {
  width: toRem(97);
  background: var(--col-crude);

  &--small {
    height: toRem(6);
    width: toRem(40.7);
    border-radius: toRem(3);
  }

  &--small-short {
    height: toRem(6);
    width: toRem(25.15);
    border-radius: toRem(3);
  }

  &--small-wide {
    height: toRem(6);
    width: toRem(56.3);
    border-radius: toRem(3);
  }

  &--medium {
    height: toRem(9.6);
    width: toRem(34.73);
    border-radius: toRem(5);
  }

  &--medium-short {
    display: inline-block;
    height: toRem(9.6);
    width: toRem(19.2);
    margin-left: toRem(4.8);
    border-radius: toRem(4);
  }

  &--medium-wide {
    display: inline-block;
    height: toRem(9.6);
    width: toRem(56.3);
    border-radius: toRem(4);
    margin-top: toRem(6);
  }

  &--medium-wider {
    display: inline-block;
    height: toRem(9.6);
    width: toRem(82.62);
    border-radius: toRem(4);
    margin-top: toRem(6);
  }

  &--medium-widest {
    height: toRem(9.6);
    width: toRem(115);
    border-radius: toRem(4);
    margin-top: toRem(6);
  }

  &--medium-longest {
    height: toRem(9.6);
    width: toRem(134.1);
    border-radius: toRem(4);
  }

  &--large {
    height: toRem(14.4);
    border-radius: toRem(7);
    margin-left: toRem(4.8);
  }
}

.main-page__illustration-document {
  display: flex;
  gap: toRem(9);
  margin: 0 toRem(2.8);

  &:first-of-type {
    margin-top: toRem(11.85);
  }

  &:not(:first-of-type) {
    margin-top: toRem(16.5);
  }
}

.main-page__illustration-title {
  display: flex;
  justify-content: space-between;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
  color: var(--col-trendy);
  margin: toRem(3.8) toRem(14.3) toRem(10.74) toRem(4.8);
}

.main-page__illustration-spinner {
  display: block;
  height: toRem(14.4);
  width: toRem(14.4);
  border: toRem(2) solid var(--col-primary);
  border-radius: 50%;
  border-right-color: transparent;
  margin: toRem(1.8);
  transform: rotate(-30deg);
}

.main-page__illustration-progress {
  height: toRem(6);
  border-radius: toRem(3);
  background: var(--col-mild);
  margin-bottom: toRem(26.34);
}

.main-page__illustration-progress-bar {
  height: 100%;
  width: 71.08%;
  border-radius: inherit;
  background: var(--col-peaceful);
}

.main-page__illustration-signer-info {
  margin: 0 toRem(3.6) 0 toRem(2.4);
}

.main-page__illustration-signer-address {
  display: flex;
  align-items: center;
  gap: toRem(4.8);
  margin: toRem(14.37) 0 toRem(9.58);
  height: toRem(28.74);
  background: var(--col-great);
  border-radius: toRem(14);
  padding: toRem(4.8) toRem(9.6);
}

.main-page__illustration-signer-avatar {
  height: toRem(19.16);
  width: toRem(19.16);
  background: var(--col-calm);
  border-radius: 50%;

  &--smart {
    background: var(--col-smart);
  }
}

.main-page__illustration-signer-timestamp {
  display: flex;
  gap: toRem(6);
  justify-content: end;
}

.main-page__illustration-pagination {
  display: flex;
  justify-content: center;
  gap: toRem(4.8);
  margin-top: toRem(17.96);
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
