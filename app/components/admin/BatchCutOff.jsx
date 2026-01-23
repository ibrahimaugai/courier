'use client'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Loader2, RefreshCw, CheckCircle, AlertCircle, PlusCircle, Power, PowerOff } from 'lucide-react'

export default function BatchCutOff() {
  const [config, setConfig] = useState(null)
  const [batches, setBatches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentBatchId, setCurrentBatchId] = useState('')

  useEffect(() => {
    fetchConfig()
    fetchBatches()
  }, [])

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

  const fetchBatches = async () => {
    try {
      const result = await api.getBatches()
      // Handle both wrapped and unwrapped response, ensuring we get an array
      const data = Array.isArray(result) ? result : (result?.data || [])
      setBatches(data)

      if (data.length > 0) {
        const activeBatch = data.find(b => b.status === 'ACTIVE')
        setCurrentBatchId(activeBatch ? activeBatch.batchCode : '')
      }
    } catch (err) {
      console.error('Error fetching batches:', err)
      setBatches([]) // Fallback to empty array on error
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

      setCurrentBatchId(newBatch.batchCode)
      setSuccess(`New Batch ${newBatch.batchCode} generated!`)
      fetchBatches()
    } catch (err) {
      console.error('Error creating batch:', err)
      setError(err.message || 'Failed to generate batch.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (batchId, currentStatus) => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'
      await api.updateBatchStatus(batchId, newStatus)
      setSuccess(`Batch status updated to ${newStatus}`)
      fetchBatches()
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err.message || 'Failed to update status.')
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
          <span className="text-sm text-green-600 font-medium block">VER -1.863 LIVE</span>
          <p className="text-xs text-gray-500 mt-1">Station: {config?.stationCode || 'N/A'}</p>
        </div>
      </div>

      {/* Main Generation Card */}
      {/* Main Stats/Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Batch Card */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl shadow-md p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">Current Active Batch</h3>
            {currentBatchId ? (
              <div className="flex items-center gap-3 bg-white bg-opacity-10 p-3 rounded-lg border border-white border-opacity-10">
                <span className="text-2xl font-black tracking-tight">{currentBatchId}</span>
                <span className="bg-green-400 text-green-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Active</span>
              </div>
            ) : (
              <div className="bg-white bg-opacity-5 p-3 rounded-lg border border-dashed border-white border-opacity-20">
                <p className="text-lg font-bold opacity-40 italic">No Active Batch</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2 relative z-10">
            <button
              onClick={fetchBatches}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-sky-500 bg-opacity-30 text-white font-bold rounded-lg border border-white border-opacity-10 hover:bg-opacity-40 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH DATA
            </button>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Stats</h3>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Total Today</span>
              <span className="text-lg font-bold text-gray-900">
                {Array.isArray(batches)
                  ? batches.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length
                  : 0}
              </span>
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
                batches.slice(0, 10).map((batch) => (
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
      </div>
    </div>
  )
}
