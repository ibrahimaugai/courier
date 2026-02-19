'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../lib/api'
import { printShiftCloseReport } from '../../lib/shiftcloseprint'
import { Printer, Loader2, CheckCircle, AlertCircle, Package } from 'lucide-react'

export default function UserShiftClose() {
  const user = useSelector((state) => state.auth?.user)
  const [activeBatch, setActiveBatch] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchActiveBatch = useCallback(async () => {
    try {
      const result = await api.getLatestBatch()
      const batch = result?.data ?? result
      setActiveBatch(batch || null)
      return batch
    } catch (err) {
      console.error('UserShiftClose: Error fetching active batch', err)
      setActiveBatch(null)
      return null
    }
  }, [])

  const fetchBookings = useCallback(async (batchId) => {
    if (!batchId) {
      setBookings([])
      return
    }
    try {
      const result = await api.getConsignments({ batchId })
      const data = result?.data ?? result ?? []
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('UserShiftClose: Error fetching bookings', err)
      setBookings([])
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      setError('')
      setSuccess('')
      try {
        const batch = await fetchActiveBatch()
        if (mounted && batch?.id) {
          setSuccess(`Active batch ${batch.batchCode} loaded.`)
        } else if (mounted) {
          setBookings([])
          setSuccess('No active batch. A new batch will be created on your next booking.')
        }
      } catch (e) {
        if (mounted) setError('Failed to load batch.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [fetchActiveBatch])

  useEffect(() => {
    if (activeBatch?.id) {
      fetchBookings(activeBatch.id)
    } else {
      setBookings([])
    }
  }, [activeBatch?.id, fetchBookings])

  const handlePrintAndShiftClose = async () => {
    if (!activeBatch?.id) return
    if (bookings.length === 0) {
      setError('No bookings to print.')
      return
    }
    if (!window.confirm(`Print and close batch ${activeBatch.batchCode}? A new batch will be created automatically.`)) return

    const printed = printShiftCloseReport(bookings, {
      batchCode: activeBatch.batchCode,
      copyType: 'CUSTOMER COPY',
      preparedBy: displayName
    })
    if (!printed) {
      setError('Popup blocked. Please allow popups to print.')
      return
    }
    setIsClosing(true)
    setError('')
    setSuccess('')
    try {
      await api.updateBatchStatus(activeBatch.id, 'CLOSED')
      await api.createBatchForUser()
      const fresh = await fetchActiveBatch()
      const newBatch = fresh ?? null
      setActiveBatch(newBatch)
      setBookings([])
      setSuccess(`Shift closed. New batch ${newBatch?.batchCode ?? ''} created.`)
      if (newBatch?.id) {
        await fetchBookings(newBatch.id)
      }
    } catch (err) {
      console.error('UserShiftClose: Shift close error', err)
      setError(err?.message || 'Failed to close shift.')
    } finally {
      setIsClosing(false)
    }
  }

  const displayName = user?.username ?? 'User'

  return (
    <>
      <div className="max-w-7xl print:hidden">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shift Close</h1>
          <p className="text-sm text-gray-500 mt-1">View and print your active batch, then close to start a new one.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-600" />
            Your Active Batch
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-sky-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Loading...</span>
            </div>
          ) : activeBatch ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-sky-50 border border-sky-200 rounded-lg px-6 py-4">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Active Batch</p>
                  <p className="text-2xl font-black text-sky-900 tracking-tight">{activeBatch.batchCode}</p>
                </div>
                <button
                  onClick={handlePrintAndShiftClose}
                  disabled={bookings.length === 0 || isClosing}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                  Print & Close Batch
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {bookings.length} booking(s) in this batch. Click &quot;Print & Close Batch&quot; to print the summary and create a new batch.
              </p>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No active batch.</p>
              <p className="text-sm mt-1">A new batch will be created when you make your next booking.</p>
            </div>
          )}
        </div>

        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {error ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="font-medium text-sm">{error || success}</p>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Consignments in Batch</h2>
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">TOTAL: {bookings.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-3">CN Number</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Shipper</th>
                    <th className="px-4 py-3">Consignee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-center">Pcs / Wt</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => {
                    const originName = b.originCity?.cityName || b.originCity?.name || b.originCityId || '—'
                    const destName = b.destinationCity?.cityName || b.destinationCity?.name || b.destinationCityId || '—'
                    const payMode = b.paymentMode || b.payMode || '—'
                    const status = b.status || '—'
                    const w = b.weight != null ? (typeof b.weight === 'object' && b.weight !== null && typeof b.weight.toString === 'function' ? parseFloat(b.weight.toString()) : parseFloat(b.weight)) : 0
                    const isVoided = String(status).toUpperCase() === 'VOIDED'
                    return (
                      <tr key={b.id} className={`hover:bg-sky-50/50 ${isVoided ? 'bg-red-50/50' : ''}`}>
                        <td className="px-4 py-3 font-black text-sky-700">{b.cnNumber}</td>
                        <td className="px-4 py-3 text-[11px] font-bold uppercase">{originName}</td>
                        <td className="px-4 py-3 text-[11px] font-bold uppercase">{destName}</td>
                        <td className="px-4 py-3">
                          <div><span className="font-bold">{b.shipperName || '—'}</span></div>
                          <div className="text-[10px] text-gray-500">{b.shipperPhone || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div><span className="font-bold">{b.consigneeName || '—'}</span></div>
                          <div className="text-[10px] text-gray-500">{b.consigneePhone || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase ${isVoided ? 'text-red-700' : 'text-emerald-700'}`}>{status}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold uppercase">{String(payMode).toLowerCase()}</td>
                        <td className="px-4 py-3 text-center text-sm">{b.pieces ?? '—'} / {Number.isFinite(w) ? w : (b.weight ?? '—')}</td>
                        <td className="px-4 py-3 text-right font-black">{b.totalAmount != null ? Number(b.totalAmount).toLocaleString() : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
