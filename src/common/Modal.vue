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

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Bus } from '@/helpers'

const emit = defineEmits<{
  (event: 'update:is-shown', value: boolean): void
}>()

const props = withDefaults(
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

watch(
  () => props.isShown,
  newValue => {
    newValue
      ? Bus.emit(Bus.eventList.openModal)
      : Bus.emit(Bus.eventList.closeModal)
  },
)
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
  position: relative;
  background: var(--col-intense);
  padding: toRem(40) toRem(24) toRem(30);
  border-radius: var(--border-radius-large);
  margin: auto;
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
