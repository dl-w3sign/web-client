<template>
  <div
    class="doc-creation-illustration"
    :class="{ 'doc-creation-illustration--active': isActive }"
  >
    <div class="doc-creation-illustration__header">
      <div
        v-for="n in 3"
        :key="n"
        class="doc-creation-illustration__header-circle"
      />
    </div>
    <div class="doc-creation-illustration__main">
      <ul class="doc-creation-illustration__info-bar">
        <li
          v-for="n in 2"
          :key="n"
          class="doc-creation-illustration__info-bar-item"
          :class="{
            'doc-creation-illustration__info-bar-item--success': n === 2,
          }"
        >
          <icon
            :class="[
              'doc-creation-illustration__icon',
              'doc-creation-illustration__icon--small',
            ]"
            :name="n === 2 ? $icons.check2 : $icons.download"
          />
          {{
            n === 2
              ? $t('doc-creation-illustration.info-item-checked')
              : $t('doc-creation-illustration.info-item-created')
          }}
        </li>
      </ul>
      <h3
        :class="[
          'doc-creation-illustration__skeleton',
          'doc-creation-illustration__skeleton--large',
        ]"
      />
      <div class="doc-creation-illustration__document" v-for="n in 3" :key="n">
        <div class="doc-creation-illustration__icon-wrp">
          <icon
            :class="[
              'doc-creation-illustration__icon',
              'doc-creation-illustration__icon--large',
            ]"
            :name="getFileIconName(n)"
          />
        </div>
        <div>
          <h4 class="doc-creation-illustration__skeleton" />
          <p
            class="doc-creation-illustration__skeleton"
            :class="{
              'doc-creation-illustration__skeleton--wider': n === 1,
              'doc-creation-illustration__skeleton--wide': n === 2,
              'doc-creation-illustration__skeleton--widest': n === 3,
            }"
          />
          <p
            v-if="n === 1 || n === 2"
            :class="[
              'doc-creation-illustration__skeleton',
              'doc-creation-illustration__skeleton--short',
            ]"
          />
        </div>
        <icon
          :class="[
            'doc-creation-illustration__icon',
            'doc-creation-illustration__icon--left-centred',
          ]"
          :name="getStatusIconName(n)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { ICON_NAMES } from '@/enums'

withDefaults(
  defineProps<{
    isActive?: boolean
  }>(),
  {
    isActive: false,
  },
)

const getFileIconName = (n: number) => {
  switch (n) {
    case 1:
      return ICON_NAMES.fileDoc
    case 2:
      return ICON_NAMES.fileCsv
    case 3:
      return ICON_NAMES.fileXls
    default:
      return ICON_NAMES.document
  }
}

const getStatusIconName = (n: number) => {
  switch (n) {
    case 1:
      return ICON_NAMES.downloadCircle2
    default:
      return ICON_NAMES.checkCircle
  }
}
</script>

<style lang="scss" scoped>
.doc-creation-illustration {
  display: flex;
  flex-direction: column;
  height: toRem(279);
  width: toRem(279);
  flex-shrink: 0;
}

.doc-creation-illustration__header {
  display: flex;
  align-items: center;
  gap: toRem(8);
  flex-shrink: 0;
  padding: 0 toRem(11);
  height: toRem(32);
  background: var(--col-home);
  border-top-right-radius: toRem(16);
  border-top-left-radius: toRem(16);
}

.doc-creation-illustration__header-circle {
  height: toRem(8);
  width: toRem(8);
  background: var(--col-unique);
  border-radius: 50%;

  .doc-creation-illustration--active & {
    transition: background-color var(--transition-duration);

    &:hover {
      &:nth-of-type(1) {
        background: var(--col-creative);
      }

      &:nth-of-type(2) {
        background: var(--col-implicit);
      }

      &:nth-of-type(3) {
        background: var(--col-visual);
      }
    }
  }
}

.doc-creation-illustration__main {
  background: var(--col-intense);
  border-bottom-right-radius: toRem(16);
  border-bottom-left-radius: toRem(16);
  padding: toRem(15.9) toRem(16) toRem(17.47);
  height: 100%;
}

.doc-creation-illustration__info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRem(8.76);
  margin-bottom: toRem(25.88);
}

.doc-creation-illustration__info-bar-item {
  display: flex;
  align-items: center;
  gap: toRem(4);
  background: var(--col-tender);
  padding: toRem(8) toRem(12);
  border-radius: toRem(14);
  color: var(--col-primary);
  font-family: 'Inter', 'Arial', sans-serif;
  font-weight: 600;
  font-size: toRem(12);
  line-height: 1;

  &--success {
    background: var(--col-simple);
    color: var(--col-success);
  }
}

.doc-creation-illustration__skeleton {
  background: var(--col-crude);
  height: toRem(9.6);
  width: toRem(34.73);
  border-radius: toRem(5);

  &--short {
    display: inline-block;
    height: toRem(9.6);
    width: toRem(19.2);
    margin-left: toRem(4.8);
    border-radius: toRem(4);
  }

  &--wide {
    display: inline-block;
    height: toRem(9.6);
    width: toRem(56.3);
    border-radius: toRem(4);
    margin-top: toRem(6);
  }

  &--wider {
    display: inline-block;
    height: toRem(9.6);
    width: toRem(82.62);
    border-radius: toRem(4);
    margin-top: toRem(6);
  }

  &--widest {
    height: toRem(9.6);
    width: toRem(115);
    border-radius: toRem(4);
    margin-top: toRem(6);
  }

  &--large {
    height: toRem(14.4);
    width: toRem(97);
    border-radius: toRem(7);
    margin-left: toRem(1.96);
  }

  .doc-creation-illustration--active & {
    @include shimmer-animation;
  }
}

.doc-creation-illustration__icon-wrp {
  .doc-creation-illustration--active & {
    @include shimmer-animation;
  }
}

.doc-creation-illustration__icon {
  height: toRem(16.52);
  width: toRem(16.52);

  &--small {
    height: toRem(12);
    width: toRem(12);
  }

  &--large {
    height: toRem(33.53);
    width: toRem(33.53);
  }

  &--left-centred {
    margin-left: auto;
    align-self: center;
    color: var(--col-intense);
  }
}

.doc-creation-illustration__document {
  display: flex;
  gap: toRem(9);
  margin-top: toRem(16.47);

  &:first-of-type {
    margin-top: toRem(11.85);
  }
}
</style>
