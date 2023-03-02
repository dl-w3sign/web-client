<template>
  <teleport to="#modal">
    <transition name="modal" appear>
      <div
        v-if="isShown"
        class="modal__wrapper"
        ref="modalWrapper"
        @click="onWrapperClick"
      >
        <div class="modal__pane" v-bind="$attrs">
          <slot :close="closeModal" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()

withDefaults(
  defineProps<{
    isShown?: boolean
    isCloseByClickOutside?: boolean
  }>(),
  {
    isShown: false,
    isCloseByClickOutside: true,
  },
)

const modalWrapper = ref<HTMLDivElement | undefined>()

const closeModal = () => {
  emit('update:is-shown', false)
}

const onWrapperClick = (event: PointerEvent) => {
  if (event.target === modalWrapper.value) {
    closeModal()
    event.preventDefault()
  }
}
</script>

<style lang="scss" scoped>
.modal__wrapper {
  display: flex;
  position: absolute;
  z-index: var(--z-modal);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--col-pesky);
  overflow-y: scroll;
  padding: 4%;

  &::-webkit-scrollbar-thumb {
    background: var(--col-flexible);

    &:hover {
      background: var(--col-brittle);

      @include respond-to(375px) {
        background: var(--col-flexible);
      }
    }

    @include respond-to(375px) {
      background: var(--col-brittle);
    }
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-corner {
    @include respond-to(375px) {
      background: var(--col-rich);
    }
  }

  @include respond-to(tablet) {
    padding: 2%;
  }
}

.modal__pane {
  background: var(--col-intense);
  padding: toRem(32);
  border-radius: var(--border-radius-large);
  margin: auto;
  width: toRem(608);
  flex-shrink: 0;

  @include respond-to(tablet) {
    padding: toRem(16);
    width: toRem(343);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: 0.25s ease;
  transition-property: opacity, transform;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
