import { ref } from 'vue'

export function useForm() {
  const isFormDisabled = ref(false)
  const isSubmitting = ref(false)
  const isConfirmationShown = ref(false)
  const isFailureSnown = ref(false)

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
    isFailureSnown.value = true
  }

  const resetState = () => {
    isFormDisabled.value = false
    isSubmitting.value = false
    isConfirmationShown.value = false
    isFailureSnown.value = false
  }

  return {
    isFormDisabled,
    isSubmitting,
    isConfirmationShown,
    isFailureSnown,
    disableForm,
    enableForm,
    showConfirmation,
    showFailure,
    resetState,
  }
}
