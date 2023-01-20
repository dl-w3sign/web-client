<template>
  <div class="pagination-control">
    <button
      class="pagination-control__button"
      :disabled="isFirstPage"
      @click.prevent="toFirst"
    >
      <icon class="pagination-control__icon" :name="$icons.backwardStep" />
    </button>
    <button
      class="pagination-control__button"
      :disabled="isFirstPage"
      @click.prevent="toPrev"
    >
      <icon class="pagination-control__icon" :name="$icons.chevronLeft" />
    </button>
    <p class="pagination-control__page-info">
      {{
        $t('pagination-control.page-info', {
          current: pageNumber,
          total: pagesCount,
        })
      }}
    </p>
    <button
      class="pagination-control__button"
      :disabled="isLastPage"
      @click.prevent="toNext"
    >
      <icon class="pagination-control__icon" :name="$icons.chevronRight" />
    </button>
    <button
      class="pagination-control__button"
      :disabled="isLastPage"
      @click.prevent="toLast"
    >
      <icon class="pagination-control__icon" :name="$icons.forwardStep" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@/common'
import { usePagination } from '@/composables'
import { UsePaginationCallback } from '@/types'
import { watch } from 'vue'

const props = defineProps<{
  itemsCount: number
  pageLimit: number
  onPageChange: UsePaginationCallback
}>()

const {
  pageNumber,
  pageLimit,
  pagesCount,
  isFirstPage,
  isLastPage,
  toFirst,
  toPrev,
  toNext,
  toLast,
} = usePagination({
  itemsCount: props.itemsCount,
  pageLimit: props.pageLimit,
  onPageChange: props.onPageChange,
})

watch(
  () => props.pageLimit,
  () => (pageLimit.value = props.pageLimit),
)
</script>

<style lang="scss" scoped>
.pagination-control {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-control__button {
  fill: var(--col-negative);

  &:not([disabled]):hover {
    fill: var(--col-fancy);
  }

  &:not([disabled]):active {
    fill: var(--col-trendy);
  }

  &:disabled {
    cursor: default;
  }
}

.pagination-control__icon {
  width: toRem(20);
  height: toRem(20);
  margin: toRem(10) toRem(14);
}

.pagination-control__page-info {
  font-weight: 400;
  font-size: toRem(14);
  line-height: toRem(20);
  color: var(--col-fancy);
  font-feature-settings: 'tnum' on, 'lnum' on;
  margin: toRem(10) toRem(4);
}
</style>
