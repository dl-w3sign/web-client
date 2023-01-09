<template>
  <teleport to="#modal">
    <transition name="modal">
      <div v-show="isShown" class="modal__wrapper">
        <div class="modal__pane-wrapper">
          <div class="modal__pane" ref="modalPane">
            <slot :close="closeModal" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
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
    const modalPane = ref<HTMLElement | undefined>()

    onMounted(() => {
      if (modalPane.value) {
        if (props.isCloseByClickOutside) {
          onClickOutside(modalPane, () => {
            closeModal()
          })
        }
      }
    })

    const closeModal = () => {
      emit(EVENTS.updateIsShown, false)
    }

    watch(
      () => props.isShown,
      newValue => {
        newValue
          ? Bus.emit(Bus.eventList.openModal)
          : Bus.emit(Bus.eventList.closeModal)
      },
    )

    return {
      modalPane,

      closeModal,
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
}

.modal__pane-wrapper {
  margin: auto;
}

.modal__pane {
  margin: 8% 0;
  position: relative;
  background: var(--col-intense);
  padding: toRem(40) toRem(24) toRem(30);
  border-radius: var(--border-radius-large);
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
