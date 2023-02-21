<template>
  <div class="select-field">
    <div ref="selectElement" class="select-field__select-wrp">
      <template v-if="$slots.dropup && !$slots.dropdown">
        <transition name="dropup">
          <slot
            name="dropup"
            :select-field="{
              select,
              isOpen: isDropMenuOpen,
              close: closeDropMenu,
              open: openDropMenu,
              toggle: toggleDropMenu,
            }"
          />
        </transition>
      </template>
      <button
        class="select-field__select-head"
        :class="{
          'select-field__select-head--with-opened-drop-menu': isDropMenuOpen,
          [`select-field__select-head--${state}`]: state,
          [`select-field__select-head--${preset}`]: preset,
        }"
        :disabled="state === 'waiting'"
        v-bind="$attrs"
        @click="toggleDropMenu"
      >
        <template v-if="$slots.head && !!modelValue">
          <slot
            name="head"
            :select-field="{
              select,
              isOpen: isDropMenuOpen,
              close: closeDropMenu,
              open: openDropMenu,
              toggle: toggleDropMenu,
            }"
          />
        </template>
        <template v-else>
          <template v-if="modelValue">
            {{ modelValue }}
          </template>
        </template>
        <icon
          class="select-field__select-head-indicator"
          :class="{
            'select-field__select-head-indicator--upward':
              ($slots.dropup && !isDropMenuOpen) ||
              ($slots.dropdown && isDropMenuOpen),
            [`select-field__select-head-indicator--${state}`]: state,
          }"
          :name="$icons.chevronDown"
        />
      </button>
      <template v-if="$slots.dropdown">
        <transition name="dropdown">
          <slot
            name="dropdown"
            :select-field="{
              select,
              isOpen: isDropMenuOpen,
              close: closeDropMenu,
              open: openDropMenu,
              toggle: toggleDropMenu,
            }"
          />
        </transition>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { useRouter } from '@/router'
import { ref, computed, useAttrs, onMounted, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    state?: string
    preset?: string
  }>(),
  {
    modelValue: '',
    state: undefined,
    preset: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void
}>()

const attrs = useAttrs()

const selectElement = ref<HTMLDivElement>()

const isDropMenuOpen = ref(false)

const router = useRouter()

router.afterEach(() => {
  closeDropMenu()
})

const isDisabled = computed(() =>
  ['', 'disabled', true].includes(attrs.disabled as string | boolean),
)

const isReadonly = computed(() =>
  ['', 'readonly', true].includes(attrs.readonly as string | boolean),
)

const toggleDropMenu = () => {
  isDropMenuOpen.value ? closeDropMenu() : openDropMenu()
}

const openDropMenu = () => {
  if (isDisabled.value || isReadonly.value) return

  isDropMenuOpen.value = true
}

const closeDropMenu = () => {
  isDropMenuOpen.value = false
}

const select = (value: string | number) => {
  if (isDisabled.value || isReadonly.value) return

  emit('update:modelValue', value)
  closeDropMenu()
}

onMounted(() => {
  if (selectElement.value) {
    onClickOutside(selectElement, () => {
      closeDropMenu()
    })
  }
})

watch(
  () => props.modelValue,
  () => {
    closeDropMenu()
  },
)
</script>

<style lang="scss" scoped>
.select-field__select-wrp {
  height: inherit;
  width: inherit;
}

.select-field__select-head {
  position: relative;
  height: inherit;
  width: inherit;
  transition-property: background-color, border, color;
  transition-duration: var(--transition-duration);
  border-radius: var(--border-radius);
  color: var(--col-trendy);

  &--outline-brittle {
    border: toRem(1) solid var(--col-brittle);

    &:not([disabled]):hover {
      border-color: var(--col-flexible);
    }

    &:not([disabled]):active {
      border-color: var(--col-initial);
    }
  }

  &--outline-wise {
    background: var(--col-weak);
    border: toRem(1) solid var(--col-wise);
  }

  &--with-opened-drop-menu {
    &.select-field__select-head--outline-brittle {
      border-color: var(--col-primary);

      &:not([disabled]):hover {
        border-color: var(--col-primary);
      }
    }
  }

  &--waiting {
    cursor: wait;

    &.select-field__select-head--outline-brittle {
      border-color: var(--col-primary);
    }
  }

  @include respond-to(580px) {
    padding-right: toRem(27);
  }
}

.select-field__select-head-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  right: toRem(16);
  margin: auto 0;
  height: toRem(24);
  width: toRem(24);
  transition: transform var(--transition-duration);

  &--upward {
    transform: rotate(-180deg);
  }

  &--waiting {
    transform: rotate(-90deg);
  }

  @include respond-to(580px) {
    right: toRem(8);
    height: toRem(20);
    width: toRem(20);
  }
}

.dropdown-enter-active {
  animation: dropdown ease-out var(--transition-duration);
}

.dropdown-leave-active {
  animation: dropdown ease-out var(--transition-duration) reverse;
}

.dropup-enter-active {
  animation: dropup ease-out var(--transition-duration);
}

.dropup-leave-active {
  animation: dropup ease-out var(--transition-duration) reverse;
}

@keyframes dropdown {
  from {
    opacity: 0;
    transform-origin: top;
    transform: scaleY(0);
  }

  to {
    opacity: 1;
    transform-origin: top;
  }
}

@keyframes dropup {
  from {
    opacity: 0;
    transform-origin: bottom;
    transform: scaleY(0);
  }

  to {
    opacity: 1;
    transform-origin: bottom;
  }
}
</style>
