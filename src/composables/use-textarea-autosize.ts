import { ref, watch, WatchSource, Ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'

export interface UseTextareaAutosizeOptions {
  /** Textarea element to autosize. */
  element?: Ref<HTMLTextAreaElement | undefined>
  /** Textarea content. */
  input?: Ref<string | undefined>
  /** Watch sources that should trigger a textarea resize. */
  watch?: WatchSource | WatchSource[]
  /** Function called when the textarea size changes. */
  onResize?: () => void
}

export const useTextareaAutosize = (options?: UseTextareaAutosizeOptions) => {
  const textarea = options?.element || ref<HTMLTextAreaElement>()
  const input = options?.input || ref<string>()

  const resize = () => {
    if (!textarea.value) return

    const offset = textarea.value?.offsetHeight - textarea.value?.clientHeight
    textarea.value.style.height = '1px'
    textarea.value.style.height = `${textarea.value?.scrollHeight + offset}px`

    options?.onResize?.()
  }

  watch([input, textarea.value?.value], resize, { immediate: true })

  useResizeObserver(textarea, () => resize())

  if (options?.watch)
    watch(options.watch, resize, { immediate: true, deep: true })

  return {
    textarea,
    input,
    resize,
  }
}

export type UseTextareaAutosizeReturn = ReturnType<typeof useTextareaAutosize>
