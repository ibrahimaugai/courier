'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Package,
  Truck,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { fetchBookings, cancelBooking, clearBookingsError } from '../../lib/store'

export default function MyShipments({ setActivePage, setSelectedShipment }) {
  const dispatch = useDispatch()
  const { bookings, isLoading, error } = useSelector((state) => state.bookings)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showActionsMenu, setShowActionsMenu] = useState(null)
  const [cancelConfirm, setCancelConfirm] = useState(null)

  // Fetch bookings on mount - only if authenticated
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      dispatch(fetchBookings({ page: 1, limit: 100 }))
    }
  }, [dispatch])

  // Map backend status to frontend status
  const mapBookingStatus = (status) => {
    const statusMap = {
      'PENDING': 'Pending Approval',
      'BOOKED': 'Booked',
      'PICKUP_REQUESTED': 'Pickup Requested',
      'AT_HUB': 'At Hub',
      'IN_TRANSIT': 'In Transit',
      'AT_DEPOT': 'In Transit',
      'OUT_FOR_DELIVERY': 'In Transit',
      'DELIVERED': 'Delivered',
      'RETURNED': 'Cancelled',
      'VOIDED': 'Cancelled'
    }
    return statusMap[status] || status
  }

  // Transform bookings to shipments format
  const safeBookings = Array.isArray(bookings) ? bookings : []
  const shipments = safeBookings.map(booking => ({
    id: booking.id,
    cn: booking.cnNumber,
    bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
    origin: booking.originCity?.cityName || '',
    destination: booking.destinationCity?.cityName || '',
    service: booking.service?.serviceName || '',
    weight: booking.weight?.toString() || '0',
    payMode: booking.paymentMode || '',
    status: mapBookingStatus(booking.status),
    consigneeName: booking.consigneeName || '',
    consigneePhone: booking.consigneePhone || '',
    shipperName: booking.customer?.name || '',
    shipperPhone: booking.customer?.phone || '',
    pieces: booking.pieces || 0,
    totalCharges: booking.totalAmount ? parseFloat(booking.totalAmount) : 0,
    originalBooking: booking // Keep original for editing
  }))

  // Calculate summary stats
  const totalShipments = shipments.length
  const pendingPickup = shipments.filter(s => s.status === 'Booked' || s.status === 'Pickup Requested' || s.status === 'Pending Approval').length
  const inTransit = shipments.filter(s => s.status === 'In Transit').length
  const delivered = shipments.filter(s => s.status === 'Delivered').length

  // Filter shipments
  const filteredShipments = shipments.filter(shipment => {
    const cn = shipment.cn || ''
    const matchesSearch = cn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.consigneeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending Approval': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      'Booked': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      'Pickup Requested': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'At Hub': { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: Package },
      'In Transit': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig['Booked']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    )
  }

  const handleView = (shipment) => {
    setSelectedShipment?.(shipment.originalBooking || shipment)
    setActivePage?.('Edit Booking')
  }

  const handleEdit = (shipment) => {
    if (shipment.status === 'Pending Approval') {
      setSelectedShipment?.(shipment.originalBooking || shipment)
      setActivePage?.('Edit Booking')
    } else {
      alert('This shipment is already booked and cannot be edited. Please contact support for changes.')
    }
  }

  const handlePickupRequest = (shipment) => {
    setSelectedShipment?.(shipment.originalBooking || shipment)
    setActivePage?.('Pickup Request')
  }

  const handleTrack = (shipment) => {
    setSelectedShipment?.(shipment.originalBooking || shipment)
    setActivePage?.('Track Shipment')
  }

  const handleCancel = async (shipment) => {
    if (!window.confirm(`Are you sure you want to cancel shipment ${shipment.cn}? This action cannot be undone.`)) {
      return
    }

    try {
      dispatch(clearBookingsError())
      const result = await dispatch(cancelBooking(shipment.id))

      if (cancelBooking.fulfilled.match(result)) {
        // Refresh bookings list
        dispatch(fetchBookings({ page: 1, limit: 100 }))
      } else {
        alert(result.payload || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert(error.message || 'Failed to cancel booking')
    }
  }

  return (
    <div className="max-w-7xl w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          My Shipments
        </h1>
        <p className="text-sm text-gray-600">All your booked shipments in one place</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && safeBookings.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Package className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Shipments</p>
          <p className="text-2xl font-bold text-gray-900">{totalShipments}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pending Pickup</p>
          <p className="text-2xl font-bold text-gray-900">{pendingPickup}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">In Transit</p>
          <p className="text-2xl font-bold text-gray-900">{inTransit}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivered</p>
          <p className="text-2xl font-bold text-gray-900">{delivered}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by CN Number
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter CN number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Booked">Booked</option>
                <option value="Pickup Requested">Pickup Requested</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">CN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Booking Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Origin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Weight</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Pay Mode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!isLoading && filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No shipments found
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{shipment.cn || 'TBD'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                      {new Date(shipment.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {shipment.origin}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {shipment.destination}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {shipment.service}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {shipment.weight} kg
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {shipment.payMode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(shipment.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Mobile: Dropdown menu */}
                        <div className="relative sm:hidden">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === shipment.id ? null : shipment.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          {showActionsMenu === shipment.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => {
                                  handleView(shipment)
                                  setShowActionsMenu(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              {shipment.status === 'Pending Approval' && (
                                <button
                                  onClick={() => {
                                    handleEdit(shipment)
                                    setShowActionsMenu(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handlePickupRequest(shipment)
                                  setShowActionsMenu(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Truck className="w-4 h-4" />
                                Pickup Request
                              </button>
                              <button
                                onClick={() => {
                                  handleTrack(shipment)
                                  setShowActionsMenu(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Search className="w-4 h-4" />
                                Track
                              </button>
                              {shipment.status === 'Pending Approval' && (
                                <button
                                  onClick={() => {
                                    handleCancel(shipment)
                                    setShowActionsMenu(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Cancel
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop: Icon buttons */}
                        <div className="hidden sm:flex items-center gap-1">
                          <button
                            onClick={() => handleView(shipment)}
                            className="p-1.5 hover:bg-sky-100 rounded-md transition-colors text-sky-600"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {shipment.status === 'Pending Approval' && (
                            <button
                              onClick={() => handleEdit(shipment)}
                              className="p-1.5 hover:bg-yellow-100 rounded-md transition-colors text-yellow-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleTrack(shipment)}
                            className="p-1.5 hover:bg-purple-100 rounded-md transition-colors text-purple-600"
                            title="Track"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          {shipment.status === 'Pending Approval' && (
                            <button
                              onClick={() => handleCancel(shipment)}
                              className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-red-600"
                              title="Cancel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info message for mobile users */}
      <div className="mt-4 sm:hidden text-xs text-gray-500 text-center">
        <p>Scroll horizontally to see all columns</p>
      </div>
    </div>
  )
}

