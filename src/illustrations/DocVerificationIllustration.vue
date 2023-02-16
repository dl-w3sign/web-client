<template>
  <div
    class="doc-verification-illustration"
    :class="{ 'doc-verification-illustration--active': isActive }"
  >
    <div class="doc-verification-illustration__header">
      <div
        v-for="n in 3"
        :key="n"
        class="doc-verification-illustration__header-circle"
      />
    </div>
    <div class="doc-verification-illustration__main">
      <h3 class="doc-verification-illustration__title">
        {{ $t('doc-verification-illustration.title') }}
        <span class="doc-verification-illustration__spinner" />
      </h3>
      <div class="doc-verification-illustration__progress">
        <div class="doc-verification-illustration__progress-bar" />
      </div>
      <h4
        :class="[
          'doc-verification-illustration__skeleton',
          'doc-verification-illustration__skeleton--large',
        ]"
      />
      <div v-for="n in 2" :key="n">
        <div class="doc-verification-illustration__signer-address">
          <div
            class="doc-verification-illustration__signer-avatar"
            :class="{
              'doc-verification-illustration__signer-avatar--smart': n === 2,
            }"
          />
          <h5 class="doc-verification-illustration__skeleton" />
          <icon
            class="doc-verification-illustration__icon"
            :name="$icons.checkCircle"
          />
        </div>
        <div class="doc-verification-illustration__signer-timestamp">
          <h5
            :class="[
              'doc-verification-illustration__skeleton',
              'doc-verification-illustration__skeleton--small-wide',
            ]"
          />
          <p
            :class="[
              'doc-verification-illustration__skeleton',
              'doc-verification-illustration__skeleton--small',
            ]"
          />
        </div>
      </div>
      <div class="doc-verification-illustration__pagination">
        <div
          v-for="n in 3"
          :key="n"
          :class="[
            'doc-verification-illustration__skeleton',
            'doc-verification-illustration__skeleton--small-short',
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'

withDefaults(
  defineProps<{
    isActive?: boolean
  }>(),
  {
    isActive: false,
  },
)
</script>

<style lang="scss" scoped>
.doc-verification-illustration {
  display: flex;
  flex-direction: column;
  height: toRem(279);
  width: toRem(279);
  flex-shrink: 0;
}

.doc-verification-illustration__header {
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

.doc-verification-illustration__header-circle {
  height: toRem(8);
  width: toRem(8);
  background: var(--col-unique);
  border-radius: 50%;

  .doc-verification-illustration--active & {
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

.doc-verification-illustration__main {
  background: var(--col-intense);
  border-bottom-right-radius: toRem(16);
  border-bottom-left-radius: toRem(16);
  padding: toRem(17.09) toRem(16.76) toRem(13.17) toRem(15.57);
  height: 100%;
}

.doc-verification-illustration__title {
  display: flex;
  justify-content: space-between;
  font-family: 'Inter', 'Arial', sans-serif;
  font-weight: 600;
  font-size: toRem(12);
  line-height: 1;
  color: var(--col-trendy);
  margin: 0 toRem(10.78) toRem(10.78) toRem(2.39);
}

.doc-verification-illustration__spinner {
  display: block;
  height: toRem(14.37);
  width: toRem(14.37);
  border: toRem(2) solid var(--col-primary);
  border-radius: 50%;
  border-right-color: transparent;
  margin: toRem(1.8);
  transform: rotate(-30deg);

  .doc-verification-illustration--active & {
    animation: rotate 13s ease infinite;
  }
}

.doc-verification-illustration__progress {
  height: toRem(6);
  border-radius: toRem(3);
  background: var(--col-mild);
  margin: 0 0 toRem(26.34) toRem(2.39);
}

.doc-verification-illustration__progress-bar {
  height: 100%;
  width: 71.08%;
  border-radius: inherit;
  background: var(--col-peaceful);

  .doc-verification-illustration--active & {
    animation: progress 13s ease infinite;
  }
}

.doc-verification-illustration__skeleton {
  background: var(--col-crude);
  height: toRem(9.6);
  width: toRem(134.1);
  border-radius: toRem(4);

  &--small {
    height: toRem(6);
    width: toRem(40.7);
    border-radius: toRem(3);
  }

  &--small-short {
    height: toRem(6);
    width: toRem(25.15);
    border-radius: toRem(3);
  }

  &--small-wide {
    height: toRem(6);
    width: toRem(56.3);
    border-radius: toRem(3);
  }

  &--large {
    height: toRem(14.4);
    border-radius: toRem(7);
    margin-left: toRem(2.39);
  }

  .doc-verification-illustration--active & {
    @include shimmer-animation;
  }
}

.doc-verification-illustration__signer-address {
  display: flex;
  align-items: center;
  gap: toRem(4.8);
  margin: toRem(14.37) 0 toRem(9.58);
  height: toRem(28.74);
  background: var(--col-great);
  border-radius: toRem(14);
  padding: toRem(4.8) toRem(9.6);

  .doc-verification-illustration--active & {
    @include shimmer-animation;
  }
}

.doc-verification-illustration__signer-avatar {
  height: toRem(19.16);
  width: toRem(19.16);
  background: var(--col-calm);
  border-radius: 50%;

  &--smart {
    background: var(--col-smart);
  }

  .doc-verification-illustration--active & {
    @include shimmer-animation;
  }
}

.doc-verification-illustration__icon {
  height: toRem(16.52);
  width: toRem(16.52);
  margin-left: auto;
  color: var(--col-intense);
}

.doc-verification-illustration__signer-timestamp {
  display: flex;
  gap: toRem(6);
  justify-content: end;
}

.doc-verification-illustration__pagination {
  display: flex;
  justify-content: center;
  gap: toRem(4.8);
  margin-top: toRem(17.96);
}

@keyframes progress {
  0% {
    background: var(--col-peaceful);
  }

  11% {
    background: var(--col-quiet);
  }

  23% {
    background: var(--col-peaceful);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(-30deg);
  }

  23% {
    transform: rotate(330deg);
  }

  100% {
    transform: rotate(330deg);
  }
}
</style>
