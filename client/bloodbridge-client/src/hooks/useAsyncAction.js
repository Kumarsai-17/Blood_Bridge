import { useState } from 'react'

/**
 * Custom hook for handling async actions with loading states and popups
 * Usage:
 * const { execute, loading } = useAsyncAction(showPopup)
 * 
 * await execute(
 *   async () => { ... your async code ... },
 *   { successTitle: 'Success', successMessage: 'Done!', errorTitle: 'Error' }
 * )
 */
export const useAsyncAction = (showPopup) => {
  const [loading, setLoading] = useState(false)

  const execute = async (asyncFn, options = {}) => {
    const {
      successTitle = 'Success',
      successMessage = 'Operation completed successfully',
      errorTitle = 'Error',
      errorMessage = 'Something went wrong. Please try again.',
      showSuccessPopup = true,
      showErrorPopup = true,
      onSuccess,
      onError
    } = options

    try {
      setLoading(true)
      const result = await asyncFn()
      
      if (showSuccessPopup) {
        showPopup('success', successTitle, successMessage)
      }
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return { success: true, data: result }
    } catch (error) {
      const message = error.response?.data?.message || errorMessage
      
      if (showErrorPopup) {
        showPopup('error', errorTitle, message)
      }
      
      if (onError) {
        onError(error)
      }
      
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading }
}

export default useAsyncAction
