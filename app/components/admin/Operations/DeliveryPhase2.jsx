'use client'

import { useState } from 'react'
import { Search, Package, Loader2, CheckCircle, X, ArrowLeft, Truck, User, Phone, MapPin, Calendar, Printer, Save } from 'lucide-react'
import { api } from '../../../lib/api'
import { printDeliverySheetPhase2Report } from '../../../lib/deliverySheetPrint'

export default function DeliveryPhase2({ setActivePage }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sheetNumber, setSheetNumber] = useState('')
  const [sheetData, setSheetData] = useState(null)
  const [shipmentStatuses, setShipmentStatuses] = useState({})
  const [savingBookingId, setSavingBookingId] = useState(null)

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

      // Initialize shipment statuses and receiver details
      const initialStatuses = {}
      data.bookings?.forEach(booking => {
        const shipment = data.deliverySheetShipments?.find(s => s.bookingId === booking.id)
        initialStatuses[booking.id] = {
          shipmentId: shipment?.id,
          status: shipment?.deliveryStatusText ?? shipment?.deliveryStatus ?? 'PENDING',
          remarks: shipment?.deliveryRemarks || '',
          collectedAmount: booking.codAmount || 0,
          receiverName: shipment?.receiverName ?? '',
          receiverCnic: shipment?.receiverCnic ?? '',
          receiverPhone: shipment?.receiverPhone ?? ''
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

  const saveRow = async (bookingId) => {
    const shipmentData = shipmentStatuses[bookingId]
    if (!shipmentData?.shipmentId || !sheetData) return
    setSavingBookingId(bookingId)
    setError('')
    try {
      await api.updateDeliveryShipmentStatus(
        sheetData.id,
        shipmentData.shipmentId,
        {
          deliveryStatusText: (shipmentData.status || '').trim() || undefined,
          deliveryRemarks: shipmentData.remarks,
          receiverName: shipmentData.receiverName || undefined,
          receiverCnic: shipmentData.receiverCnic || undefined,
          receiverPhone: shipmentData.receiverPhone || undefined
        }
      )
      setSuccess('Saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error saving:', err)
      setError(err.message || 'Failed to save')
    } finally {
      setSavingBookingId(null)
    }
  }

  const saveShipmentReceiver = async (bookingId) => {
    await saveRow(bookingId)
  }

  const handleStatusChange = (bookingId, value) => {
    setShipmentStatuses(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], status: value }
    }))
  }

  const handleStatusBlur = async (bookingId) => {
    await saveRow(bookingId)
  }

  const handleRemarksChange = (bookingId, remarks) => {
    setShipmentStatuses(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], remarks }
    }))
  }

  const handleReceiverChange = (bookingId, field, value) => {
    setShipmentStatuses(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value }
    }))
  }

  const handleReceiverBlur = (bookingId) => {
    saveShipmentReceiver(bookingId)
  }

  const handlePrintSheet = () => {
    const mergedShipments = (sheetData.deliverySheetShipments || []).map(s => ({
      ...s,
      deliveryStatus: shipmentStatuses[s.bookingId]?.status ?? s.deliveryStatus,
      receiverName: shipmentStatuses[s.bookingId]?.receiverName ?? s.receiverName ?? '',
      receiverCnic: shipmentStatuses[s.bookingId]?.receiverCnic ?? s.receiverCnic ?? '',
      receiverPhone: shipmentStatuses[s.bookingId]?.receiverPhone ?? s.receiverPhone ?? ''
    }))
    const printed = printDeliverySheetPhase2Report(
      { ...sheetData, deliverySheetShipments: mergedShipments },
      {}
    )
    if (!printed) setError('Allow popups to print the sheet.')
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

  const totalCollected = sheetData?.bookings?.reduce((sum, booking) => {
    const status = (shipmentStatuses[booking.id]?.status || '').toUpperCase()
    if (status.includes('DELIVERED') && booking.codAmount) {
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

            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left" style={{ minWidth: '1280px' }}>
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
                    <th className="px-6 py-4">RECEIVER NAME</th>
                    <th className="px-6 py-4">RECEIVER CNIC</th>
                    <th className="px-6 py-4">RECEIVER PHONE</th>
                    <th className="px-6 py-4">REMARKS</th>
                    <th className="px-6 py-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sheetData.bookings?.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="py-24 px-10 text-center">
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
                            <input
                              type="text"
                              value={shipmentStatus.status || ''}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              onBlur={() => handleStatusBlur(booking.id)}
                              placeholder="Enter status (e.g. Delivered, Returned)"
                              className="w-full min-w-[120px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={shipmentStatus.receiverName || ''}
                              onChange={(e) => handleReceiverChange(booking.id, 'receiverName', e.target.value)}
                              onBlur={() => handleReceiverBlur(booking.id)}
                              placeholder="Receiver name"
                              className="w-full min-w-[100px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={shipmentStatus.receiverCnic || ''}
                              onChange={(e) => handleReceiverChange(booking.id, 'receiverCnic', e.target.value)}
                              onBlur={() => handleReceiverBlur(booking.id)}
                              placeholder="Receiver CNIC"
                              className="w-full min-w-[100px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={shipmentStatus.receiverPhone || ''}
                              onChange={(e) => handleReceiverChange(booking.id, 'receiverPhone', e.target.value)}
                              onBlur={() => handleReceiverBlur(booking.id)}
                              placeholder="Receiver phone"
                              className="w-full min-w-[90px] px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={shipmentStatus.remarks || ''}
                              onChange={(e) => handleRemarksChange(booking.id, e.target.value)}
                              placeholder="Remarks..."
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => saveRow(booking.id)}
                                disabled={!shipmentStatus.shipmentId || savingBookingId === booking.id}
                                title="Save row"
                                className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {savingBookingId === booking.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </button>
                              {(shipmentStatus.status || '').toUpperCase().includes('DELIVERED') && (
                                <CheckCircle className="w-5 h-5 text-emerald-600" title="Delivered" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Print Sheet & Close Sheet Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handlePrintSheet}
              className="px-8 py-4 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              PRINT SHEET
            </button>
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
