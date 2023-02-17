<template>
  <div class="select-field">
    <div ref="selectElement" class="select-field__select-wrp">
      <button
        class="select-field__select-head"
        :class="{
          'select-field__select-head--with-opened-dropdown': isDropdownOpen,
          [`select-field__select-head--${state}`]: state,
          [`select-field__select-head--${preset}`]: preset,
        }"
        :disabled="state === 'waiting'"
        @click="toggleDropdown"
      >
        <template v-if="$slots.head && !!modelValue">
          <slot
            name="head"
            :select-field="{
              select,
              isOpen: isDropdownOpen,
              close: closeDropdown,
              open: openDropdown,
              toggle: toggleDropdown,
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
            'select-field__select-head-indicator--open': isDropdownOpen,
            [`select-field__select-head-indicator--${state}`]: state,
          }"
          :name="$icons.chevronDown"
        />
      </button>
      <transition name="dropdown">
        <slot
          :select-field="{
            select,
            isOpen: isDropdownOpen,
            close: closeDropdown,
            open: openDropdown,
            toggle: toggleDropdown,
          }"
        />
      </transition>
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

const isDropdownOpen = ref(false)

const router = useRouter()

router.afterEach(() => {
  closeDropdown()
})

const isDisabled = computed(() =>
  ['', 'disabled', true].includes(attrs.disabled as string | boolean),
)

const isReadonly = computed(() =>
  ['', 'readonly', true].includes(attrs.readonly as string | boolean),
)

const toggleDropdown = () => {
  isDropdownOpen.value ? closeDropdown() : openDropdown()
}

const openDropdown = () => {
  if (isDisabled.value || isReadonly.value) return

  isDropdownOpen.value = true
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const select = (value: string | number) => {
  if (isDisabled.value || isReadonly.value) return

  emit('update:modelValue', value)
  closeDropdown()
}

onMounted(() => {
  if (selectElement.value) {
    onClickOutside(selectElement, () => {
      closeDropdown()
    })
  }
})

watch(
  () => props.modelValue,
  () => {
    closeDropdown()
  },
)
</script>

<style lang="scss" scoped>
.select-field__select-wrp {
  height: 100%;
  width: 100%;
}

.select-field__select-head {
  position: relative;
  height: inherit;
  width: inherit;
  transition: var(--transition-duration);
  padding-right: toRem(39);
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

  &--with-opened-dropdown {
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

  &--open {
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
  animation: dropdown var(--transition-duration);
}

.dropdown-leave-active {
  animation: dropdown var(--transition-duration) reverse;
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
    transition: scaleY(1);
  }
}
</style>
