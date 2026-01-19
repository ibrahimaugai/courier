'use client'

import { useState } from 'react'
import { Search, Package, MapPin, Truck, CheckCircle, Clock, AlertCircle, Loader2, Edit, Save, X, FileText, Calendar, User, Phone, DollarSign, MessageSquare } from 'lucide-react'

export default function ShipmentTracking() {
  const [cnNumber, setCnNumber] = useState('')
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingStatus, setEditingStatus] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [showRemarksModal, setShowRemarksModal] = useState(false)

  const timelineSteps = [
    { id: 1, name: 'Booked', key: 'booked' },
    { id: 2, name: 'Pickup Requested', key: 'pickupRequested' },
    { id: 3, name: 'Picked', key: 'picked' },
    { id: 4, name: 'Arrival Scan', key: 'arrivalScan' },
    { id: 5, name: 'Manifested', key: 'manifested' },
    { id: 6, name: 'In Transit', key: 'inTransit' },
    { id: 7, name: 'Out for Delivery', key: 'outForDelivery' },
    { id: 8, name: 'Delivered', key: 'delivered' }
  ]

  const handleTrack = async (e) => {
    e?.preventDefault()
    
    if (!cnNumber.trim()) {
      setError('Please enter a CN number')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/track/${cnNumber}`)
      // const data = await response.json()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Mock tracking data with admin view
      const mockData = {
        cnNumber: cnNumber.toUpperCase(),
        origin: 'Lahore',
        destination: 'Karachi',
        serviceType: 'Express',
        currentStatus: 'In Transit',
        bookingDate: '2024-01-15',
        timeline: {
          booked: { date: '2024-01-15', time: '10:30 AM', location: 'Lahore', updatedBy: 'Admin-001' },
          pickupRequested: { date: '2024-01-15', time: '02:15 PM', location: 'Lahore', updatedBy: 'User' },
          picked: { date: '2024-01-16', time: '11:00 AM', location: 'Lahore', updatedBy: 'Rider-001' },
          arrivalScan: { date: '2024-01-16', time: '03:45 PM', location: 'Lahore Hub', updatedBy: 'Admin-002' },
          manifested: { date: '2024-01-17', time: '09:00 AM', location: 'Lahore Hub', updatedBy: 'Admin-001' },
          inTransit: { date: '2024-01-17', time: '12:00 PM', location: 'En Route', updatedBy: 'System' },
          outForDelivery: null,
          delivered: null
        },
        customerInfo: {
          shipperName: 'John Doe',
          shipperPhone: '03001234567',
          shipperAddress: '123 Main Street, Lahore',
          consigneeName: 'Jane Smith',
          consigneePhone: '03001234568',
          consigneeAddress: '456 Park Avenue, Karachi'
        },
        paymentType: 'COD',
        paymentAmount: 5000,
        estimatedDelivery: '2024-01-18',
        weight: '2.5 kg',
        pieces: 1,
        remarks: [
          { date: '2024-01-17', time: '12:00 PM', user: 'Admin-001', note: 'Shipment dispatched to transit hub' }
        ],
        linkedDocuments: [
          { type: 'Manifest', id: 'MNF-2024-001', date: '2024-01-17' },
          { type: 'Delivery Sheet', id: 'DS-2024-001', date: '2024-01-18' }
        ]
      }
      
      setTrackingData(mockData)
    } catch (error) {
      console.error('Error tracking shipment:', error)
      setError('Failed to track shipment. Please check CN number and try again.')
      setTrackingData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (stepKey) => {
    if (!newStatus) {
      setError('Please select a status')
      return
    }

    try {
      // TODO: API call to update status
      // const response = await fetch(`/api/admin/shipments/${trackingData.cnNumber}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus, stepKey })
      // })
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Update local state
      setTrackingData(prev => ({
        ...prev,
        currentStatus: newStatus,
        timeline: {
          ...prev.timeline,
          [stepKey]: {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            location: 'Updated by Admin',
            updatedBy: 'Admin-001'
          }
        }
      }))
      
      setEditingStatus(null)
      setNewStatus('')
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update status')
    }
  }

  const handleAddRemarks = async () => {
    if (!remarks.trim()) {
      setError('Please enter remarks')
      return
    }

    try {
      // TODO: API call to add remarks
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newRemark = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        user: 'Admin-001',
        note: remarks
      }
      
      setTrackingData(prev => ({
        ...prev,
        remarks: [...(prev.remarks || []), newRemark]
      }))
      
      setRemarks('')
      setShowRemarksModal(false)
    } catch (error) {
      console.error('Error adding remarks:', error)
      setError('Failed to add remarks')
    }
  }

  const getCurrentStepIndex = () => {
    if (!trackingData) return -1
    const currentStatus = trackingData.currentStatus
    const statusMap = {
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
        <div className="flex items-center gap-4 mb-4">
          <img src="/nps-logo.png" alt="NPS Logo" className="h-12 w-auto" />
        </div>
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
              <button
                onClick={() => setShowRemarksModal(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Add Remarks
              </button>
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
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all relative ${
                          isCompleted
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
                          {editingStatus === step.key && (
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
                          {editingStatus === step.key ? (
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
                          )}
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
                      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-4 -translate-x-1/2 transition-all ${
                        isCompleted
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
                        {editingStatus === step.key && (
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
                        {editingStatus !== step.key && index <= getCurrentStepIndex() && (
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

