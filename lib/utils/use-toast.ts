'use client'

import * as React from 'react'

type ToastVariant = 'default' | 'success' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastState {
  toasts: Toast[]
}

const listeners: ((state: ToastState) => void)[] = []
let state: ToastState = { toasts: [] }

function dispatch(toast: Toast) {
  state = { toasts: [...state.toasts, toast] }
  listeners.forEach((l) => l(state))
  setTimeout(() => {
    state = { toasts: state.toasts.filter((t) => t.id !== toast.id) }
    listeners.forEach((l) => l(state))
  }, 4000)
}

export function toast(props: Omit<Toast, 'id'>) {
  dispatch({ id: Math.random().toString(36).slice(2), ...props })
}

export function useToast() {
  const [localState, setLocalState] = React.useState<ToastState>(state)
  React.useEffect(() => {
    listeners.push(setLocalState)
    return () => {
      const index = listeners.indexOf(setLocalState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])
  return localState
}
