import { ref, unref, watch, WatchSource, Ref } from 'vue'
import { useResizeObserver, MaybeRef } from '@vueuse/core'

export interface UseTextareaAutosizeOptions {
  /** Textarea element to autosize. */
  element?: MaybeRef<HTMLTextAreaElement | undefined>
  /** Textarea content. */
  value?: MaybeRef<string | undefined>
  /** Watch sources that should trigger a textarea resize. */
  watch?: WatchSource | WatchSource[]
  /** Function called when the textarea size changes. */
  onResize?: () => void
}

export interface UseTextareaAutosize {
  textarea: Ref<HTMLTextAreaElement | undefined>
  value: Ref<string | undefined>
  resize: () => void
}

export const useTextareaAutosize = (
  options?: UseTextareaAutosizeOptions,
): UseTextareaAutosize => {
  const textarea = ref(unref(options?.element))
  const value = ref(unref(options?.value))

  const resize = () => {
    if (!textarea.value) return

    const offset = textarea.value?.offsetHeight - textarea.value?.clientHeight
    textarea.value.style.height = '1px'
    textarea.value.style.height = `${textarea.value?.scrollHeight + offset}px`

    options?.onResize?.()
  }

  watch([value, textarea], resize, { immediate: true, deep: true })

  useResizeObserver(textarea, () => resize())

  if (options?.watch)
    watch(options.watch, resize, { immediate: true, deep: true })

  return {
    textarea,
    value,
    resize,
  }
}
