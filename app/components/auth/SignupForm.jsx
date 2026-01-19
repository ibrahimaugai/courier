'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react'
import { registerUser, clearError } from '../../lib/store'

export default function SignupForm({ 
  onSuccess, 
  showTitle = true, 
  showLoginLink = true,
  autoGeneratePassword = false,
  defaultRole = 'USER',
  includeCustomerFields = false 
}) {
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    // Customer fields (optional)
    name: '',
    phone: '',
    email: '',
    cityId: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [cities, setCities] = useState([])

  // Fetch cities if customer fields are needed
  useEffect(() => {
    if (includeCustomerFields) {
      fetchCities()
    }
  }, [includeCustomerFields])

  const fetchCities = async () => {
    try {
      const { api } = await import('../../lib/api')
      const response = await api.request('/cities', { method: 'GET' })
      const data = await api.handleResponse(response)
      setCities(data || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setLocalError('')
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    dispatch(clearError())

    // Validate passwords match (if not auto-generating)
    if (!autoGeneratePassword) {
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match')
        return
      }

      // Validate password length
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters long')
        return
      }
    }

    // Validate customer fields if required
    if (includeCustomerFields) {
      if (!formData.name || !formData.phone) {
        setLocalError('Name and phone are required')
        return
      }
    }

    // Prepare registration data
    const registrationData = {
      username: formData.username,
      password: autoGeneratePassword ? undefined : formData.password,
      role: defaultRole,
    }

    // Add customer fields if included
    if (includeCustomerFields) {
      registrationData.name = formData.name
      registrationData.phone = formData.phone
      registrationData.email = formData.email || undefined
      registrationData.cityId = formData.cityId || undefined
    }

    // Auto-generate password if needed
    if (autoGeneratePassword) {
      const { api } = await import('../../lib/api')
      registrationData.password = api.generateRandomPassword()
    } else {
      // Ensure password is provided
      if (!registrationData.password) {
        setLocalError('Password is required')
        return
      }
    }

    const result = await dispatch(registerUser(registrationData))
    
    if (registerUser.fulfilled.match(result)) {
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.payload)
      }
    } else if (registerUser.rejected.match(result)) {
      const errorMsg = result.error?.message || result.payload || 'Registration failed'
      setLocalError(errorMsg)
    }
  }

  const displayError = localError || error

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-600 to-cyan-600 rounded-2xl shadow-lg mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up for Courier RMS</p>
        </div>
      )}

      {displayError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{displayError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Fields (if included) */}
        {includeCustomerFields && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={includeCustomerFields}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required={includeCustomerFields}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                placeholder="03001234567"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                id="cityId"
                name="cityId"
                value={formData.cityId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            placeholder="Choose a username"
          />
        </div>

        {/* Password Fields (if not auto-generating) */}
        {!autoGeneratePassword && (
          <>
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
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="Enter your password (min. 6 characters)"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-sky-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              {includeCustomerFields ? 'Create Customer' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      {showLoginLink && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

