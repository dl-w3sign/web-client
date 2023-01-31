<template>
  <div class="spinner">
    <div class="spinner__inner" />
  </div>
</template>

<style lang="scss" scoped>
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner__inner {
  display: block;
  width: toRem(130);
  height: toRem(130);
  background: url('/branding/spinner.svg');
  animation: spinner 1.2s linear infinite;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
