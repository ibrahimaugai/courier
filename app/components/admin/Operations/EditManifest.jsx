'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, Package, User, Hash, Search, Loader2, ArrowLeft, Plus, X, Trash2, CheckCircle, Truck, Phone, MapPin } from 'lucide-react'
import { api } from '../../../lib/api'

export default function EditManifest({ setActivePage, manifestId }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [manifestDetails, setManifestDetails] = useState(null)
    const lastAttemptedCnRef = useRef('')

    // Form State
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        manifestSealNo: '',
        teller: '',
        staffDriver: '',
        staffDriverPhone: '',
        vehicleNo: '',
        vehicleSize: '',
        vehicleVendor: '',
        route: '',
        cnNumber: ''
    })
    const [scannedConsignments, setScannedConsignments] = useState([])

    useEffect(() => {
        if (manifestId) {
            fetchManifestDetails()
        }
    }, [manifestId])

    const fetchManifestDetails = async () => {
        setIsLoading(true)
        try {
            const result = await api.getManifestDetails(manifestId)
            const data = result?.data || result
            setManifestDetails(data)

            // Parse date and time from manifestDate
            const manifestDate = new Date(data.manifestDate)
            setFormData(prev => ({
                ...prev,
                date: manifestDate.toISOString().split('T')[0],
                time: manifestDate.toLocaleTimeString('en-US', { hour12: false }),
                manifestSealNo: data.manifestSealNo || '',
                staffDriver: data.driverName || '',
                teller: data.teller || '',
                staffDriverPhone: data.staffDriverPhone || '',
                vehicleNo: data.vehicleNo || '',
                vehicleSize: data.vehicleSize || '',
                vehicleVendor: data.vehicleVendor || '',
                route: data.route || ''
            }))

            // Map existing shipments to consignments format
            const existingConsignments = data.manifestShipments?.map(shipment => ({
                ...shipment.booking,
                shipmentId: shipment.id
            })) || []
            setScannedConsignments(existingConsignments)
        } catch (err) {
            console.error('Error fetching manifest details:', err)
            setError('Failed to load manifest details')
        } finally {
            setIsLoading(false)
        }
    }

    const triggerCnLookup = useCallback(async (cn) => {
        const trimmedCn = cn.trim()
        if (!trimmedCn || isLoading) return

        lastAttemptedCnRef.current = trimmedCn

        if (scannedConsignments.some(item => item.cnNumber === trimmedCn)) {
            setError('CN already added to this manifest.')
            setFormData(prev => ({ ...prev, cnNumber: '' }))
            return
        }

        setIsLoading(true)
        setError('')
        try {
            const result = await api.trackBooking(trimmedCn)
            const booking = result?.data || result

            if (booking) {
                setScannedConsignments(prev => [booking, ...prev])
                setSuccess(`CN ${trimmedCn} Added!`)
                setFormData(prev => ({ ...prev, cnNumber: '' }))
            } else {
                setError('Consignment not found.')
            }
        } catch (err) {
            console.error('Error lookup CN:', err)
            setError('CN not found or network error.')
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, scannedConsignments])

    const handleCnLookup = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            triggerCnLookup(formData.cnNumber)
        }
    }

    // Auto-fetch CN when CN changes in search bar (debounce). Only call once per CN; do not retry same CN on failure.
    useEffect(() => {
        const cn = formData.cnNumber.trim()
        if (cn.length < 6) return
        if (cn === lastAttemptedCnRef.current) return

        const timer = setTimeout(() => {
            lastAttemptedCnRef.current = cn
            triggerCnLookup(cn)
        }, 500)
        return () => clearTimeout(timer)
    }, [formData.cnNumber, triggerCnLookup])

    const handleRemoveConsignment = async (item) => {
        if (item.shipmentId) {
            // This is an existing shipment, need to call API to remove
            try {
                await api.removeShipmentFromManifest(manifestId, item.shipmentId)
                setScannedConsignments(prev => prev.filter(c => c.id !== item.id))
                setSuccess('Shipment removed successfully')
            } catch (err) {
                setError(err.message || 'Failed to remove shipment')
            }
        } else {
            // This is a newly added item, just remove from local state
            setScannedConsignments(prev => prev.filter(c => c.id !== item.id))
        }
    }

    const handleSaveChanges = async () => {
        // Get only newly added CNs (those without shipmentId)
        const newCNs = scannedConsignments
            .filter(c => !c.shipmentId)
            .map(c => c.cnNumber)

        setIsLoading(true)
        setError('')
        try {
            // Always update the manifest with all fields
            const payload = {
                ...(newCNs.length > 0 && { cnNumbers: newCNs }),
                driverName: formData.staffDriver || undefined,
                manifestSealNo: formData.manifestSealNo || undefined,
                teller: formData.teller || undefined,
                staffDriverPhone: formData.staffDriverPhone || undefined,
                vehicleNo: formData.vehicleNo || undefined,
                vehicleSize: formData.vehicleSize || undefined,
                vehicleVendor: formData.vehicleVendor || undefined,
                route: formData.route || undefined
            }
            await api.updateManifest(manifestId, payload)

            setSuccess('Manifest Saved Successfully!')
            setTimeout(() => {
                if (setActivePage) setActivePage('Manifest')
            }, 1500)
        } catch (err) {
            console.error('Error updating manifest:', err)
            setError(err.message || 'Failed to update manifest')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCompleteManifest = async () => {
        setIsLoading(true)
        setError('')
        try {
            await api.completeManifest(manifestId)
            setSuccess('Manifest Completed Successfully!')
            setTimeout(() => {
                if (setActivePage) setActivePage('Manifest')
            }, 1500)
        } catch (err) {
            console.error('Error completing manifest:', err)
            setError(err.message || 'Failed to complete manifest')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading && !manifestDetails) {
        return (
            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-sky-600" />
            </div>
        )
    }

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">

                    <div className="h-8 w-[2px] bg-gray-200"></div>
                    <div>
                        <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
                        <h1 className="text-2xl font-black text-gray-900">Edit Manifest</h1>
                    </div>
                </div>
                <button
                    onClick={() => setActivePage('Manifest')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-sky-600 font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    BACK TO HISTORY
                </button>
            </div>

            {/* Edit Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-8 border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-sky-600" />
                            MANIFEST DETAILS
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Time</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Manifest Sheet Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={manifestDetails?.manifestCode || ''}
                                        readOnly
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-gray-700 text-sm"
                                    />
                                    <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Manifest Seal No</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.manifestSealNo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, manifestSealNo: e.target.value }))}
                                        placeholder="e.g. 090126030705"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Teller</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.teller}
                                        onChange={(e) => setFormData(prev => ({ ...prev, teller: e.target.value }))}
                                        placeholder="Teller name"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Staff / Driver</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.staffDriver}
                                        onChange={(e) => setFormData(prev => ({ ...prev, staffDriver: e.target.value }))}
                                        placeholder="e.g. Muhammad Saim"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Staff / Driver Phone</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.staffDriverPhone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, staffDriverPhone: e.target.value }))}
                                        placeholder="e.g. 03334616162"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle No / Tracking Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.vehicleNo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                                        placeholder="e.g. LEK-17-1155"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <Truck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle Size</label>
                                <div className="relative">
                                    <select
                                        value={formData.vehicleSize}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleSize: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none appearance-none"
                                    >
                                        <option value="">Select Vehicle Size</option>
                                        <option value="10 Feet">10 Feet</option>
                                        <option value="20 Feet">20 Feet</option>
                                        <option value="40 Feet">40 Feet</option>
                                        <option value="Small Van">Small Van</option>
                                        <option value="Large Van">Large Van</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle Vendor</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.vehicleVendor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleVendor: e.target.value }))}
                                        placeholder="e.g. PMGT"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Route</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.route}
                                        onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                                        placeholder="e.g. LHE-KHI"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total CNs</label>
                                <div className="px-4 py-3 bg-sky-50 border border-sky-100 rounded-xl font-black text-sky-700 text-sm">
                                    {scannedConsignments.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CN Scanner */}
                    <div className="bg-sky-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-32 h-32" />
                        </div>
                        <h2 className="text-xl font-black mb-4 relative z-10">Add More Shipments</h2>
                        <div className="relative z-10">
                            <label className="block text-[10px] font-bold text-sky-200 uppercase tracking-widest mb-2">Enter CN Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.cnNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cnNumber: e.target.value }))}
                                    onKeyDown={handleCnLookup}
                                    placeholder="E.G. 14201900001"
                                    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl font-black text-white placeholder-white/40 focus:bg-white/20 focus:border-white outline-none transition-all"
                                />
                                {isLoading ? (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                                )}
                            </div>
                            <p className="mt-4 text-[10px] font-medium text-sky-100/60 uppercase tracking-tighter italic">Press Enter to add to list</p>
                        </div>
                    </div>
                </div>

                {/* Data Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">DATA PANEL</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Consignments in this manifest</p>
                            </div>
                            <button
                                onClick={handleSaveChanges}
                                className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">SR</th>
                                        <th className="px-6 py-4">CN NUMBER</th>
                                        <th className="px-6 py-4">ORIGIN</th>
                                        <th className="px-6 py-4">DESTINATION</th>
                                        <th className="px-6 py-4">PCS/WGT</th>
                                        <th className="px-6 py-4">STATUS</th>
                                        <th className="px-6 py-4">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scannedConsignments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-24 px-10 text-center">
                                                <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No shipments in this manifest</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        scannedConsignments.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-sky-50/50 transition-colors group">
                                                <td className="px-6 py-4 text-xs font-black text-gray-400">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-sky-700">{item.cnNumber}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-600">{item.originCity?.cityName || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-600">{item.destinationCity?.cityName || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-900">{item.pieces} PCS</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">{item.weight} KG</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.shipmentId ? (
                                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase">Saved</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase">New</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleRemoveConsignment(item)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {(error || success) && (
                <div className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${error ? 'bg-white text-red-600 border-red-100' : 'bg-white text-emerald-600 border-emerald-100'
                    }`}>
                    <div className={`p-2 rounded-full ${error ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        {error ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
                    <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
                </div>
            )}
        </div>
    )
}
