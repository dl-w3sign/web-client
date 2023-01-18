<template>
  <teleport to="#modal">
    <transition name="modal">
      <div
        v-show="isShown"
        class="modal__wrapper"
        ref="modalWrapper"
        @click="onWrapperClick"
      >
        <div class="modal__pane">
          <slot :close="closeModal" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { Bus } from '@/helpers'

const EVENTS = {
  updateIsShown: 'update:is-shown',
}

export default defineComponent({
  name: 'modal',
  props: {
    isShown: {
      type: Boolean,
      default: false,
    },
    isCloseByClickOutside: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const modalWrapper = ref<HTMLDivElement | undefined>()

    const closeModal = () => {
      emit(EVENTS.updateIsShown, false)
    }

    const onWrapperClick = (event: PointerEvent) => {
      if (event.target === modalWrapper.value) {
        closeModal()
        event.preventDefault()
      }
    }

    watch(
      () => props.isShown,
      newValue => {
        if (newValue) Bus.emit(Bus.eventList.openModal)
      },
    )

    return {
      modalWrapper,

      closeModal,
      onWrapperClick,
    }
  },
})
</script>

<style lang="scss" scoped>
.modal__wrapper {
  display: flex;
  position: fixed;
  z-index: 5000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: vh(100);
  background: var(--col-pesky);
  overflow-y: scroll;
  padding: 4%;
}

.modal__pane {
  background: var(--col-intense);
  padding: toRem(32);
  border-radius: var(--border-radius-large);
  margin: auto;
  width: toRem(608);
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

.modal__wrapper::-webkit-scrollbar-thumb {
  background: var(--col-flexible);

  &:hover {
    background: var(--col-brittle);
  }
}
</style>
