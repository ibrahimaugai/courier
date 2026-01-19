'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import {
    CheckCircle,
    XCircle,
    Search,
    Eye,
    Loader2,
    FileText,
    DollarSign,
    Package,
    User,
    MapPin
} from 'lucide-react'
import Toast from '../../Toast'

export default function BookingRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
    const [isApproving, setIsApproving] = useState(false)
    const [approveFormData, setApproveFormData] = useState({
        cnNumber: '',
        rate: '',
        otherAmount: '',
        totalAmount: 0
    })

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const response = await api.getConsignments({ status: 'PENDING' })
            setRequests(response.data || [])
        } catch (error) {
            console.error('Failed to fetch requests:', error)
            setToast({ isVisible: true, message: 'Failed to fetch pending requests', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleViewRequest = (request) => {
        setSelectedRequest(request)
        setApproveFormData({
            cnNumber: '',
            rate: request.rate || '',
            otherAmount: request.otherAmount || '',
            totalAmount: request.totalAmount || 0
        })
    }

    const handleApproveChange = (e) => {
        const { name, value } = e.target
        setApproveFormData(prev => {
            const newData = { ...prev, [name]: value }
            if (name === 'rate' || name === 'otherAmount') {
                const rate = parseFloat(newData.rate) || 0
                const other = parseFloat(newData.otherAmount) || 0
                newData.totalAmount = rate + other
            }
            return newData
        })
    }

    const handleApproveSubmission = async () => {
        if (!selectedRequest) return

        setIsApproving(true)
        try {
            await api.approveConsignment(selectedRequest.id, {
                cnNumber: approveFormData.cnNumber || undefined,
                rate: parseFloat(approveFormData.rate),
                otherAmount: parseFloat(approveFormData.otherAmount),
                totalAmount: parseFloat(approveFormData.totalAmount)
            })

            setToast({ isVisible: true, message: 'Booking approved successfully!', type: 'success' })
            setSelectedRequest(null)
            fetchRequests()
        } catch (error) {
            console.error('Approval failed:', error)
            setToast({ isVisible: true, message: error.message || 'Approval failed', type: 'error' })
        } finally {
            setIsApproving(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Booking Requests</h1>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mt-1">Review and approve user bookings</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Loader2 className={`w-5 h-5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Pending Requests</h3>
                    <p className="text-gray-500">All user bookings have been processed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-amber-400"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Pending</span>
                                    <span className="text-sm text-gray-400 font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{request.shipperName}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-sky-500" />
                                        <span>{request.originCity?.cityName} → {request.destinationCity?.cityName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Package className="w-4 h-4 text-purple-500" />
                                        <span>{request.product?.name} • {request.weight}kg</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="text-right mr-4 hidden md:block">
                                    <p className="text-xs text-gray-400 uppercase font-black">Est. Total</p>
                                    <p className="text-lg font-black text-gray-900">PKR {request.totalAmount}</p>
                                </div>
                                <button
                                    onClick={() => handleViewRequest(request)}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-sky-600 text-white rounded-lg font-bold shadow-md hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    REVIEW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail & Approval Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-scale-up overflow-hidden my-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Booking Review</h2>
                                <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-0.5">Reference ID: {selectedRequest.id.substring(0, 8)}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <XCircle className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                            {/* Request Details */}
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> SHIPPER DETAILS
                                    </h4>
                                    <div className="space-y-1 bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm font-bold text-gray-900">{selectedRequest.shipperName}</p>
                                        <p className="text-sm text-gray-600">{selectedRequest.shipperPhone}</p>
                                        <p className="text-sm text-gray-600">{selectedRequest.shipperAddress}</p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> CONSIGNEE DETAILS
                                    </h4>
                                    <div className="space-y-1 bg-gray-50 p-4 rounded-xl">
                                        <p className="text-sm font-bold text-gray-900">{selectedRequest.consigneeName}</p>
                                        <p className="text-sm text-gray-600">{selectedRequest.consigneePhone}</p>
                                        <p className="text-sm text-gray-600">{selectedRequest.consigneeAddress}</p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4" /> SHIPMENT INFO
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Weight</p>
                                            <p className="text-sm font-bold text-gray-900">{selectedRequest.weight} KG</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Pieces</p>
                                            <p className="text-sm font-bold text-gray-900">{selectedRequest.pieces}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Content</p>
                                            <p className="text-sm font-bold text-gray-900">{selectedRequest.packetContent}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Approval Form */}
                            <div className="space-y-6 bg-sky-50/50 p-6 rounded-2xl border border-sky-100">
                                <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> APPROVAL & FINALIZATION
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Final CN Number (Leave blank for auto)</label>
                                        <input
                                            type="text"
                                            name="cnNumber"
                                            value={approveFormData.cnNumber}
                                            onChange={handleApproveChange}
                                            placeholder="Auto-generate next CN"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Rate (PKR)</label>
                                            <input
                                                type="number"
                                                name="rate"
                                                value={approveFormData.rate}
                                                onChange={handleApproveChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Other Amount</label>
                                            <input
                                                type="number"
                                                name="otherAmount"
                                                value={approveFormData.otherAmount}
                                                onChange={handleApproveChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-sky-600 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                                        <span className="text-sm font-bold uppercase">Final Total</span>
                                        <span className="text-2xl font-black">PKR {approveFormData.totalAmount}</span>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleApproveSubmission}
                                            disabled={isApproving}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isApproving ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    PROCESSING...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-6 h-6" />
                                                    APPROVE & BOOK
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-gray-400 text-center mt-3 font-medium uppercase tracking-tighter italic">
                                            This will assign a CN number and activate tracking for this shipment
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    )
}
