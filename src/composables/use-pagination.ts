import { useOffsetPagination, UseOffsetPaginationOptions } from "@vueuse/core"

export const usePafination = (options: UseOffsetPaginationOptions) => {
  const {
    currentPage,
    currentPageSize,
    pageCount,
    isFirstPage,
    prev,
    next,
  } = useOffsetPagination(options)
}
