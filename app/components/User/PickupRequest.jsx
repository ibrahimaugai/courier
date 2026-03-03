'use client'

import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Calendar, Clock, User, Phone, CheckCircle, Loader2, AlertCircle, Package, ChevronDown } from 'lucide-react'
import { api } from '../../lib/api'
import { fetchMyPickups } from '../../lib/store'
import Toast from '../Toast'

export default function PickupRequest() {
  const dispatch = useDispatch()
  const [eligibleBatches, setEligibleBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [batchBookings, setBatchBookings] = useState([])
  const [eligibleBookings, setEligibleBookings] = useState([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(true)
  const [isLoadingBatchDetail, setIsLoadingBatchDetail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const selectedBatch = eligibleBatches.find((b) => b.batchId === selectedBatchId) || null

  // Load list of batches that have eligible shipments (not yet requested for pickup)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoadingBatches(true)
      setLocalError('')
      try {
        const list = await api.getEligibleBatchesForPickup()
        const arr = Array.isArray(list) ? list : (list?.data ?? [])
        if (!mounted) return
        setEligibleBatches(arr)
        if (arr.length > 0 && !selectedBatchId) {
          setSelectedBatchId(arr[0].batchId)
        } else if (arr.length === 0) {
          setSelectedBatchId('')
          setBatchBookings([])
          setEligibleBookings([])
        }
      } catch (err) {
        if (mounted) {
          setLocalError(err?.message || 'Failed to load batches.')
          setEligibleBatches([])
          setSelectedBatchId('')
        }
      } finally {
        if (mounted) setIsLoadingBatches(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // When user selects a batch, load its bookings
  useEffect(() => {
    if (!selectedBatchId) {
      setBatchBookings([])
      setEligibleBookings([])
      return
    }
    let mounted = true
    const load = async () => {
      setIsLoadingBatchDetail(true)
      setLocalError('')
      try {
        const consignmentsRes = await api.getConsignments({ batchId: selectedBatchId })
        const list = Array.isArray(consignmentsRes) ? consignmentsRes : (consignmentsRes?.data ?? [])
        if (!mounted) return
        setBatchBookings(list)
        const eligible = list.filter((b) => {
          if (b.status !== 'BOOKED') return false
          const pickups = b.pickupRequests ?? []
          const hasActive = pickups.some((p) => p.status && p.status !== 'CANCELLED')
          return !hasActive
        })
        setEligibleBookings(eligible)
        if (eligible.length > 0) {
          const first = eligible[0]
          setFormData((prev) => ({
            ...prev,
            pickupAddress: prev.pickupAddress || first.customer?.address || '',
            contactPerson: prev.contactPerson || first.customer?.name || '',
            contactPhone: prev.contactPhone || first.customer?.phone || ''
          }))
        }
      } catch (err) {
        if (mounted) {
          setLocalError(err?.message || 'Failed to load batch.')
          setBatchBookings([])
          setEligibleBookings([])
        }
      } finally {
        if (mounted) setIsLoadingBatchDetail(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [selectedBatchId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBatchId) {
      setLocalError('Please select a batch.')
      return
    }
    if (eligibleBookings.length === 0) {
      setLocalError('No eligible shipments in this batch for pickup.')
      return
    }

    setIsSubmitting(true)
    setLocalError('')
    try {
      const data = {
        batchId: selectedBatchId,
        pickupAddress: formData.pickupAddress,
        pickupDate: formData.pickupDate,
        pickupTime: formData.preferredTime || undefined,
        contactName: formData.contactPerson,
        contactPhone: formData.contactPhone,
        specialInstructions: formData.specialInstructions || undefined
      }
      const result = await api.createBatchPickupRequest(data)
      const created = result?.created ?? 0
      const batchCode = result?.batchCode ?? selectedBatch?.batchCode ?? ''
      setToast({
        isVisible: true,
        message: `Pickup requested for ${created} shipment(s) in batch ${batchCode}.`,
        type: 'success'
      })
      setFormData({
        pickupAddress: '',
        pickupDate: '',
        preferredTime: '',
        contactPerson: '',
        contactPhone: '',
        specialInstructions: ''
      })
      dispatch(fetchMyPickups())
      // Refresh eligible batches list (this batch may drop off or have lower count)
      const list = await api.getEligibleBatchesForPickup()
      const arr = Array.isArray(list) ? list : (list?.data ?? [])
      setEligibleBatches(arr)
      if (arr.length > 0) {
        const stillHasCurrent = arr.some((b) => b.batchId === selectedBatchId)
        setSelectedBatchId(stillHasCurrent ? selectedBatchId : arr[0].batchId)
      } else {
        setSelectedBatchId('')
        setBatchBookings([])
        setEligibleBookings([])
      }
    } catch (error) {
      setLocalError(error?.message || 'Failed to submit pickup request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl w-full mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pickup Request</h1>
        <p className="text-gray-600">Request pickup for your current batch of shipments</p>
      </div>

      {isLoadingBatches ? (
        <div className="flex items-center justify-center py-16 gap-3 text-sky-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-medium">Loading batches...</span>
        </div>
      ) : eligibleBatches.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <Package className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-amber-800 mb-2">No batches eligible for pickup</h2>
          <p className="text-amber-700 text-sm">
            Batches that have shipments not yet requested for pickup will appear here. Create bookings and they will be grouped in a batch; then select a batch below to request pickup.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Batch dropdown + form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-sky-50/50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-sky-600" />
                  Select batch to request pickup
                </h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch
                </label>
                <div className="relative">
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white appearance-none font-medium text-gray-900"
                  >
                    {eligibleBatches.map((b) => (
                      <option key={b.batchId} value={b.batchId}>
                        {b.batchCode} — {b.eligibleCount} shipment{b.eligibleCount !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {isLoadingBatchDetail ? (
                <div className="p-6 flex items-center justify-center gap-3 text-sky-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium">Loading batch shipments...</span>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {localError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{localError}</p>
                  </div>
                )}

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time slot</label>
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
                    Pickup address <span className="text-red-500">*</span>
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
                      Contact person <span className="text-red-500">*</span>
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
                      Contact phone <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special instructions</label>
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
                    disabled={isSubmitting || eligibleBookings.length === 0}
                    className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Request pickup for batch ({eligibleBookings.length} shipment{eligibleBookings.length !== 1 ? 's' : ''})
                      </>
                    )}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>

          {/* Right: Batch shipments list */}
          <div className="lg:col-span-1">
            <div className="bg-sky-50 rounded-xl p-6 border border-sky-100 sticky top-8">
              <h3 className="text-lg font-semibold text-sky-900 mb-4">Shipments in batch</h3>
              {batchBookings.length === 0 ? (
                <p className="text-sm text-sky-600">No shipments in this batch yet.</p>
              ) : (
                <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                  {batchBookings.map((b) => {
                    const origin = b.originCity?.cityName || b.originCity?.name || '—'
                    const dest = b.destinationCity?.cityName || b.destinationCity?.name || '—'
                    const weight = b.weight != null ? `${Number(b.weight)} kg` : ''
                    const pieces = b.pieces != null ? `${b.pieces} pcs` : ''
                    const detail = [weight, pieces].filter(Boolean).join(' · ') || '—'
                    return (
                      <li
                        key={b.id}
                        className="bg-white border border-sky-200 rounded-lg p-3 text-sm shadow-sm"
                      >
                        <div className="font-mono font-semibold text-sky-900 mb-1">{b.cnNumber}</div>
                        <div className="text-gray-600 text-xs">
                          {origin} → {dest}
                        </div>
                        {detail && detail !== '—' && (
                          <div className="text-gray-500 text-xs mt-0.5">{detail}</div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
              <p className="text-xs text-sky-600 mt-4 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Pickups are usually processed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
