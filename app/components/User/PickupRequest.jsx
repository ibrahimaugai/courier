'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Clock, MapPin, User, Phone, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { fetchEligibleBookings, createPickupRequest, fetchMyPickups, clearPickupsError, clearPickupsSuccess } from '../../lib/store'
import Toast from '../Toast'

export default function PickupRequest() {
  const dispatch = useDispatch()
  const { eligibleBookings, pickups, isLoading, error, success } = useSelector((state) => state.pickups)
  const [selectedBooking, setSelectedBooking] = useState('')
  const [localError, setLocalError] = useState('')
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })

  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupDate: '',
    preferredTime: '',
    contactPerson: '',
    contactPhone: '',
    specialInstructions: ''
  })

  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchEligibleBookings())
    dispatch(fetchMyPickups())
  }, [dispatch])

  // Update form when booking is selected
  useEffect(() => {
    const safeEligible = Array.isArray(eligibleBookings) ? eligibleBookings : []
    if (selectedBooking && safeEligible.length > 0) {
      const booking = safeEligible.find(b => b.id === selectedBooking)
      if (booking) {
        setSelectedBookingDetails(booking)
        setFormData(prev => ({
          ...prev,
          pickupAddress: booking.customer?.address || '',
          contactPerson: booking.customer?.name || '',
          contactPhone: booking.customer?.phone || ''
        }))
      }
    }
  }, [selectedBooking, eligibleBookings])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedBooking) {
      setLocalError('Please select a booking')
      return
    }

    try {
      setLocalError('')
      dispatch(clearPickupsError())

      const pickupData = {
        bookingId: selectedBooking,
        pickupAddress: formData.pickupAddress,
        pickupDate: formData.pickupDate,
        pickupTime: formData.preferredTime,
        contactName: formData.contactPerson,
        contactPhone: formData.contactPhone,
        specialInstructions: formData.specialInstructions
      }

      const result = await dispatch(createPickupRequest(pickupData))

      if (createPickupRequest.fulfilled.match(result)) {
        setToast({
          isVisible: true,
          message: `Pickup request submitted successfully!`,
          type: 'success'
        })
        // Reset form
        setFormData({
          pickupAddress: '',
          pickupDate: '',
          preferredTime: '',
          contactPerson: '',
          contactPhone: '',
          specialInstructions: ''
        })
        setSelectedBooking('')
        setSelectedBookingDetails(null)
        // Refresh data
        dispatch(fetchEligibleBookings())
        dispatch(fetchMyPickups())
      }
    } catch (error) {
      setLocalError('Failed to submit pickup request. Please try again.')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'REQUESTED': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'PICKED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const displayError = error || localError

  return (
    <div className="max-w-7xl w-full mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pickup Requests</h1>
        <p className="text-gray-600">Request and manage pickups for your shipments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left: Pickup Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                New Pickup Request
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {displayError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{displayError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Booking <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                >
                  <option value="">Choose a shipment...</option>
                  {(Array.isArray(eligibleBookings) ? eligibleBookings : []).map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.cnNumber} - {booking.originCity?.cityName} to {booking.destinationCity?.cityName}
                    </option>
                  ))}
                </select>
                {(!Array.isArray(eligibleBookings) || eligibleBookings.length === 0) && !isLoading && (
                  <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    No eligible bookings found for pickup.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="">Any time</option>
                      <option value="Morning">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Street address, city..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Gate code, landmark, etc."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Pickup Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Selection Summary */}
        <div className="lg:col-span-1">
          <div className="bg-sky-50 rounded-xl p-6 border border-sky-100 sticky top-8">
            <h3 className="text-lg font-semibold text-sky-900 mb-4">Shipment Summary</h3>
            {selectedBookingDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-sky-200">
                  <span className="text-sm text-sky-700">CN Number</span>
                  <span className="text-sm font-bold text-sky-900">{selectedBookingDetails.cnNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-sky-200">
                  <span className="text-sm text-sky-700">Route</span>
                  <span className="text-sm font-medium text-sky-900">
                    {selectedBookingDetails.originCity?.cityName} → {selectedBookingDetails.destinationCity?.cityName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-sky-200">
                  <span className="text-sm text-sky-700">Weight</span>
                  <span className="text-sm font-medium text-sky-900">{selectedBookingDetails.weight} kg</span>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-sky-600 bg-sky-100/50 p-3 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Pickups are usually processed within 24 hours of request.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-sky-200 mb-4" />
                <p className="text-sm text-sky-600">Select a shipment to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Pickups Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Pickup Requests</h2>
          <button
            onClick={() => dispatch(fetchMyPickups())}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            Refresh List
          </button>
        </div>
        <div className="overflow-x-auto">
          {isLoading && pickups.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>You haven't made any pickup requests yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600">
                <tr>
                  <th className="px-6 py-4">CN Number</th>
                  <th className="px-6 py-4">Pickup Date</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {(Array.isArray(pickups) ? pickups : []).map((pickup) => (
                  <tr key={pickup.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{pickup.booking?.cnNumber}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(pickup.pickupDate).toLocaleDateString()}
                      {pickup.pickupTime && <span className="ml-2 text-xs text-gray-400">({pickup.pickupTime})</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={pickup.pickupAddress}>
                      {pickup.pickupAddress}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(pickup.status)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {pickup.assignedRider?.name || <span className="text-gray-400 italic">Not assigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
