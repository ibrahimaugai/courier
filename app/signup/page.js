'use client'

import { useRouter } from 'next/navigation'
import SignupForm from '../components/auth/SignupForm'

export default function SignupPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Customer signups need approval - show pending message on login page
    router.push('/login?pending=approval')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 "></div>
                <div className="relative">
                  <img
                    src="/nps-logo.png"
                    alt="NPS Logo"
                    className="h-36 w-36 object-contain "
                  />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-700">
              Create Account
            </h1>
            <p className="text-gray-600 font-medium">Join the NPS Courier Network</p>
          </div>

          <SignupForm
            onSuccess={handleSuccess}
            showTitle={false}
            showLoginLink={true}
            autoGeneratePassword={false}
            defaultRole="USER"
            includeCustomerFields={false}
          />
        </div>
      </div>
    </div>
  )
}

