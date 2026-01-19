'use client'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Calendar, Printer, Loader2, CheckCircle, AlertCircle, Package } from 'lucide-react'

export default function ShiftClose() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [batchOptions, setBatchOptions] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeBatch, setActiveBatch] = useState(null)
  const [config, setConfig] = useState(null)

  // Fetch active batch and config on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [batchesRes, configRes] = await Promise.all([
          api.getBatches(),
          api.getConfiguration()
        ])

        const batches = Array.isArray(batchesRes) ? batchesRes : (batchesRes?.data || [])
        const active = batches.find(b => b.status === 'ACTIVE')
        if (active) setActiveBatch(active)

        const responseData = configRes?.data || configRes
        const configData = responseData?.config || (responseData?.stationCode ? responseData : null)
        setConfig(configData)
      } catch (err) {
        console.error('Error fetching initial data:', err)
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    console.log('ShiftClose: useEffect triggered. Date:', selectedDate, 'RefreshKey:', refreshKey)
    if (selectedDate) {
      fetchBatchesForDate(selectedDate)
    }
  }, [selectedDate, refreshKey])

  const fetchBatchesForDate = async (date) => {
    try {
      setIsLoading(true)
      setError('')
      console.log('ShiftClose: Starting fetchBatchesForDate for', date)
      const result = await api.getBatches({ date })
      console.log('ShiftClose: Received result:', result)

      // Handle NestJS TransformInterceptor response structure
      const data = result?.data || result || []

      setBatchOptions(Array.isArray(data) ? data : [])

      if (Array.isArray(data) && data.length > 0) {
        setSelectedBatchId(data[0].id)
        setSuccess(`Found ${data.length} batches for this date.`)
      } else {
        setSelectedBatchId('')
        setBookings([])
        setSuccess('No batches found for this date.')
      }
    } catch (err) {
      console.error('ShiftClose: Error in fetchBatchesForDate:', err)
      setError(`Failed to fetch batches: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualRefresh = () => {
    console.log('ShiftClose: Manual refresh requested')
    setRefreshKey(prev => prev + 1)
  }

  const handleLoadBookings = async () => {
    if (!selectedBatchId) {
      setError('Please select a batch first.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    console.log('ShiftClose: handleLoadBookings for batchId:', selectedBatchId)
    try {
      const result = await api.getConsignments({ batchId: selectedBatchId })
      console.log('ShiftClose: Consignments result:', result)

      // Handle NestJS TransformInterceptor response structure
      const data = result?.data || result || []

      setBookings(Array.isArray(data) ? data : [])
      if (Array.isArray(data) && data.length === 0) {
        setSuccess('No bookings found for this batch.')
      } else if (Array.isArray(data)) {
        setSuccess(`Successfully loaded ${data.length} bookings.`)
      }
    } catch (err) {
      console.error('ShiftClose: Error in handleLoadBookings:', err)
      setError(`Failed to load bookings: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintAndShiftClose = async () => {
    if (bookings.length === 0) return

    // 1. Trigger Print immediately with current data
    window.print()

    // 2. Logic for closure and new batch generation
    if (selectedBatchId === activeBatch?.id) {
      if (!window.confirm(`You have printed the summary. Now closing the current active batch (${activeBatch.batchCode}). A new batch will be generated automatically. Proceed?`)) {
        return
      }

      setIsLoading(true)
      setError('')
      try {
        // Step A: Close current batch
        await api.updateBatchStatus(activeBatch.id, 'CLOSED')

        // Step B: Generate NEW batch using config
        if (!config || !config.stationCode || !config.staffCode) {
          throw new Error('Incomplete configuration. Cannot auto-generate next batch.')
        }

        const newBatch = await api.createBatch({
          batchDate: new Date().toISOString().split('T')[0],
          stationCode: config.stationCode,
          routeCode: config.routeCode,
          staffCode: config.staffCode
        })

        // Instantly update local states to reflect the new batch
        setActiveBatch(newBatch)
        setBatchOptions(prev => [newBatch, ...prev])
        setSelectedBatchId(newBatch.id)
        setBookings([])

        setSuccess(`Shift Closed. Current batch was closed and New Batch ${newBatch.batchCode} has been generated.`)

        // Refresh hidden states if needed
        setRefreshKey(prev => prev + 1)
      } catch (err) {
        console.error('Error during shift close/batch generation:', err)
        setError(err.message || 'Failed to complete shift close process.')
      } finally {
        setIsLoading(false)
      }
    } else {
      setSuccess('Bookings printed. (Historic batch, no shift-close performed)')
    }
  }

  return (
    <>
      <div className="max-w-7xl print:hidden">
        {/* Header Section */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img src="/nps-logo.png" alt="NPS Logo" className="h-12 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Shift Close</h1>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">

              <span className="text-sm text-green-600 font-medium block">VER -1.863 LIVE</span>
            </div>

            <p className="text-xs text-gray-500">Today: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Select Date and Batch ID Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            Shift Selection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            {/* Select Date */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    console.log('ShiftClose: Date input changed to', e.target.value)
                    setSelectedDate(e.target.value)
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all font-medium text-gray-700"
                />
                <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Select Batch ID */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">
                Select Batch ID
              </label>
              <div className="relative">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white appearance-none transition-all font-bold text-sky-700"
                >
                  <option value="">{batchOptions.length > 0 ? 'Select a batch' : 'No batches found'}</option>
                  {batchOptions.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchCode} ({batch.status})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLoadBookings}
              disabled={isLoading || !selectedBatchId}
              className="flex-1 px-8 py-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all font-black shadow-lg hover:shadow-sky-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Package className="w-6 h-6" />}
              LOAD BOOKINGS
            </button>

            <button
              onClick={handlePrintAndShiftClose}
              disabled={bookings.length === 0 || isLoading}
              className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-black shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Printer className="w-6 h-6" />
              PRINT ALL BOOKINGS
            </button>
          </div>
        </div>

        {/* alerts */}
        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in border ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
            }`}>
            {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <p className="font-bold text-sm">{error || success}</p>
          </div>
        )}

        {/* Bookings Table */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Consignments in Batch</h2>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  TOTAL: {bookings.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">CN Number</th>
                    <th className="px-6 py-4">Shipper</th>
                    <th className="px-6 py-4">Consignee</th>
                    <th className="px-6 py-4">Destination</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-sky-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-base font-black text-sky-700 tracking-tight">{booking.cnNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 leading-tight">{booking.shipperName}</span>
                          <span className="text-[10px] text-gray-500 font-medium">{booking.shipperPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 leading-tight">{booking.consigneeName}</span>
                          <span className="text-[10px] text-gray-500 font-medium">{booking.consigneePhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700 uppercase">
                          {booking.destinationCity?.name || booking.destinationCityId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-gray-900">
                          {parseFloat(booking.totalAmount).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Printable Area - Only visible in print */}
      <div className="hidden print:block w-full font-serif text-black p-4">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="/nps-logo.png" alt="NPS Logo" className="h-14 w-auto" />
            <div>
              <h1 className="text-2xl font-black uppercase">Shift Closure Report</h1>
              <p className="text-xs font-bold text-gray-600 tracking-widest">OFFICIAL SHIPPING SUMMARY</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-sky-900 leading-tight">BATCH: {batchOptions.find(b => b.id === selectedBatchId)?.batchCode}</div>
            <div className="text-[10px] space-y-0.5 mt-1">
              <p>STATION: <span className="font-black tracking-wider text-black">{config?.stationCode || 'N/A'}</span></p>
              <p>DATE: {new Date(selectedDate).toLocaleDateString()}</p>
              <p>GENERATED BY: {config?.staffCode || 'N/A'}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-6 border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-[10px] font-black uppercase tracking-tight">
              <th className="border border-black p-1 text-center">SR</th>
              <th className="border border-black p-1 text-left">CN NUMBER</th>
              <th className="border border-black p-1 text-left">SHIPPER</th>
              <th className="border border-black p-1 text-left">CONSIGNEE</th>
              <th className="border border-black p-1 text-left text-center">DEST</th>
              <th className="border border-black p-1 text-center">MODE</th>
              <th className="border border-black p-1 text-center">PCS/WGT</th>
              <th className="border border-black p-1 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking.id} className="text-[10px] border-b border-black">
                <td className="border border-black p-1.5 text-center font-bold">{index + 1}</td>
                <td className="border border-black p-1.5 font-black text-sky-900">{booking.cnNumber}</td>
                <td className="border border-black p-1.5">
                  <div className="font-black text-[10px] uppercase truncate">{booking.shipperName}</div>
                  <div className="text-[9px] opacity-70">{booking.shipperPhone}</div>
                </td>
                <td className="border border-black p-1.5">
                  <div className="font-black text-[10px] uppercase truncate">{booking.consigneeName}</div>
                  <div className="text-[9px] opacity-70">{booking.consigneePhone}</div>
                </td>
                <td className="border border-black p-1.5 font-bold text-center uppercase">{booking.destinationCity?.cityName || booking.destinationCity?.name || booking.destinationCityId}</td>
                <td className="border border-black p-1.5 text-center font-black uppercase text-[8px]">{booking.payMode}</td>
                <td className="border border-black p-1.5 text-center font-bold">{booking.pieces} / {booking.weight}</td>
                <td className="border border-black p-1.5 text-right font-black italic">RS. {parseFloat(booking.totalAmount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-black border-t border-black text-[11px]">
              <td colSpan="6" className="border border-black p-2 text-right uppercase tracking-widest text-xs">Shift Total Summary</td>
              <td className="border border-black p-2 text-center text-xs">
                {bookings.reduce((sum, b) => sum + (parseInt(b.pieces) || 0), 0)} PCS / {bookings.reduce((sum, b) => sum + (parseFloat(b.weight) || 0), 0).toFixed(2)} KG
              </td>
              <td className="border border-black p-2 text-right text-xs">
                RS. {bookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-2 gap-20 mt-16 px-6">
          <div className="border-t border-black pt-2 text-center">
            <p className="text-[10px] font-black uppercase">Prepared By ({config?.staffCode || 'N/A'})</p>
            <p className="text-[9px] text-gray-500 mt-1 uppercase italic font-bold">Courier Staff Signature</p>
          </div>
          <div className="border-t border-black pt-2 text-center">
            <p className="text-transparent">.</p>
            <p className="text-[10px] font-black uppercase">Authorized Signature & Stamp</p>
            <p className="text-[9px] text-gray-500 mt-1 uppercase italic font-bold">Station Manager</p>
          </div>
        </div>

        <div className="mt-12 text-[8px] text-gray-400 text-center flex justify-between uppercase font-bold tracking-widest border-t border-gray-100 pt-2">
          <span>Printed on: {new Date().toLocaleString()}</span>
          <span>Shift Close Summary Report - NPS Courier - Version 1.8</span>
        </div>
      </div>
    </>
  )
}

