'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'

export default function AdminProtectedRoute({ children }) {
  const router = useRouter()
  const { isAuthenticated, token, user } = useSelector((state) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check localStorage first (most reliable)
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const localStorageUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    
    // Give Redux time to sync, but also check localStorage immediately
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 200)
    
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
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const localStorageUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      
      // Check authentication
      const isAuth = isAuthenticated || (token && token.length > 0) || (localStorageToken && localStorageToken.length > 0)
      
      if (!isAuth) {
        // Not authenticated - redirect to login
        router.replace('/login')
        return
      }
      
      let currentUser = user
      if (!currentUser && localStorageUserStr) {
        try {
          currentUser = JSON.parse(localStorageUserStr)
        } catch (e) {
          console.error('Failed to parse user from localStorage:', e)
        }
      }
      
      // Check admin role
      const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')
      
      if (!isAdmin) {
        // User is authenticated but not admin - redirect to user panel
        router.replace('/')
        return
      }
      
      // User is authenticated and is admin - can access admin panel
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
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN')

  // If authenticated as admin, render children
  if (isAuth && isAdmin) {
    return children
  }

  // If not authenticated or not admin, show nothing (redirect is happening)
  return null
}

