<template>
  <div class="spinner">
    <animation
      class="spinner__inner"
      :animation-data="LoaderJSON"
      is-infinite
    />
  </div>
</template>

<script lang="ts" setup>
import { Animation } from '@/common'
import LoaderJSON from '@/../loader.json'
</script>

<style lang="scss" scoped>
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner__inner {
  display: block;
  width: toRem(121);
  height: toRem(121);

  @include respond-to('tablet') {
    width: toRem(81);
    height: toRem(81);
  }
}
</style>
