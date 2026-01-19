'use client'

import { Provider, useDispatch } from 'react-redux'
import { store, loadFromStorage } from './store'
import { useEffect, useState } from 'react'

function AuthInitializer({ children }) {
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Load auth state from localStorage immediately
    dispatch(loadFromStorage())
    // Mark as initialized after a brief delay to ensure state is set
    setTimeout(() => {
      setIsInitialized(true)
    }, 50)
  }, [dispatch])
  
  // Wait for initialization before rendering children
  if (!isInitialized) {
    return null
  }
  
  return children
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  )
}

