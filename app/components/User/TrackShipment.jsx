
'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Package, MapPin, Truck, CheckCircle, Clock, AlertCircle, Loader2, Calendar, ChevronDown } from 'lucide-react'
import { trackShipment, fetchUserCns, clearTrackingError, clearTrackingData } from '../../lib/store'

export default function TrackShipment() {
  const dispatch = useDispatch()
  const { trackingData, cnList, isLoading, isLoadingCns, error } = useSelector((state) => state.tracking)
  const [cnNumber, setCnNumber] = useState('')
  const [selectedCnFromDropdown, setSelectedCnFromDropdown] = useState('')
  const [localError, setLocalError] = useState('')

  // Fetch user's CNs on mount
  useEffect(() => {
    dispatch(fetchUserCns())
  }, [dispatch])

  // Auto-track when dropdown selection changes
  useEffect(() => {
    if (selectedCnFromDropdown) {
      setCnNumber(selectedCnFromDropdown)
      // Auto-trigger tracking
      const trackSelectedCn = async () => {
        try {
          setLocalError('')
          dispatch(clearTrackingError())
          dispatch(clearTrackingData())
          const result = await dispatch(trackShipment(selectedCnFromDropdown))

          if (!trackShipment.fulfilled.match(result)) {
            setLocalError(result.payload || 'Failed to track shipment')
          }
        } catch (error) {
          console.error('Error tracking shipment:', error)
          setLocalError(error.message || 'Failed to track shipment. Please check CN number and try again.')
        }
      }
      trackSelectedCn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCnFromDropdown])

  const timelineSteps = [
    { id: 0, name: 'Request Received', status: 'PENDING' },
    { id: 1, name: 'Booked', status: 'BOOKED' },
    { id: 2, name: 'Pickup Requested', status: 'PICKUP_REQUESTED' },
    { id: 3, name: 'Picked', status: 'PICKED' },
    { id: 4, name: 'At Hub', status: 'AT_HUB' },
    { id: 5, name: 'Manifested', status: 'MANIFESTED' },
    { id: 6, name: 'In Transit', status: 'IN_TRANSIT' },
    { id: 7, name: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
    { id: 8, name: 'Delivered', status: 'DELIVERED' }
  ]

  const handleTrack = async (e, cnToTrack = null) => {
    e?.preventDefault()

    const cnToUse = cnToTrack || cnNumber.trim()

    if (!cnToUse) {
      setLocalError('Please enter a CN number')
      return
    }

    try {
      setLocalError('')
      dispatch(clearTrackingError())
      dispatch(clearTrackingData())
      const result = await dispatch(trackShipment(cnToUse))

      if (trackShipment.fulfilled.match(result)) {
        // Success - trackingData will be available from Redux
      } else {
        setLocalError(result.payload || 'Failed to track shipment')
      }
    } catch (error) {
      console.error('Error tracking shipment:', error)
      setLocalError(error.message || 'Failed to track shipment. Please check CN number and try again.')
    }
  }

  const handleDropdownChange = (e) => {
    const selectedCn = e.target.value
    setSelectedCnFromDropdown(selectedCn)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { bg: 'bg-amber-100', text: 'text-amber-700' },
      'BOOKED': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'PICKUP_REQUESTED': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'AT_HUB': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
      'IN_TRANSIT': { bg: 'bg-purple-100', text: 'text-purple-700' },
      'AT_DEPOT': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      'OUT_FOR_DELIVERY': { bg: 'bg-teal-100', text: 'text-teal-700' },
      'DELIVERED': { bg: 'bg-green-100', text: 'text-green-700' },
      'RETURNED': { bg: 'bg-red-100', text: 'text-red-700' },
      'VOIDED': { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
    return `${config.bg} ${config.text}`
  }

  const formatStatusName = (status) => {
    const nameMap = {
      'PENDING': 'Pending Approval',
      'BOOKED': 'Booked',
      'PICKUP_REQUESTED': 'Pickup Requested',
      'PICKED': 'Picked',
      'AT_HUB': 'At Hub',
      'MANIFESTED': 'Manifested',
      'IN_TRANSIT': 'In Transit',
      'AT_DEPOT': 'At Depot',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'RETURNED': 'Returned',
      'VOIDED': 'Voided',
      'BOOKING_UPDATED': 'Booking Updated'
    }
    return nameMap[status] || status
  }

  // Transform tracking data for display
  const displayData = trackingData ? {
    cnNumber: trackingData.cnNumber || '',
    origin: trackingData.originCity?.cityName || '',
    destination: trackingData.destinationCity?.cityName || '',
    serviceType: trackingData.service?.serviceName || '',
    currentStatus: trackingData.status || 'BOOKED',
    bookingDate: trackingData.bookingDate ? new Date(trackingData.bookingDate).toISOString().split('T')[0] : '',
    customerInfo: {
      shipperName: trackingData.customer?.name || '',
      consigneeName: trackingData.consigneeName || '',
      consigneePhone: trackingData.consigneePhone || ''
    },
    paymentType: trackingData.paymentMode || '',
    weight: trackingData.weight?.toString() || '0',
    pieces: trackingData.pieces || 0,
    totalAmount: trackingData.totalAmount?.toString() || '0',
    events: (trackingData.bookingHistory || []).map(h => ({
      id: h.id,
      status: h.newStatus || h.action,
      createdAt: h.createdAt,
      remarks: h.remarks
    })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } : null

  const displayError = error || localError

  // Map events to timeline steps
  const getEventForStep = (stepStatus) => {
    if (!displayData?.events) return null
    return displayData.events.find(e => e.status === stepStatus) || null
  }

  const getCurrentStepIndex = () => {
    if (!displayData?.events || displayData.events.length === 0) return -1

    // Find the latest event and map to step index
    const latestEvent = displayData.events[displayData.events.length - 1]
    const stepIndex = timelineSteps.findIndex(step => step.status === latestEvent.status)
    return stepIndex >= 0 ? stepIndex : -1
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-amber-100 text-amber-800',
      'BOOKED': 'bg-blue-100 text-blue-800',
      'PICKUP_REQUESTED': 'bg-yellow-100 text-yellow-800',
      'PICKED': 'bg-purple-100 text-purple-800',
      'AT_HUB': 'bg-cyan-100 text-cyan-800',
      'MANIFESTED': 'bg-sky-100 text-sky-800',
      'IN_TRANSIT': 'bg-orange-100 text-orange-800',
      'OUT_FOR_DELIVERY': 'bg-teal-100 text-teal-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'RETURNED': 'bg-red-100 text-red-800',
      'VOIDED': 'bg-gray-100 text-gray-800',
      'BOOKING_UPDATED': 'bg-cyan-100 text-cyan-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }


  return (
    <div className="max-w-7xl w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Shipment</h1>
        <p className="text-sm text-gray-600">Enter CN number to track your shipment status</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        {/* Dropdown Selection */}
        {cnList.length > 0 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select from Your Bookings
              </label>
              <div className="relative">
                <select
                  value={selectedCnFromDropdown}
                  onChange={handleDropdownChange}
                  className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white appearance-none transition-colors"
                  disabled={isLoadingCns}
                >
                  <option value="">Select a booking to track...</option>
                  {cnList.map((item) => (
                    <option key={item.cnNumber} value={item.cnNumber}>
                      {item.cnNumber} - {item.destinationCity} ({formatStatusName(item.status)})
                    </option>
                  ))}
                </select>
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                {isLoadingCns && (
                  <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </>
        )}

        {/* Manual CN Input */}
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {cnList.length > 0 ? 'Enter CN Number Manually' : 'Enter CN Number'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={cnNumber}
                onChange={(e) => {
                  setCnNumber(e.target.value.toUpperCase())
                  setSelectedCnFromDropdown('') // Clear dropdown selection when typing manually
                }}
                placeholder="Enter CN number (e.g., CN-20251231-000245)"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
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

        {/* Empty State for CN List */}
        {!isLoadingCns && cnList.length === 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              No bookings found. Create a booking to track shipments.
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Tracking Results */}
      {displayData && (
        <div className="space-y-6">
          {/* Shipment Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-sky-50 rounded-md p-4 border border-sky-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-sky-600" />
                  <span className="text-sm font-medium text-gray-600">CN Number</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{displayData.cnNumber}</p>
              </div>

              <div className="bg-purple-50 rounded-md p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Route</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{displayData.origin} → {displayData.destination}</p>
              </div>

              <div className="bg-indigo-50 rounded-md p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Service Type</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{displayData.serviceType}</p>
              </div>

              <div className="bg-teal-50 rounded-md p-4 border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-600">Current Status</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(displayData.currentStatus)}`}>
                  {formatStatusName(displayData.currentStatus)}
                </span>
              </div>

              <div className="bg-orange-50 rounded-md p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Booking Date</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{new Date(displayData.bookingDate).toLocaleDateString()}</p>
              </div>

              <div className="bg-green-50 rounded-md p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Est. Delivery</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {displayData.events.find(e => e.status === 'DELIVERED')
                    ? new Date(displayData.events.find(e => e.status === 'DELIVERED').createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Tracking Timeline</h2>

            {/* Desktop Timeline - Horizontal */}
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
                    const event = getEventForStep(step.status)
                    const isCompleted = event !== null
                    const isCurrent = index === getCurrentStepIndex()
                    const isPending = index > getCurrentStepIndex()

                    return (
                      <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / timelineSteps.length}%` }}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${isCompleted
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
                        </div>
                        <div className="mt-3 text-center max-w-[120px]">
                          <p className={`text-xs font-semibold ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.name}
                          </p>
                          {event && (
                            <div className="mt-1 text-xs text-gray-600">
                              <p>{new Date(event.createdAt).toLocaleDateString()}</p>
                              <p>{new Date(event.createdAt).toLocaleTimeString()}</p>
                              {event.remarks && (
                                <p className="text-gray-500 mt-1">{event.remarks}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Timeline - Vertical */}
            <div className="lg:hidden">
              <div className="relative pl-8">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
                  <div
                    className="w-0.5 bg-sky-600 transition-all duration-500"
                    style={{ height: `${((getCurrentStepIndex() + 1) / timelineSteps.length) * 100}%` }}
                  ></div>
                </div>

                {/* Timeline Steps */}
                {timelineSteps.map((step, index) => {
                  const event = getEventForStep(step.status)
                  const isCompleted = event !== null
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
                        {event ? (
                          <div className="mt-1 text-xs text-gray-600">
                            <p>{new Date(event.createdAt).toLocaleDateString()} at {new Date(event.createdAt).toLocaleTimeString()}</p>
                            {event.remarks && (
                              <p className="text-gray-500 mt-1">{event.remarks}</p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-gray-400">Pending</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Shipper</p>
                <p className="font-medium text-gray-900">{displayData.customerInfo.shipperName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Consignee</p>
                <p className="font-medium text-gray-900">{displayData.customerInfo.consigneeName}</p>
                <p className="text-sm text-gray-500">{displayData.customerInfo.consigneePhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-medium text-gray-900">{displayData.paymentType}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!displayData && !isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Enter CN number to track shipment</p>
          <p className="text-gray-500 text-sm mt-2">Get real-time updates on your shipment status</p>
        </div>
      )}
    </div>
  )
}

