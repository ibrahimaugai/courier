'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Calendar, Search, User, MapPin, Phone, CheckCircle,
  XCircle, Eye, Loader2, FileSpreadsheet, Copy, Printer,
  FileText, ChevronsUpDown, AlertCircle, RefreshCw, Truck
} from 'lucide-react'
import { fetchAllPickups, updatePickupStatus, clearPickupsError, clearPickupsSuccess } from '../../../lib/store'
import { api } from '../../../lib/api'
import Toast from '../../Toast'

export default function PickupManagement() {
  const dispatch = useDispatch()
  const { pickups, isLoading, error, success } = useSelector((state) => state.pickups)

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    searchTerm: '',
    cityId: ''
  })

  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [assignModal, setAssignModal] = useState({ isOpen: false, pickup: null })
  const [statusModal, setStatusModal] = useState({ isOpen: false, pickup: null, newStatus: '' })
  const [detailModal, setDetailModal] = useState({ isOpen: false, pickup: null })
  const [riderName, setRiderName] = useState('')
  const [riderPhone, setRiderPhone] = useState('')
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })

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

  const handleAssignRider = (pickup) => {
    setAssignModal({ isOpen: true, pickup })
    setRiderName(pickup.riderName || '')
    setRiderPhone(pickup.riderPhone || '')
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

    const result = await dispatch(updatePickupStatus({
      id: assignModal.pickup.id,
      status: 'ASSIGNED',
      riderName: riderName.trim(),
      riderPhone: riderPhone.trim()
    }))

    if (updatePickupStatus.fulfilled.match(result)) {
      setToast({ isVisible: true, message: 'Rider assigned successfully!', type: 'success' })
      setAssignModal({ isOpen: false, pickup: null })
      setRiderName('')
      setRiderPhone('')
      loadPickups()
    }
  }

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
    const riderName = pickup.riderName || pickup.assignedRider?.name || '—'
    const riderPhone = pickup.riderPhone || pickup.assignedRider?.phone || '—'
    const cell = (label, value) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:180px">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a">${(value || '—').toString().replace(/</g, '&lt;')}</td></tr>`
    const section = (title) => `<tr><td colspan="2" style="padding:12px 0 6px;font-weight:800;color:#0ea5e9;text-transform:uppercase;letter-spacing:0.05em">${title}</td></tr>`
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Pickup - ${(b.cnNumber || pickup.id || 'detail').toString()}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;color:#0f172a}
table{width:100%;border-collapse:collapse} h1{font-size:1.25rem;margin:0 0 16px;color:#0f172a}
</style></head>
<body>
<h1>Pickup / Booking Details</h1>
<table>
${section('')}
${cell('CN Number', b.cnNumber)}
${cell('Booking Status', bookingDetail?.status || b.status)}
${cell('Pickup Request Status', pickup.status)}
${cell('Request Created', pickup.createdAt ? new Date(pickup.createdAt).toLocaleString() : '')}
${section('Booking')}
${cell('Origin', bookingDetail?.originCity?.cityName || b.originCity?.cityName)}
${cell('Destination', bookingDetail?.destinationCity?.cityName || b.destinationCity?.cityName)}
${cell('Customer (Shipper)', bookingDetail?.customer?.name || b.customer?.name)}
${cell('Shipper Phone', bookingDetail?.customer?.phone)}
${cell('Consignee Name', bookingDetail?.consigneeName)}
${cell('Consignee Phone', bookingDetail?.consigneePhone)}
${cell('Consignee Address', bookingDetail?.consigneeAddress)}
${cell('Pieces', bookingDetail?.pieces != null ? bookingDetail.pieces : '')}
${cell('Weight (kg)', bookingDetail?.weight != null ? bookingDetail.weight : '')}
${cell('Service', bookingDetail?.service?.serviceName)}
${cell('Payment Mode', bookingDetail?.paymentMode)}
${cell('Total Amount', bookingDetail?.totalAmount != null ? bookingDetail.totalAmount : '')}
${cell('COD Amount', bookingDetail?.codAmount != null ? bookingDetail.codAmount : '')}
${section('Pickup Request')}
${cell('Pickup Date', pickup.pickupDate ? new Date(pickup.pickupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '')}
${cell('Pickup Time', pickup.pickupTime || 'Flexible / Anytime')}
${cell('Contact Name', pickup.contactName)}
${cell('Contact Phone', pickup.contactPhone)}
${cell('Pickup Address', pickup.pickupAddress)}
${cell('Special Instructions', pickup.specialInstructions || 'None')}
${section('Assigned Rider')}
${cell('Rider Name', riderName)}
${cell('Rider Phone', riderPhone)}
${cell('Generated', new Date().toLocaleString())}
</table>
</body>
</html>`
    const win = window.open('', '_blank')
    if (!win) {
      setToast({ isVisible: true, message: 'Allow popups to print', type: 'error' })
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 300)
    setToast({ isVisible: true, message: 'Print dialog opened', type: 'success' })
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

  const safePickups = Array.isArray(pickups) ? pickups : []
  const paginatedPickups = safePickups.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

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
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium">
              <FileSpreadsheet className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="CN, Name, Phone..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm bg-white outline-none"
              >
                <option value="">All Statuses</option>
                <option value="REQUESTED">Requested</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED">Picked</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

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

        {/* Main Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Rider</th>
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
                ) : paginatedPickups.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium text-lg">No pickup requests found</p>
                      <button onClick={() => setFilters({ startDate: '', endDate: '', status: '', searchTerm: '', cityId: '' })} className="text-sky-600 text-sm font-semibold mt-2 hover:underline">Clear all filters</button>
                    </td>
                  </tr>
                ) : (
                  paginatedPickups.map((pickup) => (
                    <tr key={pickup.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-sky-600 flex items-center gap-1">
                            {pickup.booking?.cnNumber}
                            <button onClick={() => navigator.clipboard.writeText(pickup.booking?.cnNumber)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="w-3 h-3 text-slate-400 hover:text-sky-600" />
                            </button>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium uppercase mt-0.5">
                            {pickup.createdAt ? (
                              `${new Date(pickup.createdAt).toLocaleDateString()} at ${new Date(pickup.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            ) : (
                              'N/A'
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{pickup.contactName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {pickup.contactPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-[200px] truncate leading-snug" title={pickup.pickupAddress}>
                          {pickup.pickupAddress}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 bg-slate-100 inline-block px-1.5 rounded">
                          {pickup.booking?.originCity?.cityName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-800">
                          {new Date(pickup.pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-sky-600 font-medium mt-0.5">
                          {pickup.pickupTime || 'Flexible Time'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(pickup.status)}`}>
                          {pickup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {pickup.riderName || (pickup.assignedRider && pickup.assignedRider.name) ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold border border-sky-200">
                              {(pickup.riderName || pickup.assignedRider?.name || '').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{pickup.riderName || pickup.assignedRider?.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {pickup.riderPhone || pickup.assignedRider?.phone || '—'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignRider(pickup)}
                            className="px-3 py-1.5 bg-white text-sky-600 rounded-lg text-[11px] font-bold border border-sky-100 hover:bg-sky-50 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <User className="w-3 h-3" />
                            Assign Rider
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailModal({ isOpen: true, pickup })}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-sky-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {pickup.status === 'REQUESTED' && (
                            <button
                              onClick={() => handleUpdateStatus(pickup, 'PICKED')}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-emerald-100"
                              title="Complete Pickup"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintPickup(pickup)}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-sky-100"
                            title="Print full details"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{Math.min(paginatedPickups.length, entriesPerPage)}</span> of <span className="text-slate-900 font-bold">{pickups.length}</span> results
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
                {[...Array(Math.ceil(pickups.length / entriesPerPage))].map((_, i) => (
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
                disabled={currentPage === Math.ceil(pickups.length / entriesPerPage) || pickups.length === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Rider Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {
            setAssignModal({ isOpen: false, pickup: null })
            setRiderName('')
            setRiderPhone('')
          }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-sky-600" />
                Assign Rider
              </h3>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-tighter font-bold">CN: {assignModal.pickup.booking?.cnNumber}</p>
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
                  setAssignModal({ isOpen: false, pickup: null })
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

              {/* Contact Card */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shipper Details</h3>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                      <User className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{detailModal.pickup.contactName}</div>
                      <div className="text-sm text-slate-500 font-medium">{detailModal.pickup.contactPhone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700 font-bold leading-relaxed">{detailModal.pickup.pickupAddress}</div>
                      <div className="text-xs text-slate-400 mt-1 uppercase font-black">{detailModal.pickup.booking?.originCity?.cityName || 'Unknown Origin'}</div>
                    </div>
                  </div>
                </div>
              </div>

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

// Utility icon for Clock which was missing from imports
function Clock(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
