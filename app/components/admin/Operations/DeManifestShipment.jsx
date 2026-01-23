'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Package, User, Hash, Search, Loader2, ArrowLeft, Truck, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../../../lib/api'

export default function DeManifestShipment({ setActivePage, manifestId }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    manifestNumber: '',
    remarks: '',
    cn: ''
  })

  // State
  const [manifest, setManifest] = useState(null)
  const [shipments, setShipments] = useState([])
  const [scannedCns, setScannedCns] = useState({}) // { cnNumber: unloadedDateString }
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Refs
  const cnInputRef = useRef(null)

  // Load manifest details on mount
  useEffect(() => {
    if (manifestId) {
      loadManifestDetails(manifestId)
    }
  }, [manifestId])

  const loadManifestDetails = async (id) => {
    setIsLoading(true)
    try {
      const result = await api.getManifestDetails(id)
      const data = result.data || result
      setManifest(data)

      // Update form
      setFormData(prev => ({
        ...prev,
        manifestNumber: data.manifestCode,
        date: new Date().toISOString().slice(0, 16) // Default to now
      }))

      // Process shipments
      if (data.manifestShipments) {
        const processedShipments = data.manifestShipments.map(ms => ({
          ...ms.booking,
          manifestShipmentId: ms.id
        }))
        setShipments(processedShipments)

        // Initialize scanned status based on booking status
        const preScanned = {}
        processedShipments.forEach(s => {
          if (['AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'].includes(s.status)) {
            preScanned[s.cnNumber] = s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'Completed'
          }
        })
        setScannedCns(preScanned)
      }
    } catch (err) {
      console.error("Failed to load manifest", err)
      setError("Failed to load manifest details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle CN Scan
  const handleCnLookup = (e) => {
    if (e.key === 'Enter') {
      const cn = formData.cn.trim()
      if (!cn) return

      // Find shipment
      const shipment = shipments.find(s => s.cnNumber === cn)
      if (shipment) {
        // Mark as scanned
        if (!scannedCns[cn]) {
          setScannedCns(prev => ({
            ...prev,
            [cn]: new Date().toLocaleString()
          }))
          setSuccess(`CN ${cn} Unloaded!`)
          setFormData(prev => ({ ...prev, cn: '' })) // Clear input
          setError('')
        } else {
          setError(`CN ${cn} already scanned!`)
          setFormData(prev => ({ ...prev, cn: '' }))
        }
      } else {
        setError(`CN ${cn} not in this manifest!`)
        setFormData(prev => ({ ...prev, cn: '' }))
      }
      // Keep focus
      setTimeout(() => cnInputRef.current?.focus(), 100)
    }
  }

  const handleManifestLookup = async (e) => {
    if (e.key === 'Enter') {
      const code = formData.manifestNumber.trim()
      if (!code) return
      setIsLoading(true)
      try {
        const res = await api.getManifests({ code })
        const manifests = res.data || res
        if (manifests && manifests.length > 0) {
          const match = manifests[0]
          if (setActivePage) {
            setActivePage('De-Manifest Shipments', match.id)
          }
        } else {
          setError('Manifest not found')
        }
      } catch (err) {
        console.error(err)
        setError('Error searching manifest')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleMarkRestAsShort = async () => {
    if (!manifestId) return

    if (confirm('Are you sure you want to complete this manifest? Unscanned items will be treated as short/missing.')) {
      setIsLoading(true)
      try {
        await api.completeManifest(manifestId)
        setSuccess('Manifest De-Manifested/Completed Successfully!')
        setTimeout(() => {
          if (setActivePage) {
            setActivePage('De Manifest')
          }
        }, 1500)
      } catch (err) {
        console.error(err)
        setError('Failed to complete manifest')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Filter for table
  const filteredShipments = shipments.filter(s =>
    s.cnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.manualCn && s.manualCn.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const shipmentCount = shipments.length
  const scannedCount = Object.keys(scannedCns).length
  const pendingCount = shipmentCount - scannedCount

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">

          <div className="h-8 w-[2px] bg-gray-200"></div>
          <div>
            <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
            <h1 className="text-2xl font-black text-gray-900">De-Manifest Shipments</h1>
          </div>
        </div>
        <button
          onClick={() => setActivePage('De Manifest')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-sky-600 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO LIST
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Details & Scanner */}
        <div className="lg:col-span-1 space-y-6">

          {/* Details Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-8 border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" />
              MANIFEST DETAILS
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formData.date}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-500 text-sm outline-none"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Manifest Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="manifestNumber"
                    value={formData.manifestNumber}
                    onChange={handleChange}
                    onKeyDown={handleManifestLookup}
                    placeholder="Scan Manifest Code"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-black text-sky-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" />
                </div>
              </div>

              {manifest && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Route</label>
                      <div className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {manifest.routeRelation?.routeCode || manifest.route || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle</label>
                      <div className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {manifest.vehicleNo || '-'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Driver</label>
                    <div className="font-bold text-gray-700 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {manifest.driverName || manifest.staffDriver || '-'}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Optional remarks"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>

            </div>
          </div>

          {/* Scanner Card */}
          <div className="bg-sky-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Package className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-black mb-4 relative z-10">Scan Shipments</h2>
            <div className="relative z-10">
              <label className="block text-[10px] font-bold text-sky-200 uppercase tracking-widest mb-2">Scan CN Number</label>
              <div className="relative">
                <input
                  ref={cnInputRef}
                  type="text"
                  name="cn"
                  value={formData.cn}
                  onChange={handleChange}
                  onKeyDown={handleCnLookup}
                  placeholder="E.G. 14201900001"
                  autoFocus
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl font-black text-white placeholder-white/40 focus:bg-white/20 focus:border-white outline-none transition-all"
                />
                {isLoading ? (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin" />
                ) : (
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                )}
              </div>

              {/* Stats in Scanner */}
              <div className="flex justify-between mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-sky-200 text-xs font-bold uppercase">Total</div>
                  <div className="text-2xl font-black">{shipmentCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-emerald-300 text-xs font-bold uppercase">Unloaded</div>
                  <div className="text-2xl font-black">{scannedCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-300 text-xs font-bold uppercase">Pending</div>
                  <div className="text-2xl font-black">{pendingCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Data Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">DATA PANEL</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Shipments in this manifest</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Table..."
                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-sky-500/20 md:w-48"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>

                {manifestId && (
                  <button
                    onClick={handleMarkRestAsShort}
                    className={`px-6 py-2.5 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 whitespace-nowrap
                            ${pendingCount === 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                      }`}
                  >
                    {pendingCount === 0 ? 'Complete Verified' : 'Mark Short & Complete'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[800px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">CN Number</th>
                    <th className="px-6 py-4">Origin</th>
                    <th className="px-6 py-4">Destination</th>
                    <th className="px-6 py-4">Pcs / Wgt</th>
                    <th className="px-6 py-4">Scan Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-24 px-10 text-center">
                        <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No shipments found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((item, idx) => {
                      const isScanned = !!scannedCns[item.cnNumber];
                      return (
                        <tr key={idx} className={`hover:bg-sky-50/50 transition-colors group ${isScanned ? 'bg-emerald-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            {isScanned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                                <CheckCircle className="w-3 h-3" /> Unloaded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wide">
                                <AlertCircle className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-sky-700">{item.cnNumber}</span>
                            {item.manualCn && <div className="text-[10px] text-gray-400 font-bold">{item.manualCn}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-600">{item.originCity?.cityName || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-600">{item.destinationCity?.cityName || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-gray-900">{item.pieces} PCS</span>
                              <span className="text-[10px] text-gray-500 font-bold">{item.weight} KG</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-500">
                              {scannedCns[item.cnNumber] || '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className={`fixed bottom-8 right-8 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-right-10 ${error ? 'bg-white text-red-600 border-red-100' : 'bg-white text-emerald-600 border-emerald-100'
          }`}>
          <div className={`p-2 rounded-full ${error ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
          <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
        </div>
      )}
    </div>
  )
}
