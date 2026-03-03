'use client'

import { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Calendar, Search, User, MapPin, Phone, CheckCircle,
  XCircle, Eye, Loader2, Copy, Printer,
  AlertCircle, RefreshCw, Truck, Clock, ChevronDown, ChevronRight, Package,
  Layers, Box
} from 'lucide-react'
import { fetchAllPickups, updatePickupStatus, assignRiderToBatch, clearPickupsError, clearPickupsSuccess } from '../../../lib/store'
import { api } from '../../../lib/api'
import { printPickupSheet, printPickupBatchSheet } from '../../../lib/pickupSheetPrint'
import Toast from '../../Toast'

export default function PickupManagement() {
  const dispatch = useDispatch()
  const { pickups, isLoading, error, success } = useSelector((state) => state.pickups)

  const today = new Date().toISOString().split('T')[0]
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    status: '',
    searchTerm: '',
    cityId: ''
  })

  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [assignModal, setAssignModal] = useState({ isOpen: false, batch: null })
  const [statusModal, setStatusModal] = useState({ isOpen: false, pickup: null, newStatus: '' })
  const [detailModal, setDetailModal] = useState({ isOpen: false, pickup: null })
  const [riderName, setRiderName] = useState('')
  const [riderPhone, setRiderPhone] = useState('')
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const [expandedBatches, setExpandedBatches] = useState(new Set())

  useEffect(() => {
    loadPickups()
  }, [])

  const loadPickups = () => {
    dispatch(fetchAllPickups(filters))
  }


  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    loadPickups()
  }

  const handleAssignRiderToBatch = (batch) => {
    const firstWithRider = batch.pickups.find(p => p.riderName || p.assignedRider?.name)
    setAssignModal({ isOpen: true, batch })
    setRiderName(firstWithRider ? (firstWithRider.riderName || firstWithRider.assignedRider?.name || '') : '')
    setRiderPhone(firstWithRider ? (firstWithRider.riderPhone || firstWithRider.assignedRider?.phone || '') : '')
  }

  const handleConfirmAssign = async () => {
    if (!riderName || !riderName.trim()) {
      setToast({ isVisible: true, message: 'Please enter rider name', type: 'error' })
      return
    }
    if (!riderPhone || !riderPhone.trim()) {
      setToast({ isVisible: true, message: 'Please enter rider phone number', type: 'error' })
      return
    }
    if (!assignModal.batch?.pickups?.length) return

    const result = await dispatch(assignRiderToBatch({
      pickupIds: assignModal.batch.pickups.map(p => p.id),
      riderName: riderName.trim(),
      riderPhone: riderPhone.trim()
    }))

    if (assignRiderToBatch.fulfilled.match(result)) {
      setToast({ isVisible: true, message: `Rider assigned to all ${assignModal.batch.pickups.length} pickup(s) in batch!`, type: 'success' })
      setAssignModal({ isOpen: false, batch: null })
      setRiderName('')
      setRiderPhone('')
      loadPickups()
    }
  }

  const batchNeedsRider = (batch) => batch.pickups.some(p => !p.riderName && !p.assignedRider?.name)

  const handleUpdateStatus = (pickup, newStatus) => {
    setStatusModal({ isOpen: true, pickup, newStatus })
  }

  const handlePrintPickup = async (pickup) => {
    const b = pickup.booking || {}
    let bookingDetail = null
    if (b.cnNumber) {
      try {
        const res = await api.trackBooking(b.cnNumber)
        bookingDetail = res?.data || res
      } catch (_) {}
    }
    const ok = printPickupSheet(pickup, bookingDetail)
    if (!ok) {
      setToast({ isVisible: true, message: 'Allow popups to print', type: 'error' })
      return
    }
    setToast({ isVisible: true, message: 'Print dialog opened', type: 'success' })
  }

  const handlePrintBatch = async (batch) => {
    if (!batch?.pickups?.length) return
    const bookingDetailsByCn = {}
    for (const pickup of batch.pickups) {
      const cn = pickup?.booking?.cnNumber
      if (cn) {
        try {
          const res = await api.trackBooking(cn)
          const detail = res?.data || res
          if (detail) bookingDetailsByCn[cn] = detail
        } catch (_) {}
      }
    }
    const ok = printPickupBatchSheet(batch.label, batch.pickups, bookingDetailsByCn)
    if (!ok) {
      setToast({ isVisible: true, message: 'Allow popups to print', type: 'error' })
      return
    }
    setToast({ isVisible: true, message: `Print opened: ${batch.pickups.length} booking(s) with details`, type: 'success' })
  }

  const handleConfirmStatusUpdate = async () => {
    const result = await dispatch(updatePickupStatus({
      id: statusModal.pickup.id,
      status: statusModal.newStatus
    }))

    if (updatePickupStatus.fulfilled.match(result)) {
      setToast({ isVisible: true, message: `Status updated to ${statusModal.newStatus}`, type: 'success' })
      setStatusModal({ isOpen: false, pickup: null, newStatus: '' })
      loadPickups()
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'REQUESTED': 'bg-amber-100 text-amber-800 border-amber-200',
      'ASSIGNED': 'bg-blue-100 text-blue-800 border-blue-200',
      'PICKED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'CANCELLED': 'bg-rose-100 text-rose-800 border-rose-200'
    }
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  const formatCurrency = (val) => {
    if (val == null || val === '') return '—'
    const n = Number(val)
    if (Number.isNaN(n)) return '—'
    return `PKR ${n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }

  /** Shipper = who the shipment is from (booking). Pickup = who to contact / where to go (pickup request). */
  const getShipperDisplay = (pickup) => {
    const b = pickup?.booking
    return {
      name: b?.shipperName || b?.customer?.name || '—',
      phone: b?.shipperPhone ?? b?.customer?.phone ?? '—',
      address: b?.shipperAddress ?? b?.customer?.address ?? '—',
      city: b?.originCity?.cityName || '—'
    }
  }
  const getPickupContactDisplay = (pickup) => {
    return {
      name: pickup?.contactName || '—',
      phone: pickup?.contactPhone ?? '—',
      address: pickup?.pickupAddress || '—',
      city: pickup?.booking?.originCity?.cityName || '—'
    }
  }

  const safePickups = Array.isArray(pickups) ? pickups : []
  const getBatchKey = (p) => (p?.booking?.batchId ?? p?.booking?.batch?.id ?? 'no-batch')
  const getBatchLabel = (p) => (p?.booking?.batch?.batchCode || 'No batch')
  const isBatchClosed = (p) => p?.booking?.batch?.status === 'CLOSED'
  const pickupsForList = safePickups.filter((p) => !isBatchClosed(p))
  const batchesMap = pickupsForList.reduce((acc, p) => {
    const key = getBatchKey(p)
    if (!acc[key]) acc[key] = { key, label: getBatchLabel(p), pickups: [] }
    acc[key].pickups.push(p)
    return acc
  }, {})
  const batches = Object.values(batchesMap).map(b => ({
    ...b,
    firstPickup: b.pickups[0],
    statusCounts: b.pickups.reduce((c, p) => { c[p.status] = (c[p.status] || 0) + 1; return c }, {})
  })).sort((a, b) => new Date(b.firstPickup?.pickupDate || 0) - new Date(a.firstPickup?.pickupDate || 0))

  const paginatedBatches = batches.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
  const totalBatches = batches.length

  const handleMarkBatchDone = async (batch) => {
    const batchId = batch.key
    if (!batchId || batchId === 'no-batch') return
    try {
      await api.updateBatchStatus(batchId, 'CLOSED')
      setToast({ isVisible: true, message: `Batch ${batch.label} marked as done and removed from list`, type: 'success' })
      loadPickups()
    } catch (err) {
      setToast({ isVisible: true, message: err?.message || 'Failed to mark batch as done', type: 'error' })
    }
  }

  const toggleBatch = (key) => {
    setExpandedBatches(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pickup Management</h1>
            <p className="text-slate-500 mt-1">Monitor and assign pickup requests across all stations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadPickups}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 active:scale-[0.98]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Content — Batch-first with expandable bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-10" />
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact &amp; Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Shipments</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
                        <p className="text-slate-500 font-medium">Fetching records...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBatches.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium text-lg">No pickup batches found</p>
                      <button onClick={() => { const t = new Date().toISOString().split('T')[0]; const cleared = { startDate: t, endDate: t, status: '', searchTerm: '', cityId: '' }; setFilters(cleared); dispatch(fetchAllPickups(cleared)); }} className="text-sky-600 text-sm font-semibold mt-2 hover:underline">Clear all filters</button>
                    </td>
                  </tr>
                ) : (
                  paginatedBatches.map((batch) => {
                    const isExpanded = expandedBatches.has(batch.key)
                    const first = batch.firstPickup
                    return (
                      <Fragment key={batch.key}>
                        <tr
                          key={batch.key}
                          className="bg-slate-50/30 hover:bg-slate-50 transition-colors border-b border-slate-100"
                        >
                          <td className="px-2 py-3">
                            <button
                              onClick={() => toggleBatch(batch.key)}
                              className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 transition-colors"
                              aria-label={isExpanded ? 'Collapse batch' : 'Expand batch'}
                            >
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900">{batch.label}</span>
                              <span className="text-xs text-slate-400 font-medium">({batch.pickups.length} pickup{batch.pickups.length !== 1 ? 's' : ''})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const p = batch.firstPickup
                              if (!p) return <span className="text-slate-400">—</span>
                              return (
                                <>
                                  <div className="text-sm font-bold text-slate-900">{p.contactName || '—'}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {p.contactPhone || '—'}
                                  </div>
                                  <div className="text-xs text-slate-600 max-w-[220px] truncate mt-1" title={p.pickupAddress}>{p.pickupAddress || '—'}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 bg-slate-100 inline-block px-1.5 rounded">
                                    {p?.booking?.originCity?.cityName || '—'}
                                  </div>
                                </>
                              )
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-800">
                              {first?.pickupDate ? new Date(first.pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                            </div>
                            <div className="text-xs text-sky-600 font-medium mt-0.5">{first?.pickupTime || 'Flexible'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                              <Package className="w-3.5 h-3.5" />
                              {batch.pickups.length}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(batch.statusCounts).map(([status, count]) => (
                                <span key={status} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(status)}`}>
                                  {count} {status}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {batchNeedsRider(batch) && (
                                <button
                                  onClick={() => handleAssignRiderToBatch(batch)}
                                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[11px] font-bold hover:bg-sky-700 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                  <User className="w-3 h-3" />
                                  Assign Rider
                                </button>
                              )}
                              <button
                                onClick={() => toggleBatch(batch.key)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-bold transition-colors"
                                title={isExpanded ? 'Collapse' : 'View bookings'}
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handlePrintBatch(batch)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold border border-slate-200 transition-colors"
                                title="Print pickup sheet(s)"
                              >
                                <Printer className="w-4 h-4" />
                                Print
                              </button>
                              {batch.key !== 'no-batch' && (
                                <button
                                  onClick={() => handleMarkBatchDone(batch)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-sm font-bold border border-emerald-200 transition-colors"
                                  title="Mark batch as done (removes from list)"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Done
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" className="p-0 align-top bg-slate-50/50">
                              <div className="px-4 pb-4 pt-1">
                                <table className="w-full text-left border-collapse rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200">
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">CN</th>
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shipper</th>
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service / Product</th>
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled</th>
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pricing</th>
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                      <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rider</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {batch.pickups.map((pickup) => {
                                      const b = pickup.booking
                                      const shipper = getShipperDisplay(pickup)
                                      const svc = b?.service
                                      const prod = b?.product
                                      return (
                                        <tr key={pickup.id} className="hover:bg-slate-50/80 transition-colors group">
                                          <td className="px-4 py-3">
                                            <span className="text-sm font-bold text-sky-600 flex items-center gap-1">
                                              {b?.cnNumber}
                                              <button onClick={() => navigator.clipboard.writeText(b?.cnNumber)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                                                <Copy className="w-3 h-3 text-slate-400 hover:text-sky-600" />
                                              </button>
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 min-w-[200px]">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Shipper</div>
                                            <div className="text-sm font-bold text-slate-900">{shipper.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Phone className="w-3 h-3 shrink-0" />{shipper.phone}</div>
                                            <div className="text-xs text-slate-600 truncate max-w-[220px]" title={shipper.address}>{shipper.address}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 bg-slate-100 inline-block px-1.5 rounded">{shipper.city || '—'}</div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-xs font-semibold text-slate-800">{svc?.serviceName || '—'}</div>
                                            <div className="text-[10px] text-slate-500">{prod?.productName || '—'}</div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-slate-800">
                                              {pickup.pickupDate ? new Date(pickup.pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                                            </div>
                                            <div className="text-xs text-sky-600 font-medium mt-0.5">{pickup.pickupTime || 'Flexible'}</div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-xs font-bold text-slate-800">{formatCurrency(b?.totalAmount)}</div>
                                            <div className="text-[10px] text-slate-500">{b?.paymentMode || '—'}</div>
                                            {b?.codAmount != null && Number(b.codAmount) > 0 && (
                                              <div className="text-[10px] text-amber-700 font-medium">COD {formatCurrency(b.codAmount)}</div>
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(pickup.status)}`}>
                                              {pickup.status}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            {pickup.riderName || pickup.assignedRider?.name ? (
                                              <div className="text-sm">
                                                <span className="font-bold text-slate-900">{pickup.riderName || pickup.assignedRider?.name}</span>
                                                <div className="text-xs text-slate-500 font-medium">{pickup.riderPhone || pickup.assignedRider?.phone || '—'}</div>
                                              </div>
                                            ) : (
                                              <span className="text-xs text-slate-400 italic">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination — by batch */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{paginatedBatches.length}</span> batch{paginatedBatches.length !== 1 ? 'es' : ''} (<span className="text-slate-900 font-bold">{pickupsForList.length}</span> pickup{pickupsForList.length !== 1 ? 's' : ''})
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Prev
              </button>
              <div className="flex items-center gap-1.5">
                {[...Array(Math.max(1, Math.ceil(totalBatches / entriesPerPage)))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage >= Math.ceil(totalBatches / entriesPerPage) || totalBatches === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Rider to Batch Modal */}
      {assignModal.isOpen && assignModal.batch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {
            setAssignModal({ isOpen: false, batch: null })
            setRiderName('')
            setRiderPhone('')
          }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-sky-600" />
                Assign Rider to Batch
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-bold">Batch: {assignModal.batch.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">This rider will be assigned to all {assignModal.batch.pickups.length} pickup(s) in this batch.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rider Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="Enter rider name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm font-medium"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && riderName.trim() && riderPhone.trim()) handleConfirmAssign()
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rider Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="e.g. 0300 1234567"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm font-medium"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && riderName.trim() && riderPhone.trim()) handleConfirmAssign()
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Phone number of the rider assigned to this pickup</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setAssignModal({ isOpen: false, batch: null })
                  setRiderName('')
                  setRiderPhone('')
                }}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!riderName?.trim() || !riderPhone?.trim() || isLoading}
                onClick={handleConfirmAssign}
                className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign Rider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setStatusModal({ isOpen: false, pickup: null, newStatus: '' })} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${statusModal.newStatus === 'PICKED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                {statusModal.newStatus === 'PICKED' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Are you sure?</h2>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                Update CN <span className="font-bold text-slate-900">{statusModal.pickup.booking?.cnNumber}</span> status to
                <span className={`mx-1 font-black ${statusModal.newStatus === 'PICKED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {statusModal.newStatus}
                </span>?
              </p>
            </div>
            <div className="p-6 bg-slate-50/50 flex gap-3">
              <button
                onClick={() => setStatusModal({ isOpen: false, pickup: null, newStatus: '' })}
                className="flex-1 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={isLoading}
                className={`flex-1 px-4 py-4 rounded-2xl text-white font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${statusModal.newStatus === 'PICKED' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-rose-600 shadow-rose-200'
                  }`}
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                Yes, Do it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Slideover-style Modal */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={() => setDetailModal({ isOpen: false, pickup: null })} />
          <div className="relative bg-white w-full max-w-lg h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pickup Summary</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded italic">CN: {detailModal.pickup.booking?.cnNumber}</span>
                </div>
              </div>
              <button onClick={() => setDetailModal({ isOpen: false, pickup: null })} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 group">
                <XCircle className="w-6 h-6 text-slate-300 group-hover:text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Status Section */}
              <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Current Status</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusColor(detailModal.pickup.status)}`}>
                  {detailModal.pickup.status}
                </span>
              </div>

              {/* Rider Section */}
              {(detailModal.pickup.riderName || detailModal.pickup.assignedRider) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Rider</h3>
                  <div className="flex items-center gap-4 p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                    <div className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-sky-100">
                      {(detailModal.pickup.riderName || detailModal.pickup.assignedRider?.name || '').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900">{detailModal.pickup.riderName || detailModal.pickup.assignedRider?.name}</div>
                      <div className="text-sm text-sky-600 font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {detailModal.pickup.riderPhone || detailModal.pickup.assignedRider?.phone || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Info */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pickup Date</span>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    {new Date(detailModal.pickup.pickupDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time Window</span>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {detailModal.pickup.pickupTime || 'Anytime'}
                  </div>
                </div>
              </div>

              {/* Shipper (from booking — who the shipment is from) */}
              {detailModal.pickup.booking && (detailModal.pickup.booking.shipperName || detailModal.pickup.booking.customer?.name) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shipper <span className="text-slate-400 font-normal normal-case">(who the shipment is from)</span></h3>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                        <User className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">
                          {detailModal.pickup.booking.shipperName || detailModal.pickup.booking.customer?.name}
                          {detailModal.pickup.booking.shipperCompanyName && (
                            <span className="block text-sm font-medium text-slate-500">{detailModal.pickup.booking.shipperCompanyName}</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {detailModal.pickup.booking.shipperPhone || detailModal.pickup.booking.customer?.phone || '—'}
                        </div>
                        {(detailModal.pickup.booking.shipperEmail || detailModal.pickup.booking.customer?.email) && (
                          <div className="text-xs text-slate-500 mt-0.5">{detailModal.pickup.booking.shipperEmail || detailModal.pickup.booking.customer?.email}</div>
                        )}
                      </div>
                    </div>
                    {(detailModal.pickup.booking.shipperAddress || detailModal.pickup.booking.customer?.address) && (
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                          <MapPin className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1 text-sm text-slate-700 font-medium leading-relaxed">
                          {detailModal.pickup.booking.shipperAddress || detailModal.pickup.booking.customer?.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pickup Contact & Address (where to collect) */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pickup Contact &amp; Address <span className="text-slate-400 font-normal normal-case">(who to contact and where to collect)</span></h3>
                <div className="bg-sky-50/50 border border-sky-100 p-6 rounded-2xl space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-sky-100">
                      <User className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{detailModal.pickup.contactName || '—'}</div>
                      <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {detailModal.pickup.contactPhone || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-sky-100">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700 font-bold leading-relaxed">{detailModal.pickup.pickupAddress || '—'}</div>
                      <div className="text-xs text-slate-400 mt-1 uppercase font-black">{detailModal.pickup.booking?.originCity?.cityName || 'Unknown Origin'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service & Product */}
              {(detailModal.pickup.booking?.service || detailModal.pickup.booking?.product) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service &amp; Product</h3>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-wrap gap-6">
                    {detailModal.pickup.booking.service && (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                          <Layers className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase">Service</div>
                          <div className="font-bold text-slate-900">{detailModal.pickup.booking.service.serviceName}</div>
                          <div className="text-xs text-slate-500">{detailModal.pickup.booking.service.serviceType} {detailModal.pickup.booking.service.serviceCode && ` · ${detailModal.pickup.booking.service.serviceCode}`}</div>
                        </div>
                      </div>
                    )}
                    {detailModal.pickup.booking.product && (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                          <Box className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase">Product</div>
                          <div className="font-bold text-slate-900">{detailModal.pickup.booking.product.productName}</div>
                          {detailModal.pickup.booking.product.productCode && (
                            <div className="text-xs text-slate-500">{detailModal.pickup.booking.product.productCode}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing & Shipment */}
              {detailModal.pickup.booking && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pricing &amp; Shipment</h3>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400 font-medium block text-xs">Weight / Pieces</span>
                        <span className="font-bold text-slate-900">
                          {detailModal.pickup.booking.weight != null ? `${Number(detailModal.pickup.booking.weight)} kg` : '—'}
                          {detailModal.pickup.booking.pieces != null && ` · ${detailModal.pickup.booking.pieces} pcs`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block text-xs">Payment mode</span>
                        <span className="font-bold text-slate-900">{detailModal.pickup.booking.paymentMode || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block text-xs">Rate</span>
                        <span className="font-bold text-slate-900">{formatCurrency(detailModal.pickup.booking.rate)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block text-xs">Total amount</span>
                        <span className="font-bold text-sky-700">{formatCurrency(detailModal.pickup.booking.totalAmount)}</span>
                      </div>
                      {detailModal.pickup.booking.codAmount != null && Number(detailModal.pickup.booking.codAmount) > 0 && (
                        <div className="col-span-2">
                          <span className="text-slate-400 font-medium block text-xs">COD amount</span>
                          <span className="font-bold text-amber-700">{formatCurrency(detailModal.pickup.booking.codAmount)}</span>
                        </div>
                      )}
                      {(detailModal.pickup.booking.packetContent || detailModal.pickup.booking.handlingInstructions) && (
                        <div className="col-span-2">
                          <span className="text-slate-400 font-medium block text-xs">Content / Instructions</span>
                          <span className="text-slate-700 text-sm">{detailModal.pickup.booking.packetContent || '—'} {detailModal.pickup.booking.handlingInstructions && ` · ${detailModal.pickup.booking.handlingInstructions}`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Consignee */}
              {(detailModal.pickup.booking?.consigneeName || detailModal.pickup.booking?.consigneeAddress) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Consignee</h3>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-slate-900">{detailModal.pickup.booking.consigneeName || '—'}</div>
                    {detailModal.pickup.booking?.consigneeCompanyName && (
                      <div className="text-xs text-slate-500">{detailModal.pickup.booking.consigneeCompanyName}</div>
                    )}
                    {detailModal.pickup.booking?.consigneePhone && (
                      <div className="text-sm text-slate-600 font-medium">{detailModal.pickup.booking.consigneePhone}</div>
                    )}
                    {detailModal.pickup.booking?.consigneeAddress && (
                      <div className="text-sm text-slate-600">{detailModal.pickup.booking.consigneeAddress}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions Section */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collector Notes</h3>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-amber-900 font-medium italic relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-amber-100 rounded-bl-lg">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                  </div>
                  "{detailModal.pickup.specialInstructions || 'No specific instructions were provided for the collector.'}"
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePrintPickup(detailModal.pickup)}
                className="px-4 py-4 bg-sky-600 text-white rounded-2xl font-black text-sm hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
              >
                <Printer className="w-5 h-5" />
                PRINT
              </button>
              <button
                onClick={() => setDetailModal({ isOpen: false, pickup: null })}
                className="px-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
