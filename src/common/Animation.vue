<template>
  <div class="animation">
    <lottie-animation
      :animation-data="animationData"
      :loop="isInfinite"
      v-bind="$attrs"
    />
  </div>
</template>

<script lang="ts" setup>
import { LottieAnimation } from 'lottie-web-vue'

defineProps<{
  animationData: JSON
  isInfinite: boolean
}>()
</script>
