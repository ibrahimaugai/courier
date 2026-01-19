'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const { isAuthenticated, token, user } = useSelector((state) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check localStorage first (most reliable)
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    // Give Redux time to sync, but also check localStorage immediately
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 200) // Increased delay to ensure Redux state is synced
    
    // If we have a token in localStorage, we can proceed faster
    if (localStorageToken) {
      setTimeout(() => {
        setIsChecking(false)
      }, 50)
    }
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // After checking, handle authentication and role-based routing
    if (!isChecking) {
      // Check both Redux state and localStorage as fallback
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const localStorageUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      
      // Check if user is authenticated
      const isAuth = isAuthenticated || (token && token.length > 0) || (localStorageToken && localStorageToken.length > 0)
      
      if (!isAuth) {
        // Not authenticated - redirect to login
        router.replace('/login')
        return
      }
      
      // If authenticated, check role
      let currentUser = user
      if (!currentUser && localStorageUserStr) {
        try {
          currentUser = JSON.parse(localStorageUserStr)
        } catch (e) {
          console.error('Failed to parse user from localStorage:', e)
        }
      }
      
      // If user is ADMIN or SUPER_ADMIN, redirect to admin panel
      if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')) {
        router.replace('/admin')
        return
      }
      
      // If user is USER role, they can access user panel (no redirect needed)
    }
  }, [isChecking, isAuthenticated, token, user, router])

  // Show loading spinner while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check both Redux state and localStorage as fallback
  const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const localStorageUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  
  let currentUser = user
  if (!currentUser && localStorageUserStr) {
    try {
      currentUser = JSON.parse(localStorageUserStr)
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e)
    }
  }
  
  const isAuth = isAuthenticated || (token && token.length > 0) || (localStorageToken && localStorageToken.length > 0)
  
  // If authenticated as USER role, render children
  // If authenticated as ADMIN, redirect will happen in useEffect
  if (isAuth) {
    // Only render if user is USER role (admins will be redirected)
    if (currentUser && currentUser.role === 'USER') {
      return children
    }
    // If admin, don't render (redirect is happening)
    return null
  }

  // If not authenticated, show nothing (redirect is happening)
  return null
}

