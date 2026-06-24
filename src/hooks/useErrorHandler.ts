"use client"

import { useCallback } from 'react'
import { ErrorHandler, AppError } from '@/lib/error-handler'

export interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void
  logError?: boolean
  userId?: string
  context?: string
}

/**
 * @fileOverview Error Handler Hook v1.0
 * FIXED: Global error catching and reporting for React components
 */

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { onError, logError = true, userId, context } = options

  const handleError = useCallback(
    async (error: any, defaultMessage?: string) => {
      let appError: AppError

      if (error instanceof Error) {
        appError = ErrorHandler.createError(
          'CLIENT_ERROR',
          error.message || defaultMessage || 'An error occurred',
          500,
          { stack: error.stack }
        )
      } else if (typeof error === 'string') {
        appError = ErrorHandler.createError(
          'CLIENT_ERROR',
          error || defaultMessage || 'An error occurred',
          500
        )
      } else if (error?.code) {
        // Handle specific error types
        if (error.code.includes('auth')) {
          appError = ErrorHandler.handleAuthError(error)
        } else if (error.code.includes('firestore') || error.code.includes('database')) {
          appError = ErrorHandler.handleFirestoreError(error)
        } else if (error.code.includes('payment') || error.code.includes('cashfree')) {
          appError = ErrorHandler.handlePaymentError(error)
        } else {
          appError = ErrorHandler.createError(
            error.code,
            error.message || defaultMessage || 'An error occurred',
            error.statusCode || 500
          )
        }
      } else {
        appError = ErrorHandler.createError(
          'UNKNOWN_ERROR',
          defaultMessage || 'An unexpected error occurred',
          500,
          error
        )
      }

      // Log error
      if (logError) {
        await ErrorHandler.logError(appError, userId, context)
      }

      // Call custom handler
      if (onError) {
        onError(appError)
      }

      return appError
    },
    [onError, logError, userId, context]
  )

  const handlePaymentError = useCallback(
    async (error: any) => {
      const appError = ErrorHandler.handlePaymentError(error)
      if (logError) {
        await ErrorHandler.logError(appError, userId, 'payment')
      }
      if (onError) {
        onError(appError)
      }
      return appError
    },
    [onError, logError, userId]
  )

  const handleAuthError = useCallback(
    async (error: any) => {
      const appError = ErrorHandler.handleAuthError(error)
      if (logError) {
        await ErrorHandler.logError(appError, userId, 'authentication')
      }
      if (onError) {
        onError(appError)
      }
      return appError
    },
    [onError, logError, userId]
  )

  return {
    handleError,
    handlePaymentError,
    handleAuthError,
  }
}

export default useErrorHandler