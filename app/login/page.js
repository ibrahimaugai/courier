'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { LogIn, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { loginUser, clearError } from '../lib/store'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (searchParams.get('pending') === 'approval') {
      setSuccess('Registration successful! Your account is pending approval. You will be able to sign in once an administrator approves your account.')
    } else if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
        router.replace('/admin')
      } else {
        router.replace('/')
      }
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    dispatch(clearError())

    try {
      const result = await dispatch(loginUser({
        username: formData.username,
        password: formData.password
      }))

      if (loginUser.fulfilled.match(result)) {
        // Wait a bit longer to ensure Redux state and localStorage are fully synced
        // Also verify token is actually stored before redirecting
        setTimeout(() => {
          const token = localStorage.getItem('token')
          const userData = JSON.parse(localStorage.getItem('user') || '{}')

          if (token) {
            // Redirect based on user role
            if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
              router.replace('/admin')
            } else {
              router.replace('/')
            }
          } else {
            console.error('Token not found in localStorage after login')
          }
        }, 300)
      } else if (loginUser.rejected.match(result)) {
        // Error is already handled by Redux
        console.error('Login failed:', result.error)
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          {/* Logo/Header Inside Card */}
          <div className="text-center mb-10">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 "></div>
                <div className="relative ">
                  <img
                    src="/nps-logo.png"
                    alt="NPS Logo"
                    className="h-36 w-36 object-contain "
                  />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-700">
              Welcome Back
            </h1>
            <p className="text-gray-600 font-medium">Elevating Logistic Excellence</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error} or You are not approved to access this page. Please contact the administrator.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-sky-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/signup"
                className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

