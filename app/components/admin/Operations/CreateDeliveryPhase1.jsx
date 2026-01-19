'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, Package, User, Hash, Search, Loader2, ArrowLeft, Truck, MapPin, CheckCircle, AlertCircle, Phone, FileText } from 'lucide-react'
import { api } from '../../../lib/api'

export default function CreateDeliveryPhase1({ setActivePage }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        sheetCode: 'DD' + new Date().getFullYear().toString().slice(-2) + Math.floor(Math.random() * 1000000000),
        riderId: '',
        riderSearch: '', // For input display
        riderMobile: '',
        routeId: '',
        routeSearch: '', // For input display
        vehicleNo: '',
        vehicleSize: '',
        vehicleVendor: '',
        cn: ''
    })

    const [shipments, setShipments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [riders, setRiders] = useState([])
    const [routes, setRoutes] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const cnInputRef = useRef(null)

    useEffect(() => {
        fetchDrivers()
        fetchRoutes()
    }, [])

    const fetchDrivers = async () => {
        try {
            const res = await api.getManifestDrivers()
            setRiders(Array.isArray(res) ? res : (res.data || []))
        } catch (e) {
            console.error("Failed to fetch riders", e)
        }
    }

    const fetchRoutes = async () => {
        try {
            const res = await api.getDeliverySheetRoutes()
            const data = Array.isArray(res) ? res : (res.data || [])
            setRoutes(data.map(r => ({ id: r.id, name: r.routeName || r.name })))
        } catch (e) {
            console.error("Failed to fetch routes", e)
            setRoutes([{ id: 'mock-route-1', name: 'LHR-ISL' }])
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleRiderChange = (e) => {
        const val = e.target.value
        setFormData(prev => ({ ...prev, riderSearch: val }))

        // Try to find match to auto-fill details, but allow custom
        const match = riders.find(r => r.name.toLowerCase() === val.toLowerCase())
        if (match) {
            setFormData(prev => ({ ...prev, riderId: match.id, riderSearch: val, riderMobile: match.phone || prev.riderMobile }))
        } else {
            // No match? No problem. Clear ID but keep text.
            setFormData(prev => ({ ...prev, riderId: '', riderSearch: val }))
        }
    }

    const handleRouteChange = (e) => {
        const val = e.target.value
        setFormData(prev => ({ ...prev, routeSearch: val }))

        const match = routes.find(r => r.name.toLowerCase() === val.toLowerCase())
        if (match) {
            setFormData(prev => ({ ...prev, routeId: match.id, routeSearch: val }))
        } else {
            setFormData(prev => ({ ...prev, routeId: '', routeSearch: val }))
        }
    }

    const handleCnKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const cn = formData.cn.trim()
            if (!cn) return

            if (shipments.some(s => s.cn === cn)) {
                setError('CN already scanned')
                setFormData(prev => ({ ...prev, cn: '' }))
                return
            }

            setIsLoading(true)
            try {
                const res = await api.trackBooking(cn)
                const booking = res.data || res
                if (booking) {
                    const newShipment = {
                        sr: shipments.length + 1,
                        cn: booking.cnNumber,
                        status: 'Pending',
                        origin: booking.originCity?.cityName || 'N/A',
                        weight: booking.weight,
                        pieces: booking.pieces,
                        fod: booking.codAmount || '0',
                        scannedAt: new Date().toLocaleTimeString()
                    }
                    setShipments([newShipment, ...shipments])
                    setSuccess(`CN ${cn} Scanned!`)
                } else {
                    setError('CN Not Found')
                }
            } catch (err) {
                setError('Error tracking CN')
            } finally {
                setIsLoading(false)
                setFormData(prev => ({ ...prev, cn: '' }))
            }
        }
    }

    const handleSave = async () => {
        if (!formData.riderSearch) {
            setError('Please enter a Rider Name')
            return
        }
        if (shipments.length === 0) {
            setError('Please scan at least one shipment')
            return
        }

        setIsLoading(true)
        try {
            const payload = {
                sheetDate: new Date(formData.date).toISOString(),
                riderId: formData.riderId || undefined, // Optional ID
                riderName: formData.riderSearch, // Always send name
                riderMobile: formData.riderMobile,
                routeId: formData.routeId || undefined,
                vehicleNo: formData.vehicleNo,
                vehicleSize: formData.vehicleSize,
                vehicleVendor: formData.vehicleVendor,
                cnNumbers: shipments.map(s => s.cn)
            }

            await api.createDeliverySheet(payload)
            setSuccess('Delivery Sheet Created!')
            setTimeout(() => {
                if (setActivePage) setActivePage('Delivery Phase 1')
            }, 1500)
        } catch (err) {
            setError('Failed to create sheet: ' + err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <img src="/nps-logo.png" alt="NPS Logo" className="h-12 w-auto" />
                    <div className="h-8 w-[2px] bg-gray-200"></div>
                    <div>
                        <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
                        <h1 className="text-2xl font-black text-gray-900">Create Delivery Phase 1 (On Route)</h1>
                    </div>
                </div>
                <button
                    onClick={() => setActivePage('Delivery Phase 1')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-sky-600 font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    BACK TO LIST
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column: Form & Scanner */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-6 border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-sky-600" />
                            SHEET DETAILS
                        </h2>

                        <div className="space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                                <input
                                    type="text"
                                    value={formData.date}
                                    readOnly
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs"
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Delivery Sheet Code</label>
                                <input
                                    type="text"
                                    value={formData.sheetCode}
                                    readOnly
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs"
                                />
                            </div>

                            {/* Rider - Searchable */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rider</label>
                                <div className="relative">
                                    <input
                                        list="riders-list"
                                        type="text"
                                        name="riderSearch"
                                        value={formData.riderSearch}
                                        onChange={handleRiderChange}
                                        placeholder="Type to search rider..."
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
                                    />
                                    <datalist id="riders-list">
                                        {riders.map(r => <option key={r.id} value={r.name} />)}
                                    </datalist>
                                </div>
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rider Mobile</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="riderMobile"
                                        value={formData.riderMobile}
                                        onChange={handleChange}
                                        placeholder="0300..."
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-xs outline-none focus:ring-2 focus:ring-sky-500/20 pl-10"
                                    />
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Route - Searchable */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Route</label>
                                <div className="relative">
                                    <input
                                        list="routes-list"
                                        type="text"
                                        name="routeSearch"
                                        value={formData.routeSearch}
                                        onChange={handleRouteChange}
                                        placeholder="Type to search route..."
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-xs focus:ring-2 focus:ring-sky-500/20 outline-none"
                                    />
                                    <datalist id="routes-list">
                                        {routes.map(r => <option key={r.id} value={r.name} />)}
                                    </datalist>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle No</label>
                                    <input
                                        type="text"
                                        name="vehicleNo"
                                        value={formData.vehicleNo}
                                        onChange={handleChange}
                                        placeholder="LEK-17-..."
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Size</label>
                                    <input
                                        type="text"
                                        name="vehicleSize"
                                        value={formData.vehicleSize}
                                        onChange={handleChange}
                                        placeholder="e.g 20ft"
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vendor</label>
                                    <input
                                        type="text"
                                        name="vehicleVendor"
                                        value={formData.vehicleVendor}
                                        onChange={handleChange}
                                        placeholder="e.g TMC"
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Scanner Card */}
                    <div className="bg-sky-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-32 h-32" />
                        </div>
                        <h2 className="text-xl font-black mb-4 relative z-10">Scan Shipments</h2>
                        <div className="relative z-10">
                            <input
                                ref={cnInputRef}
                                type="text"
                                name="cn"
                                value={formData.cn}
                                onChange={handleChange}
                                onKeyDown={handleCnKeyDown}
                                placeholder="Scan CN"
                                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl font-black text-white placeholder-white/40 focus:bg-white/20 focus:border-white outline-none transition-all"
                            />
                        </div>

                        {/* Stats - Button removed from here */}
                        <div className="mt-6 pt-6 border-t border-white/20 text-center">
                            <div className="text-sky-200 text-xs font-bold uppercase">Total Scanned</div>
                            <div className="text-3xl font-black">{shipments.length}</div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Data Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">SCANNED SHIPMENTS</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Items added to sheet</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-sky-600 text-white rounded-lg font-black text-xs uppercase hover:bg-sky-700 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Create Sheet
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="px-6 py-4">SR</th>
                                        <th className="px-6 py-4">CN Number</th>
                                        <th className="px-6 py-4">Origin</th>
                                        <th className="px-6 py-4">Pcs / Wgt</th>
                                        <th className="px-6 py-4">Scan Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {shipments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 px-10 text-center">
                                                <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No shipments scanned</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        shipments.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">{row.sr}</td>
                                                <td className="px-6 py-4 text-sm font-black text-sky-700">{row.cn}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-600">{row.origin}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-gray-900">{row.pieces} PCS</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">{row.weight} KG</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">{row.scannedAt}</td>
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
