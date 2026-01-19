'use client'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import { setBatchInfo, logout } from '../../lib/store'
import { Loader2, CheckCircle, AlertCircle, LogOut, ShieldCheck, RefreshCw } from 'lucide-react'

export default function Configuration() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [formData, setFormData] = useState({
    routeCode: '',
    staffCode: '',
    routeName: '',
    stationCode: '',
    printerConnection: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      console.log('Fetching configuration...')
      const result = await api.getConfiguration()

      const responseData = result?.data || result
      const configData = responseData?.config || (responseData?.routeCode ? responseData : null)
      const bInfo = responseData?.batchInfo

      if (bInfo) {
        dispatch(setBatchInfo(bInfo))
      }

      if (configData && typeof configData === 'object') {
        const newFormData = {
          routeCode: configData.routeCode || '',
          staffCode: configData.staffCode || '',
          routeName: configData.routeName || '',
          stationCode: configData.stationCode || '',
          printerConnection: configData.printerConnection || ''
        }
        setFormData(newFormData)
      }
    } catch (err) {
      console.error('Error fetching configuration:', err)
      setError('Failed to load system configuration.')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await api.updateConfiguration(formData)
      const responseData = result?.data || result

      if (responseData?.batchInfo) {
        dispatch(setBatchInfo(responseData.batchInfo))
      }

      // Instead of just a toast, show the logout requirement modal
      setShowSuccessModal(true)
    } catch (err) {
      console.error('Error updating configuration:', err)
      setError(err.message || 'Failed to update configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-sky-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl relative">
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Saved!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your profile has been updated. To activate your personal batch and apply these settings, you must relogin to the system.
            </p>
            <button
              onClick={handleFinalLogout}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-sky-200 flex items-center justify-center gap-3 active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              LOGOUT & LOGIN AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img src="/nps-logo.png" alt="NPS Logo" className="h-12 w-auto" />
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">System Configuration</h1>
          <span className="text-sm text-green-600 font-medium">VER -1.863 LIVE</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md flex items-center gap-3 border bg-red-50 text-red-700 border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* System Configuration Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6 text-sky-700">
          <RefreshCw className="w-5 h-5" />
          <h2 className="text-xl font-semibold">User Profile & Station Setup</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route Code */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                Route Code
              </label>
              <input
                type="text"
                required
                value={formData.routeCode}
                onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Enter route code"
              />
            </div>

            {/* Staff Code */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                Staff ID / Code
              </label>
              <input
                type="text"
                required
                value={formData.staffCode}
                onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Enter staff identifier"
              />
            </div>

            {/* Route Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                Route Display Name
              </label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Enter route name"
              />
            </div>

            {/* Station Code */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                Current Station (Origin)
              </label>
              <input
                type="text"
                required
                value={formData.stationCode}
                onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                placeholder="Enter station code"
              />
            </div>
          </div>

          {/* Printer Connection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
              Printer Path / Connection
            </label>
            <input
              type="text"
              value={formData.printerConnection}
              onChange={(e) => setFormData({ ...formData, printerConnection: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              placeholder="Enter printer settings (optional)"
            />
          </div>

          {/* Save Configuration Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-100 flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {isLoading ? 'SAVING DATA...' : 'UPDATE & INITIALIZE PROFILE'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Panel */}
      <div className="bg-sky-50 rounded-xl p-6 border border-sky-100">
        <h2 className="text-sm font-bold text-sky-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Setup Instructions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-sky-700">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center shrink-0 font-bold">1</div>
            <p>Ensure your <strong>Staff ID</strong> matches your official employee record for correct booking attribution.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center shrink-0 font-bold">2</div>
            <p>The <strong>Station Code</strong> defines where your shipments originate in the tracking system.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center shrink-0 font-bold">3</div>
            <p>After saving, you must <strong>Logout</strong> to allow the system to generate your new Active Batch.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
