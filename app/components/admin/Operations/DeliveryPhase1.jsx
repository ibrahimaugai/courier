'use client'

import { useState, useEffect } from 'react'
import { Calendar, FileSpreadsheet, Copy, Printer, FileText, ChevronsUpDown, Eye, Plus, Search, User, Loader2, Truck, Package, ArrowRight, UserCircle } from 'lucide-react'
import { api } from '../../../lib/api'

export default function DeliveryPhase1({ setActivePage }) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [sheets, setSheets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [entriesPerPage, setEntriesPerPage] = useState(25)

  useEffect(() => {
    fetchSheets()
  }, [])

  const fetchSheets = async () => {
    setIsLoading(true)
    try {
      const res = await api.getDeliverySheets({ startDate, endDate })
      setSheets(Array.isArray(res) ? res : (res.data || []))
    } catch (err) {
      console.error("Failed to fetch sheets", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGo = () => {
    fetchSheets()
  }

  const handleCreateDeliverySheet = () => {
    if (setActivePage) {
      setActivePage('Create Delivery Phase 1')
    } else {
      console.error("setActivePage prop missing")
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">

          <div className="h-8 w-[2px] bg-gray-200"></div>
          <div>
            <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
            <h1 className="text-2xl font-black text-gray-900">Delivery Phase 1 (On Route)</h1>
          </div>
        </div>
      </div>

      {/* Date Filter & Create Button */}
      <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-6 mb-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-bold transition-all shadow-sm"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-hover:text-sky-500 transition-colors" />
            </div>
          </div>
          <div className="relative group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-bold transition-all shadow-sm"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-hover:text-sky-500 transition-colors" />
            </div>
          </div>
          <button
            onClick={handleGo}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-600/20 active:scale-95"
          >
            GO
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateDeliverySheet}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center gap-2 group active:scale-95"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Create Delivery Sheet
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-4 mb-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Show</label>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white shadow-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">entries</span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search sheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-sky-50 to-sky-100/50 border-b border-sky-100">
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <th className="px-4 py-4 text-center">SR</th>
                <th className="px-4 py-4">Sheet #</th>
                <th className="px-4 py-4">Rider</th>
                <th className="px-4 py-4">Vehicle</th>
                <th className="px-4 py-4">Origin</th>
                <th className="px-4 py-4 text-center">CNs</th>
                <th className="px-4 py-4 text-center">Weight</th>
                <th className="px-4 py-4 text-center">FOD</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">User</th>
                <th className="px-4 py-4 min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="12" className="py-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-600" /></td></tr>
              ) : sheets.length === 0 ? (
                <tr>
                  <td colSpan="12" className="py-12 text-center">
                    <Truck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No delivery sheets found</p>
                    <p className="text-xs text-gray-400 mt-1">Create a new sheet to get started</p>
                  </td>
                </tr>
              ) : (
                sheets.map((row, index) => (
                  <tr key={index} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-4 py-4 text-center text-xs font-black text-gray-400">{index + 1}</td>
                    <td className="px-4 py-4 text-xs font-black text-sky-700">{row.sheetNumber}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-700">{row.rider?.name || row.riderName || 'N/A'}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{row.vehicleNo || row.vehicle?.vehicleNumber || '-'}</td>
                    {/* Origin is usually station code */}
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">{row.originStation?.stationCode || row.originStationId?.slice(0, 4) || 'LHR'}</td>
                    <td className="px-4 py-4 text-center text-xs font-black text-gray-900">{row.totalCns}</td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-gray-500">{row.totalWeight}</td>
                    <td className="px-4 py-4 text-center text-xs font-bold text-emerald-600">{row.totalFod}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">{new Date(row.sheetDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-400">{row.createdByUser?.username || 'Admin'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-sky-100 text-sky-600 rounded hover:bg-sky-200" title="Print"><Printer className="w-4 h-4" /></button>
                        <button
                          onClick={() => setActivePage && setActivePage('Edit Delivery Phase 1', row.id)}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-amber-600 transition-colors shadow-md"
                        >
                          Continue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
