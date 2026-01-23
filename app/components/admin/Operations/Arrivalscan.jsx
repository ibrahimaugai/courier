'use client'

import { useState, useEffect } from 'react'
import { Calendar, FileSpreadsheet, Copy, Printer, FileText, ChevronsUpDown, Eye, Plus, Search, User, Loader2 } from 'lucide-react'
import { api } from '../../../lib/api'

export default function ArrivalScan({ setActivePage }) {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [searchTerm, setSearchTerm] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [arrivals, setArrivals] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchArrivals()
  }, [])

  const fetchArrivals = async (filterStartDate, filterEndDate) => {
    setIsLoading(true)
    try {
      const params = {}
      if (filterStartDate) params.startDate = filterStartDate
      if (filterEndDate) params.endDate = filterEndDate

      const result = await api.getArrivalScans(params)
      // Handle both direct array and wrapped data object
      const data = Array.isArray(result) ? result : (result?.data || [])
      setArrivals(data)
    } catch (err) {
      console.error('Error fetching arrivals:', err)
      setArrivals([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoClick = () => {
    fetchArrivals(startDate, endDate)
  }

  const totalEntries = arrivals.length

  const handleCreateArrivalSheet = () => {
    if (setActivePage) {
      setActivePage('Create Arrival Sheet')
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4 sm:mb-6 pt-4">
        {/* Date Range Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              START DATE
            </label>
            <div className="relative group">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-bold transition-all shadow-sm"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-hover:text-sky-500 transition-colors" />
            </div>
          </div>
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              END DATE
            </label>
            <div className="relative group">
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
            onClick={handleGoClick}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-600/20 active:scale-95"
          >
            GO
          </button>
        </div>

        {/* Create Arrival Sheet Button */}
        <button
          onClick={handleCreateArrivalSheet}
          className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-600/20 flex items-center gap-2 group active:scale-95"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Create Arrival Sheet
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-4 mb-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-red-100">
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
          <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel
          </button>
          <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-gray-100">
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <div className="h-6 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-gray-700 focus:outline-none"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="relative group flex-1 sm:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search within records..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:bg-white focus:border-sky-500 transition-all text-xs font-medium placeholder-gray-400"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-sky-500 transition-colors" />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-sky-950/5 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-sky-50 to-sky-100/50 border-b border-sky-100">
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <th className="px-6 py-4">SR</th>
                <th className="px-6 py-4">Arrival Code</th>
                <th className="px-6 py-4">Rider Details</th>
                <th className="px-6 py-4 text-center">CNS</th>
                <th className="px-6 py-4">Origin</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
                    <p className="mt-2 text-xs font-black text-gray-400 uppercase tracking-widest">Loading history...</p>
                  </td>
                </tr>
              ) : (Array.isArray(arrivals) && arrivals.length > 0) ? (
                arrivals.map((arrival, index) => (
                  <tr key={arrival.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-6 py-4 text-xs font-black text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-sky-700 tracking-tight">{arrival.arrivalCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{arrival.rider?.name || 'Self Scan'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900 text-sm">{arrival.totalCns}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase">{arrival.station?.stationCode || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {new Date(arrival.scanDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActivePage && setActivePage('Edit Arrival Sheet', arrival.id)}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-amber-600 transition-colors shadow-md"
                        >
                          Continue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                    No arrival records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
