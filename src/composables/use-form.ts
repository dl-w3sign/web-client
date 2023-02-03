import { ref } from 'vue'

export function useForm() {
  const isFormDisabled = ref(false)
  const isSubmitting = ref(false)
  const isConfirmationShown = ref(false)
  const isFailureShown = ref(false)

  const disableForm = () => {
    isFormDisabled.value = true
  }

  const enableForm = () => {
    isFormDisabled.value = false
  }

  const showConfirmation = () => {
    disableForm()
    isConfirmationShown.value = true
  }

  const showFailure = () => {
    disableForm()
    isFailureShown.value = true
  }

  const resetState = () => {
    isFormDisabled.value = false
    isSubmitting.value = false
    isConfirmationShown.value = false
    isFailureShown.value = false
  }

  return {
    isFormDisabled,
    isSubmitting,
    isConfirmationShown,
    isFailureShown,
    disableForm,
    enableForm,
    showConfirmation,
    showFailure,
    resetState,
  }
}
