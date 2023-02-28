<template>
  <modal v-slot="{ close }">
    <div class="doc-verification-modal">
      <h3 class="doc-verification-modal__title">
        <icon
          class="doc-creation-modal__title-icon"
          :name="$icons.checkSquare"
        />
        {{ $t('doc-verification-modal.title') }}
      </h3>
      <doc-verification-form @cancel="close" />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, Icon } from '@/common'
import { DocVerificationForm } from '@/forms'
</script>

<style lang="scss" scoped>
.doc-verification-modal__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRem(16);
  margin-bottom: toRem(24);

  @include respond-to('tablet') {
    margin-bottom: toRem(12);

    @include h4;
  }
}

.doc-verification-modal__title-icon {
  width: toRem(40);
  height: toRem(40);

  @include respond-to('tablet') {
    width: toRem(28);
    height: toRem(28);
  }
}
</style>
