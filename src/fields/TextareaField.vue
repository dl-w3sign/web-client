<template>
  <div class="textarea-field">
    <label
      v-if="label"
      class="textarea-field__label"
      :for="`textarea-field--${uid}`"
    >
      {{ label }}
    </label>
    <div class="textarea-field__textarea-wrapper">
      <textarea
        ref="textarea"
        v-bind="$attrs"
        class="textarea-field__textarea"
        :class="{
          'textarea-field__textarea--copied': isCopied,
          'textarea-field__textarea--with-left-icon': leftIconName,
          'textarea-field__textarea--with-right-icon': rightIconName,
        }"
        :id="`textarea-field--${uid}`"
        :placeholder="placeholder"
        :value="modelValue"
        :tabindex="isDisabled || isReadonly ? -1 : $attrs.tabindex"
        :disabled="isDisabled || isReadonly"
        @input="updateModelValue"
      />
      <button
        v-if="isCopied"
        class="textarea-field__copy-button"
        @click.prevent="copy()"
      >
        <icon
          class="textarea-field__icon"
          :name="copied ? $icons.check : $icons.clipboardCopy"
        />
      </button>
      <icon
        v-else-if="rightIconName"
        :name="rightIconName"
        class="textarea-field__icon textarea-field__icon--right"
      />
      <icon
        v-if="leftIconName"
        :name="leftIconName"
        class="textarea-field__icon textarea-field__icon--left"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { useTextareaAutosize } from '@/composables'
import { useClipboard } from '@vueuse/core'
import { ICON_NAMES } from '@/enums'
import { getCurrentInstance, computed, useAttrs } from 'vue'
import { useWindowSize } from '@vueuse/core'

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  emit('update:modelValue', eventTarget.value)
}

const uid = getCurrentInstance()?.uid
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    isCopied?: boolean
    leftIconName?: ICON_NAMES
    rightIconName?: ICON_NAMES
  }>(),
  {
    label: '',
    placeholder: '',
    isCopied: false,
    leftIconName: undefined,
    rightIconName: undefined,
  },
)

const attrs = useAttrs()

const isDisabled = computed(() =>
  ['', 'disabled', true].includes(attrs.disabled as string | boolean),
)

const isReadonly = computed(() =>
  ['', 'readonly', true].includes(attrs.readonly as string | boolean),
)

const { copy, copied } = useClipboard({
  source: props.modelValue,
  copiedDuring: 5000,
})

const { width: windowWidth } = useWindowSize()
const { textarea } = useTextareaAutosize({
  watch: windowWidth,
})
</script>

<style lang="scss" scoped>
.textarea-field__label {
  display: block;
  margin-bottom: toRem(8);

  @include field-label;
}

.textarea-field__icon {
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  height: toRem(24);
  width: toRem(24);
  color: var(--col-intense);
  flex-shrink: 0;

  @include respond-to(850px) {
    height: toRem(20);
    width: toRem(20);
  }
}

.textarea-field__copy-button {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  transition-property: color, background;
  transition-duration: var(--transition-duration);

  .textarea-field__icon {
    color: inherit;
  }
}

.textarea-field__textarea {
  display: block;
  width: 100%;

  &--copied,
  &--with-right-icon {
    &:read-only {
      padding-right: toRem(64);

      & ~ .textarea-field__icon--right {
        right: 0;
        margin: auto toRem(24) auto toRem(16);
      }

      @include respond-to(850px) {
        padding-right: toRem(40);

        & ~ .textarea-field__icon--right {
          margin: auto toRem(12) auto toRem(8);
        }
      }
    }

    &:not(:read-only) {
      padding-right: toRem(49);

      & ~ .textarea-field__icon--right {
        right: 0;
        margin: auto toRem(16) auto toRem(10);
      }

      @include respond-to(850px) {
        padding-right: toRem(41);

        & ~ .textarea-field__icon--right {
          margin: auto toRem(12) auto toRem(10);
        }
      }
    }
  }

  &--with-left-icon {
    &:read-only {
      padding-left: toRem(64);

      & ~ .textarea-field__icon--left {
        left: 0;
        margin: auto toRem(16) auto toRem(24);
      }

      @include respond-to(850px) {
        padding-left: toRem(40);

        & ~ .textarea-field__icon--left {
          margin: auto toRem(8) auto toRem(12);
        }
      }
    }

    &:not(:read-only) {
      padding-left: toRem(49);

      & ~ .textarea-field__icon--left {
        left: 0;
        margin: auto toRem(10) auto toRem(16);
      }

      @include respond-to(850px) {
        padding-left: toRem(41);

        & ~ .textarea-field__icon--left {
          margin: auto toRem(10) auto toRem(12);
        }
      }
    }
  }

  &:read-only {
    & + .textarea-field__copy-button {
      color: var(--col-primary);
      width: toRem(64);

      .textarea-field__icon {
        margin: auto toRem(24) auto toRem(16);
      }

      @include respond-to(850px) {
        width: toRem(40);

        .textarea-field__icon {
          margin: auto toRem(12) auto toRem(8);
        }
      }
    }
  }

  &:not(:read-only) {
    & + .textarea-field__copy-button {
      color: var(--col-brittle);
      width: toRem(50);

      .textarea-field__icon {
        margin: auto toRem(16) auto toRem(10);
      }

      @include respond-to(850px) {
        width: toRem(42);
      }
    }
  }

  &:not(:read-only):hover {
    & + .textarea-field__copy-button {
      color: var(--col-flexible);
    }
  }

  &:not(:read-only):focus {
    & + .textarea-field__copy-button {
      color: var(--col-primary);
    }
  }

  &:not(:read-only):active {
    & + .textarea-field__copy-button {
      color: var(--col-initial);
    }
  }

  &:not(:read-only):focus + .textarea-field__copy-button:hover {
    background: var(--col-primary);
    color: var(--col-intense);
  }

  &:not(:read-only):active + .textarea-field__copy-button:hover {
    background: var(--col-initial);
    color: var(--col-intense);
  }
}

.textarea-field__textarea-wrapper {
  position: relative;

  &:hover {
    .textarea-field__textarea:read-only:not(:focus) {
      background: var(--col-mild);

      & + .textarea-field__copy-button:hover {
        background: var(--col-primary);
        color: var(--col-intense);
      }
    }

    .textarea-field__textarea:not(:read-only):not(:focus) {
      border-color: var(--col-flexible);

      & + .textarea-field__copy-button:hover {
        background: var(--col-flexible);
        color: var(--col-intense);
      }
    }
  }

  &:active {
    .textarea-field__textarea:read-only:not(:focus) {
      & + .textarea-field__copy-button:active {
        background: var(--col-initial);
        color: var(--col-intense);
      }
    }

    .textarea-field__textarea:not(:read-only):not(:focus) {
      border-color: var(--col-initial);

      & + .textarea-field__copy-button:active {
        background: var(--col-initial);
        color: var(--col-intense);
      }
    }
  }
}
</style>
