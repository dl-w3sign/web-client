<template>
  <modal v-slot="{ close }">
    <div class="doc-creation-modal">
      <h3 class="doc-creation-modal__title">
        {{ $t('doc-creation-modal.title') }}
      </h3>
      <doc-creation-form
        class="doc-creation-modal__form"
        @complete="isCloseButtonShown = true"
      />
      <app-button
        v-show="isCloseButtonShown"
        :preset="BUTTON_PRESETS.primary"
        class="doc-creation-modal__close-button"
        @click="close"
      >
        {{ $t('doc-creation-modal.close-button-text') }}
      </app-button>
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, AppButton } from '@/common'
import { IMAGE_SOURCES, BUTTON_PRESETS, APP_KEYS } from '@/enums'
import { DocCreationForm } from '@/forms'
import { Bus } from '@/helpers'
import { inject, useAttrs, watch, ref } from 'vue'

const isCloseButtonShown = ref(false)

const attrs = useAttrs()

const setAppWrapperBackground = inject<(url?: IMAGE_SOURCES) => void>(
  APP_KEYS.setAppWrapperBackground,
)

const toggleAppWrapperBackground = (isShown: boolean) => {
  if (setAppWrapperBackground) {
    if (isShown) {
      setAppWrapperBackground(IMAGE_SOURCES.appDocCreationBackground)
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

<style lang="scss">
.doc-creation-modal__form {
  margin-top: toRem(28);
}

.doc-creation-modal__close-button {
  height: toRem(48);
  margin-top: toRem(40);
}
</style>
