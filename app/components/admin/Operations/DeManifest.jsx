'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronsUpDown, Eye, Plus, Search, User, Loader2, Truck, Package, ArrowRight } from 'lucide-react'
import { api } from '../../../lib/api'

export default function DeManifest({ setActivePage }) {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [searchTerm, setSearchTerm] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [manifests, setManifests] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchManifests()
  }, [])

  const fetchManifests = async (filterStartDate, filterEndDate) => {
    setIsLoading(true)
    try {
      const params = {}
      if (filterStartDate || startDate) params.startDate = filterStartDate || startDate
      if (filterEndDate || endDate) params.endDate = filterEndDate || endDate

      const res = await api.getManifests(params)
      const data = res.data || res || []
      setManifests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch manifests', err)
      setManifests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoClick = () => {
    fetchManifests(startDate, endDate)
  }

  const totalEntries = manifests.length

  const handleCreateDeManifest = () => {
    if (setActivePage) {
      setActivePage('De-Manifest Shipments')
    }
  }

  const handleUnloadingSheet = (manifestId) => {
    if (setActivePage) {
      setActivePage('De-Manifest Shipments', manifestId)
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src="/nps-logo.png" alt="NPS Logo" className="h-12 w-auto" />
          <div className="h-8 w-[2px] bg-gray-200"></div>
          <div>
            <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
            <h1 className="text-2xl font-black text-gray-900">De-Manifesting</h1>
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
            onClick={handleGoClick}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-600/20 active:scale-95"
          >
            GO
          </button>
        </div>

        {/* Create/Start De-Manifest Button */}
        <button
          onClick={handleCreateDeManifest}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center gap-2 group active:scale-95"
        >
          <Package className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          Start De-Manifesting
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
            placeholder="Search manifests..."
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
                <th className="px-6 py-4">SR</th>
                <th className="px-6 py-4">Manifest Code</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
                    <p className="mt-2 text-xs font-black text-gray-400 uppercase tracking-widest">Loading manifests...</p>
                  </td>
                </tr>
              ) : (Array.isArray(manifests) && manifests.length > 0) ? (
                manifests.map((manifest, index) => (
                  <tr key={manifest.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-gray-400">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-sky-100 rounded-lg">
                          <Package className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="text-sm font-black text-sky-700">{manifest.manifestCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">
                      {manifest.routeRelation?.routeCode || manifest.route || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{manifest.vehicleNo || '-'}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{manifest.vehicleVendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {manifest.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600">
                        {new Date(manifest.manifestDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUnloadingSheet(manifest.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-sky-700 transition-colors shadow-md active:scale-95"
                      >
                        Unloading Sheet <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No manifests found</p>
                    <p className="text-xs text-gray-400 mt-1">Change date range or create a new one</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {manifests.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs font-bold text-gray-600">
              Showing <span className="font-black text-sky-600">{Math.min(totalEntries, entriesPerPage)}</span> of{' '}
              <span className="font-black text-sky-600">{totalEntries}</span> entries
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
