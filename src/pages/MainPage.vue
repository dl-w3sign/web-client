<template>
  <div class="main-page">
    <div class="main-page__introduction">
      <div class="main-page__welcome">
        <h1 class="main-page__welcome-top">
          {{ $t('main-page.welcome-beginning') }}
          <icon class="main-page__welcome-top-icon" :name="$icons.wavingHand" />
        </h1>
        <h1 class="main-page__welcome-bottom">
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
            'main-page__connect-ethereum--connected': web3Provider?.isConnected,
          }"
        >
          <p
            :class="{
              'main-page__connect-ethereum-message': true,
              'main-page__connect-ethereum-message--bounded':
                !web3Provider?.isConnected,
            }"
          >
            {{
              web3Provider?.isConnected
                ? $t('main-page.connected-ethereum-message')
                : $t('main-page.connect-ethereum-message')
            }}
          </p>
          <connect-ethereum
            v-if="!web3Provider?.isConnected"
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
          <div
            :class="{
              'main-page__illustration': true,
              'main-page__illustration--active': web3Provider.isConnected,
            }"
          >
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
                <div class="main-page__illustration-icon-wrp">
                  <icon
                    :class="[
                      'main-page__illustration-icon',
                      'main-page__illustration-icon--large',
                    ]"
                    :name="getFileIconName(n)"
                  />
                </div>
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
          class="main-page__card-button"
          :text="$t('main-page.doc-creation-card-button-text')"
          :preset="BUTTON_PRESETS.primary"
          :state="
            web3Provider?.isConnected ? undefined : BUTTON_STATES.noneEvents
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
          <div
            :class="{
              'main-page__illustration': true,
              'main-page__illustration--active': web3Provider.isConnected,
            }"
          >
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
          class="main-page__card-button"
          :text="$t('main-page.doc-verification-card-button-text')"
          :preset="BUTTON_PRESETS.primary"
          :state="
            web3Provider?.isConnected ? undefined : BUTTON_STATES.noneEvents
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
import { BUTTON_PRESETS, BUTTON_STATES, ICON_NAMES } from '@/enums'
import { DocCreationModal, DocVerificationModal } from '@/modals'
import { useWeb3ProvidersStore } from '@/store'
import { ref, watch } from 'vue'

const { provider: web3Provider } = useWeb3ProvidersStore()

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
  () => web3Provider?.isConnected,
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
  max-width: max-content;
  text-align: center;

  &:hover {
    fill: var(--col-quiet);
  }

  @include respond-to(1100px) {
    padding: toRem(38) toRem(38) toRem(24);
  }

  @include respond-to(956px) {
    padding: toRem(36) toRem(36) toRem(22);
  }

  @include respond-to(850px) {
    padding: toRem(24) toRem(16) toRem(40);
  }
}

.main-page__welcome {
  position: relative;
  z-index: var(--z-main-page-welcome);
  padding: 0 toRem(28) toRem(23);

  @include respond-to(1100px) {
    // задать паддинги для свг
  }

  @include respond-to(956px) {
    // задать паддинги для свг
  }

  @include respond-to(850px) {
    // задать паддинги для свг
  }
}

.main-page__welcome-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRem(16);
  margin-bottom: toRem(7);

  @include respond-to(1100px) {
    @include h2;
  }

  @include respond-to(956px) {
    font-size: toRem(42);
    line-height: toRem(48);
    margin-bottom: toRem(3);
  }

  @include respond-to(850px) {
    margin-bottom: 0;

    @include h3;
  }
}

.main-page__welcome-top-icon {
  height: toRem(72);
  width: toRem(72);
  flex-shrink: 0;

  @include respond-to(1100px) {
    height: toRem(62);
    width: toRem(62);
  }

  @include respond-to(956px) {
    height: toRem(54);
    width: toRem(54);
  }

  @include respond-to(850px) {
    height: toRem(46);
    width: toRem(46);
  }
}

.main-page__welcome-bottom {
  @include respond-to(1100px) {
    @include h2;
  }

  @include respond-to(956px) {
    font-size: toRem(42);
    line-height: toRem(48);
  }

  @include respond-to(850px) {
    @include h3;
  }
}

.main-page__welcome-background-img {
  position: absolute;
  bottom: toRem(0);
  left: toRem(0);
  z-index: var(--z-main-page-welcome-background-img);
  height: toRem(51);
  width: 99.1%;
}

.main-page__description {
  font-size: toRem(20);
  line-height: 1.4;
  color: var(--col-fancy);
  max-width: toRem(698);
  margin: 0 auto;

  @include respond-to(1100px) {
    max-width: toRem(650);

    @include h5;
  }

  @include respond-to(956px) {
    max-width: toRem(580);
  }
}

.main-page__connect-ethereum {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--col-great);
  width: 100%;
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

  @include respond-to(850px) {
    height: toRem(96);
  }

  @include respond-to(768px) {
    flex-direction: column;
    padding: toRem(24);
    gap: toRem(16);
    height: toRem(168);
    min-width: toRem(395);
  }

  @include respond-to(460px) {
    width: toRem(343);
    min-width: 0;
  }
}

.main-page__connect-ethereum-message {
  text-align: center;

  &--bounded {
    width: toRem(214);
  }

  @include h4;

  @include respond-to(850px) {
    &--bounded {
      width: toRem(200);
    }

    @include h5;
  }
}

.main-page__connect-ethereum-button {
  width: toRem(256);
}

.main-page__container {
  position: relative;
  display: flex;
  justify-content: center;
  gap: toRem(32);
  padding-top: toRem(128);
  transition: padding var(--transition-duration-slow) ease;
  max-width: max-content;
  margin: auto;
  margin-bottom: toRem(44);

  &--lifted {
    transition-delay: 3.7s;
    padding-top: 0;
  }

  @include respond-to(956px) {
    gap: toRem(16);

    &:not(.main-page__container--lifted) {
      padding-top: toRem(120);
    }
  }

  @include respond-to(850px) {
    flex-direction: column;
    max-width: 100%;
    margin: 0 8.4% toRem(32);
    gap: toRem(24);
  }

  @include respond-to(768px) {
    gap: toRem(16);
    margin: 0 toRem(16) toRem(32);

    &:not(.main-page__container--lifted) {
      padding-top: toRem(184);
    }
  }

  @include respond-to(460px) {
    width: toRem(343);
    margin: 0 auto toRem(32);
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
  width: toRem(395);
  height: toRem(395);
  padding: toRem(27) toRem(81);
  transition: background-color var(--transition-duration-slow);

  &:hover {
    background: var(--col-mild);
  }

  @include respond-to(850px) {
    width: 100%;
  }

  @include respond-to(460px) {
    height: toRem(343);
    width: toRem(343);
    padding: toRem(38) toRem(90);
  }
}

.main-page__card-title {
  @include text-caption;
}

.main-page__card-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  height: toRem(233);
  width: toRem(233);
  transform: scale(0.83511);

  @include respond-to(460px) {
    height: toRem(163);
    width: toRem(163);
    transform: scale(0.584);
  }
}

.main-page__card-button {
  @include respond-to(850px) {
    max-width: toRem(233);
  }
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
  transition: background-color var(--transition-duration);

  &:hover {
    &:nth-of-type(1) {
      background: var(--col-creative);
    }

    &:nth-of-type(2) {
      background: var(--col-implicit);
    }

    &:nth-of-type(3) {
      background: var(--col-visual);
    }
  }
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

.main-page__illustration-icon-wrp {
  .main-page__illustration--active & {
    @include shimmer-animation;
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

  .main-page__illustration--active & {
    @include shimmer-animation;
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

  .main-page__illustration--active & {
    animation: rotate 13s ease infinite;
  }
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

  .main-page__illustration--active & {
    animation: progress 13s ease infinite;
  }
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

  .main-page__illustration--active & {
    @include shimmer-animation;
  }
}

.main-page__illustration-signer-avatar {
  height: toRem(19.16);
  width: toRem(19.16);
  background: var(--col-calm);
  border-radius: 50%;

  &--smart {
    background: var(--col-smart);
  }

  .main-page__illustration--active & {
    @include shimmer-animation;
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

@keyframes progress {
  0% {
    background: var(--col-peaceful);
  }

  11% {
    background: var(--col-quiet);
  }

  23% {
    background: var(--col-peaceful);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(-30deg);
  }

  23% {
    transform: rotate(330deg);
  }

  100% {
    transform: rotate(330deg);
  }
}
</style>
