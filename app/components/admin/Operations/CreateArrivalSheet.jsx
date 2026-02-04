'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, Package, User, Hash, Search, Loader2, ArrowLeft, Plus, Eye, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../../../lib/api'

export default function CreateArrivalSheet({ setActivePage }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const lastAttemptedCnRef = useRef('')

    // Create Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
        arrivalSheetCode: '',
        riderId: '',
        riderName: '',
        cnNumber: ''
    })
    const [scannedConsignments, setScannedConsignments] = useState([])
    const [riders, setRiders] = useState([])

    useEffect(() => {
        generateArrivalCode()
        fetchRiders()
    }, [])

    const fetchRiders = async () => {
        try {
            const result = await api.getArrivalScanRiders()
            const data = Array.isArray(result) ? result : (result?.data || [])
            setRiders(data)
        } catch (err) {
            console.error('Error fetching riders:', err)
            setRiders([])
        }
    }

    const generateArrivalCode = () => {
        const date = new Date()
        const year = date.getFullYear().toString().slice(-2)
        const random = Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)
        setFormData(prev => ({ ...prev, arrivalSheetCode: `AR${year}${random}` }))
    }

    const triggerCnLookup = useCallback(async (cn) => {
        const trimmedCn = cn.trim()
        if (!trimmedCn || isLoading) return

        lastAttemptedCnRef.current = trimmedCn

        // Check if already scanned
        if (scannedConsignments.some(item => item.cnNumber === trimmedCn)) {
            setError('CN already added to this sheet.')
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

    // Auto-fetch CN details when CN changes in search bar (debounce). Only call once per CN; do not retry same CN on failure.
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

    const handleCompleteSheet = async () => {
        if (scannedConsignments.length === 0) {
            setError('Please scan at least one consignment.')
            return
        }

        setIsLoading(true)
        setError('')
        try {
            const payload = {
                arrivalCode: formData.arrivalSheetCode,
                scanDate: new Date().toISOString(),
                riderId: formData.riderId || undefined,
                riderName: formData.riderName || undefined,
                cnNumbers: scannedConsignments.map(c => c.cnNumber)
            }
            await api.createArrivalScan(payload)
            setSuccess('Arrival Sheet Created Successfully!')
            setTimeout(() => {
                if (setActivePage) setActivePage('Arrival Scan')
            }, 1500)
        } catch (err) {
            console.error('Error completing sheet:', err)
            setError(err.message || 'Failed to create arrival sheet')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">

                    <div className="h-8 w-[2px] bg-gray-200"></div>
                    <div>
                        <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Operations</h2>
                        <h1 className="text-2xl font-black text-gray-900">Create Arrival Sheet</h1>
                    </div>
                </div>
                <button
                    onClick={() => setActivePage('Arrival Scan')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-sky-600 font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    BACK TO HISTORY
                </button>
            </div>

            {/* Create Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-8 border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-sky-600" />
                            SHEET DETAILS
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date & Time</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.date}
                                        readOnly
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-600 text-sm"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Arrival Sheet Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.arrivalSheetCode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, arrivalSheetCode: e.target.value }))}
                                        className="w-full px-4 py-3 bg-sky-50 border border-sky-100 rounded-xl font-black text-sky-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rider (Select or Enter Name)</label>
                                <div className="relative">
                                    <input
                                        list="riders-list"
                                        type="text"
                                        value={formData.riderName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const selectedRider = riders.find(r => r.name === val);
                                            setFormData(prev => ({
                                                ...prev,
                                                riderName: val,
                                                riderId: selectedRider ? selectedRider.id : ''
                                            }));
                                        }}
                                        placeholder="Select or type rider name"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                    />
                                    <datalist id="riders-list">
                                        {Array.isArray(riders) && riders.map(r => (
                                            <option key={r.id} value={r.name} />
                                        ))}
                                    </datalist>
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CN Scanner */}
                    <div className="bg-sky-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-32 h-32" />
                        </div>
                        <h2 className="text-xl font-black mb-4 relative z-10">Scan Shipments</h2>
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
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Consignments in this sheet</p>
                            </div>
                            {scannedConsignments.length > 0 && (
                                <button
                                    onClick={handleCompleteSheet}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                                    Complete Sheet
                                </button>
                            )}
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
                                        <th className="px-6 py-4">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scannedConsignments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-24 px-10 text-center">
                                                <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No shipments scanned yet</p>
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
                                                    <button
                                                        onClick={() => setScannedConsignments(prev => prev.filter(b => b.id !== item.id))}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Remove from list"
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
                        {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
                    <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
                </div>
            )}
        </div>
    )
}
