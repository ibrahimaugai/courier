'use client'

import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Search, Package, MapPin, Truck, CheckCircle, Clock, AlertCircle, Loader2, Edit, Save, X, FileText, Calendar, User, Phone, DollarSign, MessageSquare } from 'lucide-react'
import { api } from '../../../lib/api'

/** Map backend Booking + bookingHistory to ShipmentTracking UI format */
function transformBookingToTrackingData(booking) {
  const b = booking || {}
  const origin = b.originCity?.cityName || b.originCity?.name || '—'
  const dest = b.destinationCity?.cityName || b.destinationCity?.name || '—'
  const serviceName = b.service?.serviceName || b.service?.name || '—'
  const statusToDisplay = {
    PENDING: 'Pending',
    BOOKED: 'Booked',
    PICKUP_REQUESTED: 'Pickup Requested',
    RIDER_ON_WAY: 'Picked',
    AT_HUB: 'Arrival Scan',
    IN_TRANSIT: 'In Transit',
    AT_DEPOT: 'At Depot',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    RETURNED: 'Returned',
    VOIDED: 'Voided'
  }
  const currentStatus = statusToDisplay[b.status] || b.status || '—'

  const statusToStepKey = {
    BOOKED: 'booked',
    PICKUP_REQUESTED: 'pickupRequested',
    RIDER_ON_WAY: 'picked',
    AT_HUB: 'arrivalScan',
    IN_TRANSIT: 'inTransit',
    OUT_FOR_DELIVERY: 'outForDelivery',
    DELIVERED: 'delivered'
  }

  const timeline = {
    booked: null,
    pickupRequested: null,
    picked: null,
    arrivalScan: null,
    manifested: null,
    inTransit: null,
    outForDelivery: null,
    delivered: null
  }

  const history = Array.isArray(b.bookingHistory) ? b.bookingHistory : []
  for (const h of history) {
    const stepKey = statusToStepKey[h.newStatus]
    const d = h.createdAt ? new Date(h.createdAt) : new Date()
    const stepEntry = {
      date: d.toISOString().split('T')[0],
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      location: origin,
      updatedBy: h.performedByUser?.username || 'System'
    }
    if (stepKey) {
      if (!timeline[stepKey]) timeline[stepKey] = stepEntry
    }
    if (h.newStatus === 'AT_HUB') {
      if (!timeline.manifested) timeline.manifested = stepEntry
    } else if (h.newStatus === 'IN_TRANSIT' && !timeline.manifested) {
      timeline.manifested = stepEntry
    }
  }

  const linkedDocuments = []
  if (b.manifest?.manifestCode) {
    linkedDocuments.push({
      type: 'Manifest',
      id: b.manifest.manifestCode,
      date: b.manifest.manifestDate ? new Date(b.manifest.manifestDate).toLocaleDateString() : ''
    })
  }
  if (b.deliverySheet?.sheetNumber) {
    linkedDocuments.push({
      type: 'Delivery Sheet',
      id: b.deliverySheet.sheetNumber,
      date: b.deliverySheet.sheetDate ? new Date(b.deliverySheet.sheetDate).toLocaleDateString() : ''
    })
  }

  const remarksFromHistory = history
    .filter(h => h.remarks)
    .map(h => ({
      date: h.createdAt ? new Date(h.createdAt).toISOString().split('T')[0] : '',
      time: h.createdAt ? new Date(h.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
      user: h.performedByUser?.username || 'System',
      note: h.remarks
    }))
    .reverse()

  const bookingDate = b.bookingDate ? new Date(b.bookingDate) : null
  const totalAmt = b.totalAmount != null ? Number(b.totalAmount) : (b.codAmount != null ? Number(b.codAmount) : null)
  const weightVal = b.weight != null ? (typeof b.weight === 'object' ? parseFloat(b.weight.toString()) : parseFloat(b.weight)) : null

  return {
    bookingId: b.id,
    cnNumber: b.cnNumber || '—',
    origin,
    destination: dest,
    serviceType: serviceName,
    currentStatus,
    bookingDate: bookingDate ? bookingDate.toISOString().split('T')[0] : '',
    timeline,
    customerInfo: {
      shipperName: b.shipperName || b.customer?.name || '—',
      shipperPhone: b.shipperPhone || b.customer?.phone || '—',
      shipperAddress: b.shipperAddress || b.customer?.address || '—',
      consigneeName: b.consigneeName || '—',
      consigneePhone: b.consigneePhone || '—',
      consigneeAddress: b.consigneeAddress || '—'
    },
    paymentType: b.paymentMode || '—',
    paymentAmount: totalAmt,
    estimatedDelivery: b.preferredDeliveryDate ? new Date(b.preferredDeliveryDate).toISOString().split('T')[0] : null,
    weight: weightVal != null ? `${weightVal} kg` : '—',
    pieces: b.pieces ?? '—',
    remarks: remarksFromHistory,
    linkedDocuments
  }
}

export default function ShipmentTracking() {
  const [cnNumber, setCnNumber] = useState('')
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingStatus, setEditingStatus] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [showRemarksModal, setShowRemarksModal] = useState(false)

  const allTimelineSteps = [
    { id: 1, name: 'Booked', key: 'booked' },
    { id: 2, name: 'Pickup Requested', key: 'pickupRequested' },
    { id: 3, name: 'Picked', key: 'picked' },
    { id: 4, name: 'Arrival Scan', key: 'arrivalScan' },
    { id: 5, name: 'Manifested', key: 'manifested' },
    { id: 6, name: 'In Transit', key: 'inTransit' },
    { id: 7, name: 'Out for Delivery', key: 'outForDelivery' },
    { id: 8, name: 'Delivered', key: 'delivered' }
  ]

  const { user: reduxUser } = useSelector((state) => state.auth || {})
  const currentUser = useMemo(() => {
    if (reduxUser?.role) return reduxUser
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [reduxUser])

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'

  const timelineSteps = useMemo(() => {
    if (isAdmin) {
      return allTimelineSteps.filter(s => s.key !== 'pickupRequested' && s.key !== 'picked')
    }
    return allTimelineSteps
  }, [isAdmin])

  const handleTrack = async (e) => {
    e?.preventDefault()

    if (!cnNumber.trim()) {
      setError('Please enter a CN number')
      return
    }

    try {
      setLoading(true)
      setError('')
      setTrackingData(null)

      const result = await api.trackBooking(cnNumber.trim())
      const booking = result?.data || result
      if (!booking || !booking.cnNumber) {
        setError('Consignment not found. Please check the CN number and try again.')
        return
      }

      const transformed = transformBookingToTrackingData(booking)
      setTrackingData(transformed)
    } catch (err) {
      console.error('Error tracking shipment:', err)
      const msg = err?.message || err?.response?.data?.message
      setError(msg || 'Failed to track shipment. Please check CN number and try again.')
      setTrackingData(null)
    } finally {
      setLoading(false)
    }
  }

  const displayToApiStatus = {
    'Booked': 'BOOKED',
    'Pickup Requested': 'PICKUP_REQUESTED',
    'Picked': 'RIDER_ON_WAY',
    'Arrival Scan': 'AT_HUB',
    'Manifested': 'AT_HUB',
    'In Transit': 'IN_TRANSIT',
    'Out for Delivery': 'OUT_FOR_DELIVERY',
    'Delivered': 'DELIVERED'
  }

  const handleUpdateStatus = async (stepKey) => {
    if (!newStatus) {
      setError('Please select a status')
      return
    }

    const apiStatus = displayToApiStatus[newStatus]
    if (!apiStatus) {
      setError('Invalid status selected')
      return
    }

    if (!trackingData?.bookingId) {
      setError('Cannot update status: booking ID missing')
      return
    }

    try {
      setError('')
      await api.updateConsignmentStatus(trackingData.bookingId, apiStatus)
      const result = await api.trackBooking(trackingData.cnNumber)
      const booking = result?.data || result
      if (booking?.cnNumber) {
        setTrackingData(transformBookingToTrackingData(booking))
      }
      setEditingStatus(null)
      setNewStatus('')
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err?.message || 'Failed to update status')
    }
  }

  const handleAddRemarks = async () => {
    if (!remarks.trim()) {
      setError('Please enter remarks')
      return
    }

    if (!trackingData?.bookingId) {
      setError('Cannot add remarks: booking ID missing')
      return
    }

    try {
      setError('')
      const booking = await api.addConsignmentRemarks(trackingData.bookingId, remarks.trim())
      if (booking?.cnNumber) {
        setTrackingData(transformBookingToTrackingData(booking))
      }
      setRemarks('')
      setShowRemarksModal(false)
    } catch (err) {
      console.error('Error adding remarks:', err)
      setError(err?.message || 'Failed to add remarks')
    }
  }

  const getCurrentStepIndex = () => {
    if (!trackingData) return -1
    const currentStatus = trackingData.currentStatus
    const statusMap = isAdmin
      ? {
          'Booked': 0,
          'Pickup Requested': 1,
          'Picked': 1,
          'Arrival Scan': 1,
          'Manifested': 2,
          'In Transit': 3,
          'Out for Delivery': 4,
          'Delivered': 5
        }
      : {
          'Booked': 0,
          'Pickup Requested': 1,
          'Picked': 2,
          'Arrival Scan': 3,
          'Manifested': 4,
          'In Transit': 5,
          'Out for Delivery': 6,
          'Delivered': 7
        }
    return statusMap[currentStatus] ?? -1
  }

  const getStatusColor = (status) => {
    const colors = {
      'Booked': 'bg-blue-100 text-blue-800',
      'Pickup Requested': 'bg-yellow-100 text-yellow-800',
      'Picked': 'bg-purple-100 text-purple-800',
      'Arrival Scan': 'bg-sky-100 text-sky-800',
      'Manifested': 'bg-sky-100 text-sky-800',
      'In Transit': 'bg-orange-100 text-orange-800',
      'Out for Delivery': 'bg-teal-100 text-teal-800',
      'Delivered': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-7xl w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipment Tracking</h1>
        <p className="text-sm text-gray-600">Full visibility and control over shipment lifecycle</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter CN Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cnNumber}
                onChange={(e) => setCnNumber(e.target.value.toUpperCase())}
                placeholder="Enter CN number (e.g., CN001234)"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Shipment Overview Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-sky-50 rounded-md p-4 border border-sky-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-sky-600" />
                  <span className="text-sm font-medium text-gray-600">CN Number</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{trackingData.cnNumber}</p>
              </div>

              <div className="bg-purple-50 rounded-md p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Route</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{trackingData.origin} → {trackingData.destination}</p>
              </div>

              <div className="bg-sky-50 rounded-md p-4 border border-sky-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-sky-600" />
                  <span className="text-sm font-medium text-gray-600">Service Type</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{trackingData.serviceType}</p>
              </div>

              <div className="bg-orange-50 rounded-md p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Current Status</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(trackingData.currentStatus)}`}>
                  {trackingData.currentStatus}
                </span>
              </div>

              <div className="bg-teal-50 rounded-md p-4 border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-600">Payment</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{trackingData.paymentType}</p>
                {trackingData.paymentAmount && (
                  <p className="text-sm text-gray-600">Rs. {trackingData.paymentAmount.toLocaleString()}</p>
                )}
              </div>

              <div className="bg-green-50 rounded-md p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Est. Delivery</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                Shipper Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{trackingData.customerInfo.shipperName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{trackingData.customerInfo.shipperPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{trackingData.customerInfo.shipperAddress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                Consignee Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{trackingData.customerInfo.consigneeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{trackingData.customerInfo.consigneePhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{trackingData.customerInfo.consigneeAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Shipment Timeline with Edit Capability */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Shipment Timeline</h2>
            </div>

            {/* Desktop Timeline */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-1 bg-sky-600 transition-all duration-500"
                    style={{ width: `${((getCurrentStepIndex() + 1) / timelineSteps.length) * 100}%` }}
                  ></div>
                </div>

                {/* Timeline Steps */}
                <div className="relative flex justify-between">
                  {timelineSteps.map((step, index) => {
                    const stepData = trackingData.timeline[step.key]
                    const isCompleted = stepData !== null
                    const isCurrent = index === getCurrentStepIndex()
                    const isPending = index > getCurrentStepIndex()

                    return (
                      <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / timelineSteps.length}%` }}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all relative ${isCompleted
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : isCurrent
                              ? 'bg-white border-sky-600 text-sky-600'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Clock className="w-6 h-6" />
                          )}
                          {!isAdmin && editingStatus === step.key && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="mt-3 text-center max-w-[120px]">
                          <p className={`text-xs font-semibold ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.name}
                          </p>
                          {stepData ? (
                            <div className="mt-1 text-xs text-gray-600">
                              <p>{stepData.date}</p>
                              <p>{stepData.time}</p>
                              {stepData.location && (
                                <p className="text-gray-500">{stepData.location}</p>
                              )}
                              {stepData.updatedBy && (
                                <p className="text-gray-400 text-[10px]">by {stepData.updatedBy}</p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-gray-400">Pending</p>
                          )}
                          {!isAdmin && (editingStatus === step.key ? (
                            <div className="mt-2 space-y-2">
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                              >
                                <option value="">Select Status</option>
                                {timelineSteps.map(s => (
                                  <option key={s.key} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleUpdateStatus(step.key)}
                                  className="flex-1 px-2 py-1 bg-sky-600 text-white text-xs rounded hover:bg-sky-700"
                                >
                                  <Save className="w-3 h-3 mx-auto" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingStatus(null)
                                    setNewStatus('')
                                  }}
                                  className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                >
                                  <X className="w-3 h-3 mx-auto" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            !isPending && (
                              <button
                                onClick={() => setEditingStatus(step.key)}
                                className="mt-1 px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200 flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="lg:hidden">
              <div className="relative pl-8">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
                  <div
                    className="w-0.5 bg-sky-600 transition-all duration-500"
                    style={{ height: `${((getCurrentStepIndex() + 1) / timelineSteps.length) * 100}%` }}
                  ></div>
                </div>

                {timelineSteps.map((step, index) => {
                  const stepData = trackingData.timeline[step.key]
                  const isCompleted = stepData !== null
                  const isCurrent = index === getCurrentStepIndex()

                  return (
                    <div key={step.id} className="relative mb-8 last:mb-0">
                      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-4 -translate-x-1/2 transition-all ${isCompleted
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : isCurrent
                            ? 'bg-white border-sky-600 text-sky-600'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="ml-6">
                        <p className={`text-sm font-semibold ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.name}
                        </p>
                        {stepData ? (
                          <div className="mt-1 text-xs text-gray-600">
                            <p>{stepData.date} at {stepData.time}</p>
                            {stepData.location && (
                              <p className="text-gray-500">{stepData.location}</p>
                            )}
                            {stepData.updatedBy && (
                              <p className="text-gray-400">by {stepData.updatedBy}</p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-gray-400">Pending</p>
                        )}
                        {!isAdmin && editingStatus === step.key && (
                          <div className="mt-2 space-y-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">Select Status</option>
                              {timelineSteps.map(s => (
                                <option key={s.key} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdateStatus(step.key)}
                                className="px-2 py-1 bg-sky-600 text-white text-xs rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStatus(null)
                                  setNewStatus('')
                                }}
                                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        {!isAdmin && editingStatus !== step.key && index <= getCurrentStepIndex() && (
                          <button
                            onClick={() => setEditingStatus(step.key)}
                            className="mt-1 px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          {trackingData.remarks && trackingData.remarks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Remarks & Comments</h3>
              <div className="space-y-3">
                {trackingData.remarks.map((remark, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{remark.note}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {remark.date} {remark.time}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">by {remark.user}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Documents */}
          {trackingData.linkedDocuments && trackingData.linkedDocuments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Linked Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackingData.linkedDocuments.map((doc, index) => (
                  <div key={index} className="bg-sky-50 rounded-md p-4 border border-sky-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.type}</p>
                        <p className="text-sm text-gray-600">{doc.id}</p>
                        <p className="text-xs text-gray-500">{doc.date}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-sky-600 text-white text-xs rounded hover:bg-sky-700">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!trackingData && !loading && !error && (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Enter CN number to track shipment</p>
          <p className="text-gray-500 text-sm mt-2">Get full visibility and control over shipment lifecycle</p>
        </div>
      )}

      {/* Add Remarks Modal */}
      {showRemarksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Remarks</h3>
              <button
                onClick={() => {
                  setShowRemarksModal(false)
                  setRemarks('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-y"
                placeholder="Enter remarks or comments..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRemarksModal(false)
                  setRemarks('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRemarks}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Add Remarks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

