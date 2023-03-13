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
          'textarea-field__textarea--removable': isRemovable,
          'textarea-field__textarea--copyable': isCopyable,
          'textarea-field__textarea--with-left-icon': leftIconName,
          'textarea-field__textarea--with-right-icon': rightIconName,
        }"
        :id="labelId ? labelId : `textarea-field--${uid}`"
        :placeholder="placeholder"
        :value="modelValue"
        :tabindex="isDisabled || isReadonly ? -1 : $attrs.tabindex"
        :disabled="isDisabled || isReadonly"
        @input="updateModelValue"
      />
      <button
        v-if="isRemovable"
        class="textarea-field__clear-button"
        @click="emit('clear')"
      >
        <icon class="textarea-field__icon" :name="$icons.xCircle" />
      </button>
      <button
        v-else-if="isCopyable"
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
import { computed, useAttrs } from 'vue'
import { v4 as generateUid } from 'uuid'

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'clear'): void
}>()

const updateModelValue = (event: InputEvent) => {
  const eventTarget = event.target as HTMLInputElement
  if (props.isWithoutLineBreaks)
    eventTarget.value = eventTarget.value.replace(/(\r\n|\n|\r)/gm, '')
  emit('update:modelValue', eventTarget.value)
  resize()
}

const uid = generateUid()
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    labelId?: string
    placeholder?: string
    isRemovable?: boolean
    isCopyable?: boolean
    isWithoutLineBreaks?: boolean
    leftIconName?: ICON_NAMES
    rightIconName?: ICON_NAMES
  }>(),
  {
    label: '',
    labelId: '',
    placeholder: '',
    isRemovable: false,
    isCopyable: false,
    isWithoutLineBreaks: true,
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

const { textarea, resize } = useTextareaAutosize()
</script>

<style lang="scss" scoped>
.textarea-field__label {
  @include field-label;
}

.textarea-field__icon {
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  height: toRem(24);
  width: toRem(24);
  flex-shrink: 0;

  @include respond-to(tablet) {
    height: toRem(20);
    width: toRem(20);
  }
}

.textarea-field__clear-button {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  height: toRem(24);
  width: toRem(24);
  transition: var(--transition-duration);

  @include respond-to(tablet) {
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
  transition-property: color, background-color;
  transition-duration: var(--transition-duration);

  .textarea-field__icon {
    color: inherit;
  }
}

.textarea-field__textarea {
  display: block;
  width: 100%;

  &--removable,
  &--copyable,
  &--with-right-icon {
    &:read-only {
      padding-right: toRem(64);

      & ~ .textarea-field__icon--right {
        right: 0;
        margin: auto toRem(24) auto toRem(16);
      }

      @include respond-to(tablet) {
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

      @include respond-to(tablet) {
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

      @include respond-to(tablet) {
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

      @include respond-to(tablet) {
        padding-left: toRem(41);

        & ~ .textarea-field__icon--left {
          margin: auto toRem(10) auto toRem(12);
        }
      }
    }
  }

  &:read-only {
    & + .textarea-field__clear-button {
      right: toRem(24);
      fill: var(--col-fine);
      color: var(--col-intense);

      @include respond-to(tablet) {
        right: toRem(12);
      }
    }

    & + .textarea-field__copy-button {
      color: var(--col-primary);
      width: toRem(64);

      .textarea-field__icon {
        margin: auto toRem(24) auto toRem(16);
      }

      @include respond-to(tablet) {
        width: toRem(40);

        .textarea-field__icon {
          margin: auto toRem(12) auto toRem(8);
        }
      }
    }
  }

  &:not(:read-only) {
    & + .textarea-field__clear-button {
      right: toRem(16);
      fill: var(--transparent);
      stroke: var(--col-stylish);
      color: var(--col-stylish);

      @include respond-to(tablet) {
        right: toRem(12);
      }
    }

    & + .textarea-field__copy-button {
      color: var(--col-stylish);
      width: toRem(50);

      .textarea-field__icon {
        margin: auto toRem(16) auto toRem(10);
      }

      @include respond-to(tablet) {
        width: toRem(42);
      }
    }
  }

  &:read-only + .textarea-field__clear-button:hover {
    fill: var(--col-accent);
  }

  &:read-only + .textarea-field__clear-button:active {
    fill: var(--col-spot);
  }

  &:not(:read-only) + .textarea-field__clear-button:hover {
    stroke: var(--col-accent);
    fill: var(--col-accent);
    color: var(--col-intense);
  }

  &:not(:read-only) + .textarea-field__clear-button:active {
    stroke: var(--col-spot);
    fill: var(--col-spot);
    color: var(--col-intense);
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
