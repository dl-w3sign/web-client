import { ErrorHandler } from '@/helpers'
import { ref, computed, watch, Ref, ComputedRef } from 'vue'

export interface UsePaginationOptions {
  itemsCount: number
  pageLimit: number
  onPageChange: UsePaginationCallback
}

export type UsePaginationCallback = ({
  newItemsOffset,
  pageLimit,
}: UsePaginationCallbackArg) => Promise<void>

export type UsePaginationCallbackArg = {
  newItemsOffset: number
  pageLimit: number
}

export interface UsePagination {
  itemsCount: Ref<number>
  pageNumber: Ref<number>
  pageLimit: Ref<number>
  pagesCount: ComputedRef<number>
  isFirstPage: ComputedRef<boolean>
  isLastPage: ComputedRef<boolean>

  toPrev: () => Promise<void>
  toNext: () => Promise<void>
  toFirst: () => Promise<void>
  toLast: () => Promise<void>
}

export const usePagination = (options: UsePaginationOptions): UsePagination => {
  const itemsCount = ref(options.itemsCount)

  const pageNumber = ref(1)

  const pageLimit = ref(options.pageLimit)

  const pagesCount = computed(() =>
    Math.ceil(itemsCount.value / pageLimit.value),
  )

  const isFirstPage = computed(() => pageNumber.value === 1)

  const isLastPage = computed(() => pageNumber.value === pagesCount.value)

  const tryChangePage = async (newPageNumber: number) => {
    try {
      await options.onPageChange({
        newItemsOffset: (newPageNumber - 1) * pageLimit.value,
        pageLimit: pageLimit.value,
      })

      pageNumber.value = newPageNumber
    } catch (error) {
      throw ErrorHandler.processWithoutFeedback(error)
    }
  }

  const toFirst = async () => {
    if (isFirstPage.value) return
    tryChangePage(1)
  }

  const toPrev = async () => {
    if (isFirstPage.value) return
    tryChangePage(pageNumber.value - 1)
  }

  const toNext = async () => {
    if (isLastPage.value) return
    tryChangePage(pageNumber.value + 1)
  }

  const toLast = async () => {
    if (isLastPage.value) return
    tryChangePage(pagesCount.value)
  }

  watch(
    () => pageLimit.value,
    async () =>
      await tryChangePage(
        pageNumber.value > pagesCount.value
          ? pagesCount.value
          : pageNumber.value,
      ),
  )

  return {
    itemsCount,
    pageNumber,
    pageLimit,
    pagesCount,
    isFirstPage,
    isLastPage,

    toFirst,
    toPrev,
    toNext,
    toLast,
  }
}
