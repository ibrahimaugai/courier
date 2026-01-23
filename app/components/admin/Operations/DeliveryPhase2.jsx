'use client'

import { useState } from 'react'
import { Search, Package, Loader2, CheckCircle, X, ArrowLeft, Truck, User, Phone, MapPin, Calendar } from 'lucide-react'
import { api } from '../../../lib/api'

export default function DeliveryPhase2({ setActivePage }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sheetNumber, setSheetNumber] = useState('')
  const [sheetData, setSheetData] = useState(null)
  const [shipmentStatuses, setShipmentStatuses] = useState({})

  const handleSearchSheet = async () => {
    if (!sheetNumber.trim()) {
      setError('Please enter a delivery sheet number')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const result = await api.getDeliverySheetForPhase2(sheetNumber.trim())
      const data = result?.data || result
      setSheetData(data)

      // Initialize shipment statuses
      const initialStatuses = {}
      data.bookings?.forEach(booking => {
        const shipment = data.deliverySheetShipments?.find(s => s.bookingId === booking.id)
        initialStatuses[booking.id] = {
          shipmentId: shipment?.id,
          status: shipment?.deliveryStatus || 'PENDING',
          remarks: shipment?.deliveryRemarks || '',
          collectedAmount: booking.codAmount || 0
        }
      })
      setShipmentStatuses(initialStatuses)
    } catch (err) {
      console.error('Error fetching sheet:', err)
      setError(err.message || 'Failed to load delivery sheet')
      setSheetData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (bookingId, status) => {
    const shipmentData = shipmentStatuses[bookingId]

    // If no shipmentId exists, we need to create the shipment first
    if (!shipmentData?.shipmentId) {
      setError('Cannot update status: Shipment record not found. Please contact support.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await api.updateDeliveryShipmentStatus(
        sheetData.id,
        shipmentData.shipmentId,
        {
          deliveryStatus: status,
          deliveryRemarks: shipmentData.remarks
        }
      )

      // Update local state
      setShipmentStatuses(prev => ({
        ...prev,
        [bookingId]: { ...prev[bookingId], status }
      }))

      setSuccess(`Status updated to ${status}`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err.message || 'Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemarksChange = (bookingId, remarks) => {
    setShipmentStatuses(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], remarks }
    }))
  }

  const handleSaveRemarks = async (bookingId) => {
    const shipmentData = shipmentStatuses[bookingId]
    if (!shipmentData?.shipmentId) return

    try {
      await api.updateDeliveryShipmentStatus(
        sheetData.id,
        shipmentData.shipmentId,
        {
          deliveryStatus: shipmentData.status,
          deliveryRemarks: shipmentData.remarks
        }
      )
      setSuccess('Remarks saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.message || 'Failed to save remarks')
    }
  }

  const handleCloseSheet = async () => {
    if (!sheetData) return

    setIsLoading(true)
    setError('')
    try {
      await api.closeDeliverySheet(sheetData.id)
      setSuccess('Delivery Sheet Closed Successfully!')
      setTimeout(() => {
        if (setActivePage) setActivePage('Delivery Phase 1')
      }, 1500)
    } catch (err) {
      console.error('Error closing sheet:', err)
      setError(err.message || 'Failed to close delivery sheet')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'RETURNED':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'REFUSED':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const totalCollected = sheetData?.bookings?.reduce((sum, booking) => {
    const status = shipmentStatuses[booking.id]?.status
    if (status === 'DELIVERED' && booking.codAmount) {
      return sum + Number(booking.codAmount)
    }
    return sum
  }, 0) || 0

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">

          <div className="h-8 w-[2px] bg-gray-200"></div>
          <div>
            <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
            <h1 className="text-2xl font-black text-gray-900">Delivery Phase 2</h1>
          </div>
        </div>
        <button
          onClick={() => setActivePage('Delivery Phase 1')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-sky-600 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO HISTORY
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-8 border border-gray-100 mb-8">
        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-600" />
          SEARCH DELIVERY SHEET
        </h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={sheetNumber}
              onChange={(e) => setSheetNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSheet()}
              placeholder="Enter Delivery Sheet Number (e.g., DS-20260112-0001)"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
          <button
            onClick={handleSearchSheet}
            disabled={isLoading}
            className="px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            SEARCH
          </button>
        </div>
      </div>

      {/* Sheet Details */}
      {sheetData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-6 rounded-xl border border-sky-100">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sheet Number</p>
              </div>
              <p className="text-xl font-black text-sky-700">{sheetData.sheetNumber}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-purple-600" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Rider</p>
              </div>
              <p className="text-xl font-black text-purple-700">{sheetData.riderName || 'N/A'}</p>
              <p className="text-sm text-purple-600 font-bold">{sheetData.riderMobile || ''}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total CNs</p>
              </div>
              <p className="text-xl font-black text-emerald-700">{sheetData.totalCns}</p>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">DELIVERY STATUS</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Mark delivery status for each shipment</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Collected</p>
                <p className="text-2xl font-black text-emerald-600">Rs. {totalCollected.toFixed(2)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">SR</th>
                    <th className="px-6 py-4">CN NUMBER</th>
                    <th className="px-6 py-4">CONSIGNEE</th>
                    <th className="px-6 py-4">PHONE</th>
                    <th className="px-6 py-4">ADDRESS</th>
                    <th className="px-6 py-4 text-center">WGT</th>
                    <th className="px-6 py-4 text-center">COD</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">REMARKS</th>
                    <th className="px-6 py-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sheetData.bookings?.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-24 px-10 text-center">
                        <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No shipments</p>
                      </td>
                    </tr>
                  ) : (
                    sheetData.bookings?.map((booking, idx) => {
                      const shipmentStatus = shipmentStatuses[booking.id] || {}
                      return (
                        <tr key={booking.id} className="hover:bg-sky-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-black text-gray-400">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-sky-700">{booking.cnNumber}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{booking.consigneeName}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-600">{booking.consigneePhone}</td>
                          <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">{booking.consigneeAddress}</td>
                          <td className="px-6 py-4 text-center text-xs font-bold text-gray-600">{booking.weight} KG</td>
                          <td className="px-6 py-4 text-center text-xs font-bold text-emerald-600">{booking.codAmount || 0}</td>
                          <td className="px-6 py-4">
                            <select
                              value={shipmentStatus.status || 'PENDING'}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 outline-none ${getStatusColor(shipmentStatus.status)}`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="RETURNED">Returned</option>
                              <option value="REFUSED">Refused</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={shipmentStatus.remarks || ''}
                              onChange={(e) => handleRemarksChange(booking.id, e.target.value)}
                              placeholder="Add remarks..."
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            {shipmentStatus.status === 'DELIVERED' && (
                              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close Sheet Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCloseSheet}
              disabled={isLoading}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'CLOSING...' : 'CLOSE DELIVERY SHEET'}
            </button>
          </div>
        </>
      )}

      {/* Alerts */}
      {(error || success) && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${error ? 'bg-white text-red-600 border-red-100' : 'bg-white text-emerald-600 border-emerald-100'}`}>
          <div className={`p-2 rounded-full ${error ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {error ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
          <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
        </div>
      )}
    </div>
  )
}
