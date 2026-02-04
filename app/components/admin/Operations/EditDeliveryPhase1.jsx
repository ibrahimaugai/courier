'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, Package, User, Hash, Search, Loader2, ArrowLeft, Plus, X, Trash2, CheckCircle, Truck, Phone, MapPin } from 'lucide-react'
import { api } from '../../../lib/api'

export default function EditDeliveryPhase1({ setActivePage, sheetId }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [sheetDetails, setSheetDetails] = useState(null)
    const lastAttemptedCnRef = useRef('')

    // Form State
    const [formData, setFormData] = useState({
        date: '',
        riderName: '',
        riderMobile: '',
        vehicleNo: '',
        vehicleSize: '',
        vehicleVendor: '',
        cnNumber: ''
    })
    const [scannedConsignments, setScannedConsignments] = useState([])

    useEffect(() => {
        if (sheetId) {
            fetchSheetDetails()
        }
    }, [sheetId])

    const fetchSheetDetails = async () => {
        setIsLoading(true)
        try {
            const result = await api.getDeliverySheetDetails(sheetId)
            const data = result?.data || result
            setSheetDetails(data)

            // Parse date from sheetDate
            const sheetDate = new Date(data.sheetDate)
            setFormData(prev => ({
                ...prev,
                date: sheetDate.toISOString().split('T')[0],
                riderName: data.riderName || '',
                riderMobile: data.riderMobile || '',
                vehicleNo: data.vehicleNo || '',
                vehicleSize: data.vehicleSize || '',
                vehicleVendor: data.vehicleVendor || ''
            }))

            // Map existing shipments/bookings
            // Note: In DeliverySheet, bookings are directly linked if Booking has deliverySheetId
            const existingConsignments = data.bookings?.map(booking => ({
                ...booking,
                shipmentId: data.deliverySheetShipments?.find(s => s.bookingId === booking.id)?.id
            })) || []
            setScannedConsignments(existingConsignments)
        } catch (err) {
            console.error('Error fetching sheet details:', err)
            setError('Failed to load delivery sheet details')
        } finally {
            setIsLoading(false)
        }
    }

    const triggerCnLookup = useCallback(async (cn) => {
        const trimmedCn = cn.trim()
        if (!trimmedCn || isLoading) return

        lastAttemptedCnRef.current = trimmedCn

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
            try {
                await api.removeShipmentFromDeliverySheet(sheetId, item.shipmentId)
                setScannedConsignments(prev => prev.filter(c => c.id !== item.id))
                setSuccess('Shipment removed successfully')
            } catch (err) {
                setError(err.message || 'Failed to remove shipment')
            }
        } else {
            setScannedConsignments(prev => prev.filter(c => c.id !== item.id))
        }
    }

    const handleSaveChanges = async () => {
        const newCNs = scannedConsignments
            .filter(c => !c.shipmentId)
            .map(c => c.cnNumber)

        setIsLoading(true)
        setError('')
        try {
            const payload = {
                ...(newCNs.length > 0 && { cnNumbers: newCNs }),
                riderName: formData.riderName || undefined,
                riderMobile: formData.riderMobile || undefined,
                vehicleNo: formData.vehicleNo || undefined,
                vehicleSize: formData.vehicleSize || undefined,
                vehicleVendor: formData.vehicleVendor || undefined,
                sheetDate: formData.date ? new Date(formData.date).toISOString() : undefined
            }
            await api.updateDeliverySheet(sheetId, payload)

            setSuccess('Delivery Sheet Saved Successfully!')
            setTimeout(() => {
                if (setActivePage) setActivePage('Delivery Phase 1')
            }, 1500)
        } catch (err) {
            console.error('Error updating delivery sheet:', err)
            setError(err.message || 'Failed to update delivery sheet')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCompleteSheet = async () => {
        setIsLoading(true)
        setError('')
        try {
            await api.completeDeliverySheet(sheetId)
            setSuccess('Delivery Sheet Completed Successfully!')
            setTimeout(() => {
                if (setActivePage) setActivePage('Delivery Phase 1')
            }, 1500)
        } catch (err) {
            console.error('Error completing sheet:', err)
            setError(err.message || 'Failed to complete delivery sheet')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading && !sheetDetails) {
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
                        <h1 className="text-2xl font-black text-gray-900">Edit Delivery Sheet</h1>
                    </div>
                </div>
                <button
                    onClick={() => setActivePage('Delivery Phase 1')}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-sky-600 font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    BACK TO HISTORY
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 p-8 border border-gray-100">
                        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-sky-600" />
                            SHEET DETAILS
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
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Sheet Number</label>
                                <input
                                    type="text"
                                    value={sheetDetails?.sheetNumber || ''}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-gray-700 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rider Name</label>
                                <input
                                    type="text"
                                    value={formData.riderName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, riderName: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rider Mobile</label>
                                <input
                                    type="text"
                                    value={formData.riderMobile}
                                    onChange={(e) => setFormData(prev => ({ ...prev, riderMobile: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle Number</label>
                                <input
                                    type="text"
                                    value={formData.vehicleNo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-sky-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-32 h-32" />
                        </div>
                        <h2 className="text-xl font-black mb-4">Add More Shipments</h2>
                        <div className="relative z-10">
                            <input
                                type="text"
                                value={formData.cnNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, cnNumber: e.target.value }))}
                                onKeyDown={handleCnLookup}
                                placeholder="E.G. 14201900001"
                                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl font-black text-white focus:bg-white/20 outline-none transition-all"
                            />
                        </div>
                        <p className="mt-4 text-[10px] font-medium text-sky-100/60 uppercase italic">Press Enter to add to list</p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">DATA PANEL</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">CNs in this sheet</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">SR</th>
                                        <th className="px-6 py-4">CN NUMBER</th>
                                        <th className="px-6 py-4 text-center">WGT</th>
                                        <th className="px-6 py-4 text-center">FOD</th>
                                        <th className="px-6 py-4">STATUS</th>
                                        <th className="px-6 py-4 text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scannedConsignments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-24 px-10 text-center">
                                                <Package className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No shipments</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        scannedConsignments.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-sky-50/50 transition-colors group">
                                                <td className="px-6 py-4 text-xs font-black text-gray-400">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-sky-700">{item.cnNumber}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-xs font-bold text-gray-600">{item.weight} KG</td>
                                                <td className="px-6 py-4 text-center text-xs font-bold text-emerald-600">{item.codAmount || 0}</td>
                                                <td className="px-6 py-4">
                                                    {(item.shipmentId || item.deliverySheetId) ? (
                                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">Saved</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase tracking-widest">New</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
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
                <div className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${error ? 'bg-white text-red-600 border-red-100' : 'bg-white text-emerald-600 border-emerald-100'}`}>
                    <div className={`p-2 rounded-full ${error ? 'bg-red-50' : 'bg-emerald-50'}`}>
                        {error ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
                </div>
            )}
        </div>
    )
}
