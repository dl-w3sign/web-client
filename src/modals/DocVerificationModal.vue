<script lang="ts" setup>
import { Modal, AppBtn } from '@/common'
import { IMAGE_SOURCES, BUTTON_PRESETS, APP_KEYS } from '@/enums'
import { DocVerificationForm } from '@/forms'
import { Bus } from '@/helpers'
import { inject, useAttrs, watch, ref } from 'vue'

const isCloseButtonShown = ref(false)
const showCloseButton = () => {
  isCloseButtonShown.value = true
}

const attrs = useAttrs()

const setAppWrapperBackground = inject<(url?: IMAGE_SOURCES) => void>(
  APP_KEYS.setAppWrapperBackground,
)

const toggleAppWrapperBackground = (isShown: boolean) => {
  if (setAppWrapperBackground) {
    if (isShown) {
      setAppWrapperBackground(IMAGE_SOURCES.appDocVerificationBackground)
    } else {
      setAppWrapperBackground()
    }
  }
}

watch(
  () => attrs['is-shown'],
  newValue => {
    toggleAppWrapperBackground(newValue as boolean)
  },
)

const reset = () => {
  isCloseButtonShown.value = false
}

Bus.on(Bus.eventList.openModal, reset)
</script>

<template>
  <modal v-slot="{ close }">
    <div class="doc-verification-modal">
      <h3>{{ $t('doc-verification-modal.title') }}</h3>
      <doc-verification-form
        class="doc-verification-modal__form"
        @complete="showCloseButton"
      />
      <app-btn
        v-show="isCloseButtonShown"
        :preset="BUTTON_PRESETS.primary"
        class="doc-verification-modal__close-button"
        @click.prevent="close"
      >
        {{ $t('doc-verification-modal.close-button-text') }}
      </app-btn>
    </div>
  </modal>
</template>

<style lang="scss" scoped>
.doc-verification-modal__form {
  margin-top: toRem(28);
}

.doc-verification-modal__close-button {
  height: toRem(48);
  margin-top: toRem(40);
}
</style>
