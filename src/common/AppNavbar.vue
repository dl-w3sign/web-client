<script lang="ts" setup>
import { ConnectEthereum } from '@/common'
import { UseProvider } from '@/composables'
import { APP_KEYS } from '@/enums'
import { DocCreationModal, DocVerificationModal } from '@/modals'
import { ref, inject } from 'vue'

const web3Provider = inject<UseProvider>(APP_KEYS.web3Provider)

const isDocCreationModalShown = ref(false)
const updateDocCreationModalShow = (isShown: boolean) => {
  isDocCreationModalShown.value = isShown
}
const showDocCreationModal = () => {
  isDocCreationModalShown.value = true
}

const isDocVerificationModalShown = ref(false)
const updateDocVerificationModalShow = (isShown: boolean) => {
  isDocVerificationModalShown.value = isShown
}
const showDocVerificationModal = () => {
  isDocVerificationModalShown.value = true
}
</script>

<template>
  <header class="app-navbar">
    <router-link to="/" class="app-navbar__logo">
      {{ $t('navbar.logo') }}
    </router-link>
    <div class="app-navbar__control-box">
      <transition name="fade">
        <nav class="app-navbar__nav" v-if="web3Provider?.isConnected.value">
          <ul class="app-navbar__nav-list">
            <li class="app-navbar__nav-item">
              <button
                class="app-navbar__nav-button"
                @click.prevent="showDocCreationModal"
              >
                {{ $t('navbar.create-document-button') }}
              </button>
            </li>
            <li class="app-navbar__nav-item">
              <button
                class="app-navbar__nav-button"
                @click.prevent="showDocVerificationModal"
              >
                {{ $t('navbar.verify-document-button') }}
              </button>
            </li>
            <li class="app-navbar__nav-line" />
          </ul>
        </nav>
      </transition>
      <connect-ethereum
        class="app-navbar__connect-ethereum"
        :class="{
          'app-navbar__connect-ethereum--not-connected':
            !web3Provider?.isConnected.value,
        }"
      />
    </div>
    <doc-creation-modal
      :is-shown="isDocCreationModalShown"
      @update:is-shown="updateDocCreationModalShow"
    />
    <doc-verification-modal
      :is-shown="isDocVerificationModalShown"
      @update:is-shown="updateDocVerificationModalShow"
    />
  </header>
</template>

<style lang="scss" scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5%;
  padding-right: 2.78%;
  background: linear-gradient(
    87deg,
    var(--col-clear),
    var(--col-pure) 40%,
    var(--col-net)
  );
  backdrop-filter: blur(toRem(1.7));
  height: toRem(120);
  border-radius: toRem(4);
  min-width: toRem(1000);
}

.app-navbar__logo {
  font-family: 'Prompt', 'Arial', sans-serif;
  font-weight: 700;
  font-size: toRem(40);
  letter-spacing: 0.055em;
  color: var(--col-trendy);
  text-shadow: toRem(0) toRem(3.33) toRem(3.33) var(--col-weak);
  user-select: none;

  &:active,
  &:hover {
    color: var(--col-intense);
  }
}

.app-navbar__control-box {
  display: flex;
}

.app-navbar__nav {
  display: flex;
  margin: 0 toRem(41) 0 auto;
}

.app-navbar__nav-list {
  position: relative;
  margin: auto;
}

.app-navbar__nav-item {
  display: inline-block;
}

.app-navbar__nav-button {
  font-size: toRem(22.5);
  font-weight: 500;
  line-height: toRem(24);
  color: var(--col-intense);
  transition: var(--transition-duration);
  padding: toRem(15) toRem(34);

  &:active,
  &:focus {
    color: var(--col-primary);
  }
}

.app-navbar__nav-line {
  position: absolute;
  height: toRem(2);
  background: var(--col-primary);
  transition: var(--transation-duration-slow);
  bottom: toRem(4);
  pointer-events: none;
}

.app-navbar__connect-ethereum {
  --transition-background: background-color var(--transition-duration);

  transition: margin-right var(--transition-duration) ease-in,
    var(--transition-background);

  &--not-connected {
    margin-right: toRem(20);
    transition: margin-right var(--transition-duration) ease-in
        var(--transition-delay),
      var(--transition-background);
  }
}

.fade-enter-active {
  animation: fade-in calc(var(--transition-duration) * 5);
}

.fade-leave-active {
  animation: fade-out calc(var(--transition-delay));
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  25% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }

  94% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}
</style>
