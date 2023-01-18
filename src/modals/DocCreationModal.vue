<template>
  <modal v-slot="{ close }">
    <div class="doc-creation-modal">
      <h3 class="doc-creation-modal__title">
        <icon class="doc-creation-modal__title-icon" :name="$icons.note" />
        {{ $t('doc-creation-modal.title') }}
      </h3>
      <doc-creation-form :cancel="close" />
    </div>
  </modal>
</template>

<script lang="ts" setup>
import { Modal, Icon } from '@/common'
import { DocCreationForm } from '@/forms'
</script>

<style lang="scss">
.doc-creation-modal__title {
  display: flex;
  justify-content: center;
  gap: toRem(16);
  margin-bottom: toRem(24);
}

.doc-creation-modal__title-icon {
  width: toRem(40);
  height: toRem(40);
}
</style>
