'use client'
import { useState } from 'react'
import { api } from '../../lib/api'
import { Loader2, Search, Trash2, AlertCircle } from 'lucide-react'

export default function CnVoid() {
  const [cnNumber, setCnNumber] = useState('')
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiding, setIsVoiding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [voidReason, setVoidReason] = useState('')
  const [showVoidConfirm, setShowVoidConfirm] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!cnNumber.trim()) return

    setIsLoading(true)
    setError('')
    setSuccess('')
    setBookingData(null)
    setShowVoidConfirm(false)
    setVoidReason('')

    try {
      const result = await api.trackBooking(cnNumber)
      const data = result.data || result

      if (data) {
        setBookingData(data)
      } else {
        setError('No booking found with this CN Number.')
      }
    } catch (err) {
      console.error('Error fetching booking:', err)
      setError(err.message || 'Failed to fetch booking details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      setError('Please provide a reason for voiding this booking.')
      return
    }

    setIsVoiding(true)
    setError('')
    setSuccess('')

    try {
      await api.voidConsignment(cnNumber, voidReason)
      setSuccess(`Booking ${cnNumber} has been successfully voided.`)
      setBookingData(prev => ({ ...prev, status: 'VOIDED' }))
      setShowVoidConfirm(false)
    } catch (err) {
      console.error('Error voiding booking:', err)
      setError(err.message || 'Failed to void booking.')
    } finally {
      setIsVoiding(false)
    }
  }

  return (
    <div className="max-w-7xl">
      {/* Header Section */}
      <div className="mb-6">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">CN Void</h1>
          <span className="text-sm text-green-600 font-medium">VER -1.863 LIVE</span>
        </div>
      </div>

      {/* Search Booking Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Search Booking by CN Number</h2>

        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Enter CN Number
          </label>
          <div className="relative flex-1">
            <input
              type="text"
              value={cnNumber}
              onChange={(e) => setCnNumber(e.target.value)}
              placeholder="Enter CN Number to search"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors whitespace-nowrap shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Search
          </button>
        </form>

        {(error || success) && (
          <div className={`mt-4 p-4 rounded-md flex items-center gap-3 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {error ? <AlertCircle className="w-5 h-5" /> : null}
            <p className="font-medium">{error || success}</p>
          </div>
        )}
      </div>

      {bookingData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Booking Summary</h2>
                <p className="text-sm text-gray-500">CN: {bookingData.cnNumber}</p>
              </div>
              <div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${bookingData.status === 'VOIDED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
                  }`}>
                  {bookingData.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Shipper</span>
                <p className="font-semibold text-gray-900">{bookingData.shipperName || bookingData.customer?.name}</p>
                <p className="text-sm text-gray-600 truncate">{bookingData.shipperAddress || bookingData.customer?.address}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Consignee</span>
                <p className="font-semibold text-gray-900">{bookingData.consigneeName}</p>
                <p className="text-sm text-gray-600 truncate">{bookingData.consigneeAddress}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Origin / Destination</span>
                <p className="font-semibold text-gray-900">
                  {bookingData.originCity?.cityName || 'N/A'} - {bookingData.destinationCity?.cityName || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Total Amount</span>
                <p className="text-lg font-bold text-sky-600">PKR {bookingData.totalAmount}</p>
              </div>
            </div>

            {bookingData.status !== 'VOIDED' && !showVoidConfirm && (
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowVoidConfirm(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Trash2 className="w-5 h-5" />
                  Void Booking
                </button>
              </div>
            )}

            {showVoidConfirm && (
              <div className="mt-6 p-6 border-2 border-red-100 bg-red-50 rounded-lg animate-slide-up">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Confirm Void Operation
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  You are about to void this booking. This action cannot be undone. Please provide a reason for voiding.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-red-800 mb-2">Void Reason</label>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    className="w-full px-4 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                    placeholder="Why are you voiding this booking?"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowVoidConfirm(false)}
                    className="px-6 py-2 bg-white text-gray-700 font-bold rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoid}
                    disabled={isVoiding}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 disabled:opacity-70 transition-all shadow-md"
                  >
                    {isVoiding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Confirm & Void
                  </button>
                </div>
              </div>
            )}

            {bookingData.status === 'VOIDED' && bookingData.cancelReason && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <span className="block text-xs text-red-800 font-bold uppercase mb-1">Void Reason:</span>
                <p className="text-red-900 italic">"{bookingData.cancelReason}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

