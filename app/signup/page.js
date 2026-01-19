'use client'

import { useRouter } from 'next/navigation'
import SignupForm from '../components/auth/SignupForm'

export default function SignupPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to login page after successful registration
    router.push('/login?registered=true')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <SignupForm 
            onSuccess={handleSuccess}
            showTitle={true}
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

