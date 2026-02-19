'use client'

import { useState } from 'react'
import { Pencil, Loader2, X } from 'lucide-react'

export default function AttestationPricingTable({ services, onUpdateRate }) {
    const [editingService, setEditingService] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'PKR 0'
        return `PKR ${parseFloat(amount).toLocaleString('en-PK')}`
    }

    const handleEdit = (service) => {
        setEditingService({
            id: service.id,
            serviceName: service.serviceName,
            days: service.days || '',
            baseRate: service.baseRate || 0,
            addPageRate: service.additionalCharges || 0,
            ruleId: service.ruleId
        })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setIsUpdating(true)
        try {
            await onUpdateRate(editingService.ruleId, {
                baseRate: parseFloat(editingService.baseRate),
                additionalCharges: editingService.addPageRate ? parseFloat(editingService.addPageRate) : null
            })
            setEditingService(null)
        } catch (error) {
            console.error('Error updating rate:', error)
            alert('Failed to update rate')
        } finally {
            setIsUpdating(false)
        }
    }

    // Group services by category (aligned with new attestation categories)
    const inferCategory = (svc) => {
        const cat = (svc.attestationCategory || '').trim()
        if (cat) {
            const map = { ATS: 'ATS - Doc MOFA Attestation', ATR: 'ATR - Doc MOFA Home Delivery', APN: 'APN - Apostille Normal', APU: 'APU - Apostille Urgent', AE: 'AE - UAE Embassy', BV: 'BV - Board Verification', HEC: 'HEC - HEC', IBCC: 'IBCC - IBCC', NationalBureau: 'National Bureau' }
            return map[cat] || cat
        }
        const name = (svc.serviceName || '').toLowerCase()
        if (name.includes('mofa') && (name.includes('doc') || name.includes('attestation'))) return 'ATS - Doc MOFA Attestation'
        if (name.includes('mofa') && name.includes('home delivery')) return 'ATR - Doc MOFA Home Delivery'
        if (name.includes('apostille') && name.includes('normal')) return 'APN - Apostille Normal'
        if (name.includes('apostille') && (name.includes('urgent') || name.includes('urgnt'))) return 'APU - Apostille Urgent'
        if (name.includes('uae') && name.includes('embassy')) return 'AE - UAE Embassy'
        if (name.includes('board') && name.includes('verification')) return 'BV - Board Verification'
        if (name.includes('hec')) return 'HEC - HEC'
        if (name.includes('ibcc')) return 'IBCC - IBCC'
        if (name.includes('national bureau') || name.includes('national beuro')) return 'National Bureau'
        return 'Other'
    }

    const groupedServices = services.reduce((acc, service) => {
        const category = inferCategory(service)
        if (!acc[category]) acc[category] = []
        acc[category].push(service)
        return acc
    }, {})

    const categoryOrder = [
        'ATS - Doc MOFA Attestation',
        'ATR - Doc MOFA Home Delivery',
        'APN - Apostille Normal',
        'APU - Apostille Urgent',
        'AE - UAE Embassy',
        'BV - Board Verification',
        'HEC - HEC',
        'IBCC - IBCC',
        'National Bureau',
        'Other'
    ]

    return (
        <div className="space-y-8">
            {categoryOrder.map(category => {
                const categoryServices = groupedServices[category]
                if (!categoryServices || categoryServices.length === 0) return null

                return (
                    <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4">
                            <h3 className="text-lg font-black text-white">{category}</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            Sr
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            Service
                                        </th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            Days
                                        </th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            Rate
                                        </th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            Add Page Rate
                                        </th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categoryServices.map((service, idx) => (
                                        <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                {service.serviceName}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                {service.days || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-sky-600">
                                                    {formatCurrency(service.baseRate)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-black text-emerald-600">
                                                    {service.additionalCharges ? formatCurrency(service.additionalCharges) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="p-2 text-sky-600 hover:bg-sky-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                    title="Edit Rate"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}

            {/* Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-sky-600 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Update Attestation Rate</h3>
                                <p className="text-sky-100 text-[10px] font-bold tracking-widest uppercase">{editingService.serviceName}</p>
                            </div>
                            <button
                                onClick={() => setEditingService(null)}
                                className="text-white hover:bg-sky-500 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                    <span>Service</span>
                                    <span className="text-sky-600">{editingService.serviceName}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                    <span>Processing Time</span>
                                    <span className="text-sky-600">{editingService.days || 'N/A'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Base Rate (PKR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">PKR</span>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        value={editingService.baseRate}
                                        onChange={e => setEditingService(prev => ({ ...prev, baseRate: e.target.value }))}
                                        className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-lg font-black text-gray-900 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Add Page Rate (PKR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">PKR</span>
                                    <input
                                        type="number"
                                        value={editingService.addPageRate}
                                        onChange={e => setEditingService(prev => ({ ...prev, addPageRate: e.target.value }))}
                                        className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-lg font-black text-gray-900 transition-all"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full bg-sky-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-sky-100 disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
