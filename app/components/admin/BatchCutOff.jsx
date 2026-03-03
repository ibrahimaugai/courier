'use client'
import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Scissors, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const BATCHES_PER_PAGE = 5

export default function BatchCutOff() {
  const [config, setConfig] = useState(null)
  const [batches, setBatches] = useState([])
  const [activeBatch, setActiveBatch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBatches, setTotalBatches] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    fetchConfig()
    return () => { mountedRef.current = false }
  }, [])

  const loadBatchesAndActive = async (pageNum) => {
    try {
      const [batchesRes, latestRes] = await Promise.all([
        api.getBatches({ limit: BATCHES_PER_PAGE, page: pageNum }),
        api.getLatestBatch()
      ])
      const raw = batchesRes?.data ?? batchesRes
      const list = Array.isArray(raw) ? raw : (raw?.data ?? [])
      const total = raw?.total ?? list.length
      const pages = raw?.totalPages ?? (Math.ceil(total / BATCHES_PER_PAGE) || 1)
      setBatches(list)
      setTotalBatches(total)
      setTotalPages(pages)
      const latest = latestRes?.data ?? latestRes
      setActiveBatch(latest ? { id: latest.id, batchCode: latest.batchCode } : null)
    } catch (err) {
      console.error('Error fetching batches:', err)
      setBatches([])
      setTotalBatches(0)
      setTotalPages(1)
      setActiveBatch(null)
    }
  }

  useEffect(() => {
    if (!mountedRef.current) return
    let cancelled = false
    const run = async () => {
      try {
        const [batchesRes, latestRes] = await Promise.all([
          api.getBatches({ limit: BATCHES_PER_PAGE, page }),
          api.getLatestBatch()
        ])
        if (cancelled) return
        const raw = batchesRes?.data ?? batchesRes
        const list = Array.isArray(raw) ? raw : (raw?.data ?? [])
        const total = raw?.total ?? list.length
        const pages = raw?.totalPages ?? (Math.ceil(total / BATCHES_PER_PAGE) || 1)
        setBatches(list)
        setTotalBatches(total)
        setTotalPages(pages)
        const latest = latestRes?.data ?? latestRes
        setActiveBatch(latest ? { id: latest.id, batchCode: latest.batchCode } : null)
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching batches:', err)
          setBatches([])
          setTotalBatches(0)
          setTotalPages(1)
          setActiveBatch(null)
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [page])

  const fetchConfig = async () => {
    try {
      const result = await api.getConfiguration()
      const responseData = result?.data || result
      const configData = responseData?.config || (responseData?.stationCode ? responseData : null)
      setConfig(configData)
    } catch (err) {
      console.error('Error fetching config:', err)
      setError('System configuration not found. Please set up Configuration first.')
    }
  }

  const fetchActiveBatch = async () => {
    try {
      const active = await api.getLatestBatch()
      const resolved = active?.data ?? active
      setActiveBatch(resolved ? { id: resolved.id, batchCode: resolved.batchCode } : null)
    } catch (_) {
      setActiveBatch(null)
    }
  }

  const fetchBatches = async (pageNum = 1) => {
    try {
      const result = await api.getBatches({ limit: BATCHES_PER_PAGE, page: pageNum })
      const raw = result?.data ?? result
      const list = Array.isArray(raw) ? raw : (raw?.data ?? [])
      const total = raw?.total ?? list.length
      const pages = raw?.totalPages ?? (Math.ceil(total / BATCHES_PER_PAGE) || 1)
      setBatches(list)
      setTotalBatches(total)
      setTotalPages(pages)
    } catch (err) {
      console.error('Error fetching batches:', err)
      setBatches([])
      setTotalBatches(0)
      setTotalPages(1)
    }
  }

  const handleCreateBatch = async () => {
    if (!config || !config.stationCode || !config.staffCode) {
      setError('Incomplete system configuration (Station/Staff Code). Please update in Settings.')
      return
    }
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const newBatch = await api.createBatch({
        batchDate: new Date().toISOString().split('T')[0],
        stationCode: config.stationCode,
        routeCode: config.routeCode,
        staffCode: config.staffCode
      })
      setActiveBatch(newBatch ? { id: newBatch.id, batchCode: newBatch.batchCode } : null)
      setSuccess(`New Batch ${newBatch?.batchCode || ''} generated!`)
      loadBatchesAndActive(page)
    } catch (err) {
      console.error('Error creating batch:', err)
      setError(err.message || 'Failed to generate batch.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchCutOff = async () => {
    if (!activeBatch?.id) {
      setError('No active batch to cut off.')
      return
    }
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.updateBatchStatus(activeBatch.id, 'CLOSED')
      setSuccess(`Batch ${activeBatch.batchCode} has been cut off. Shift closed.`)
      setActiveBatch(null)
      loadBatchesAndActive(page)
    } catch (err) {
      console.error('Error cutting off batch:', err)
      setError(err.message || 'Failed to perform batch cut-off.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Batch Cut Off</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mt-1">Station: {config?.stationCode || 'N/A'}</p>
        </div>
      </div>

      {/* Main Generation Card */}
      {/* Main Stats/Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Batch Card – batch ID from backend until cut off */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl shadow-md p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">Current Active Batch (from backend)</h3>
            {activeBatch?.batchCode ? (
              <div className="flex items-center gap-3 bg-white bg-opacity-10 p-3 rounded-lg border border-white border-opacity-10">
                <span className="text-2xl font-black tracking-tight">{activeBatch.batchCode}</span>
                <span className="bg-green-400 text-green-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Active</span>
              </div>
            ) : (
              <div className="bg-white bg-opacity-5 p-3 rounded-lg border border-dashed border-white border-opacity-20">
                <p className="text-lg font-bold opacity-40 italic">No Active Batch</p>
                <p className="text-xs opacity-60 mt-1">Create a new batch or refresh after cut-off.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-2 relative z-10">
            {activeBatch?.id && (
              <button
                type="button"
                onClick={handleBatchCutOff}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-lg border border-amber-400 shadow-lg disabled:opacity-60 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
                Perform Batch Cut Off
              </button>
            )}
            {!activeBatch?.id && (
              <button
                type="button"
                onClick={handleCreateBatch}
                disabled={isLoading || !config?.stationCode || !config?.staffCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg border border-emerald-400 disabled:opacity-50 transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                Create New Batch
              </button>
            )}
            <button
              type="button"
              onClick={() => loadBatchesAndActive(page)}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-sky-500 bg-opacity-30 text-white font-bold rounded-lg border border-white border-opacity-10 hover:bg-opacity-40 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh data
            </button>
          </div>

          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Stats</h3>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Total Batches</span>
              <span className="text-lg font-bold text-gray-900">{totalBatches}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">System</span>
              <span className="text-xs font-black text-green-600 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Current Configuration</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Station</span>
              <span className="text-sm font-black text-sky-700">{config?.stationCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Route</span>
              <span className="text-sm font-black text-sky-700">{config?.routeCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Staff</span>
              <span className="text-sm font-black text-sky-700">{config?.staffCode || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* alerts */}
      {(error || success) && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in border ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
          }`}>
          {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <p className="font-bold">{error || success}</p>
        </div>
      )}

      {/* Simplified Batch History Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Recent Batch Activity</h2>
          <span className="text-xs text-gray-400 italic">Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Time</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(batches) && batches.length > 0 ? (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-sky-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-black text-sky-700">
                      {batch.batchCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{new Date(batch.createdAt).toLocaleTimeString()}</span>
                        <span className="text-[10px] text-gray-400">{new Date(batch.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                    No batch history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              {totalBatches != null && <span> ({totalBatches} batch{totalBatches !== 1 ? 'es' : ''} total)</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
