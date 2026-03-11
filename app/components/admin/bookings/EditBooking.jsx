'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Loader2, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../../../lib/api'
import ShipmentDetails from './ShipmentDetails'
import Shipper from './Shipper'
import Consignee from './Consignee'
import OtherAmountSection from './OtherAmountSection'
import Toast from '../../Toast'

export default function EditBooking() {
    const [cnNumber, setCnNumber] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState('')
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
    const [bookingId, setBookingId] = useState(null)

    const [formData, setFormData] = useState({
        product: '',
        destination: '',
        originCity: '',
        cnNumber: '',
        pieces: '1',
        handlingInstructions: '',
        remarks: '',
        packetContent: '',
        services: '',
        payMode: '',
        volumetricWeight: '0',
        weight: '',
        // Shipper
        mobileNumber: '',
        fullName: '',
        companyName: '',
        address: '',
        address2: '',
        landlineNumber: '',
        emailAddress: '',
        cnicNumber: '',
        // Consignee
        consigneeMobileNumber: '',
        consigneeFullName: '',
        consigneeCompanyName: '',
        consigneeAddress: '',
        consigneeAddress2: '',
        consigneeLandlineNumber: '',
        consigneeEmailAddress: '',
        consigneeZipCode: '',
        // Pricing
        otherAmount: '',
        codAmount: '',
        rate: '',
        totalAmount: 0,
        dcReferenceNo: '',
        customerRef: '',
    })
    const [showUserModal, setShowUserModal] = useState(false)
    const [users, setUsers] = useState([])
    const [userSearchTerm, setUserSearchTerm] = useState('')
    const [selectedAccountUser, setSelectedAccountUser] = useState(null)

    const { rules: reduxRules, cities, services } = useSelector((state) => state.pricing)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!cnNumber.trim()) return

        setIsLoading(true)
        setError('')
        setBookingId(null)

        try {
            const result = await api.trackBooking(cnNumber)
            const data = result.data || result

            if (data) {
                setBookingId(data.id)
                // Map API data to form data
                setFormData({
                    product: data.product?.productName || data.productId || '',
                    destination: data.destinationCityId || '',
                    originCity: data.originCityId || '',
                    cnNumber: data.cnNumber || '',
                    pieces: data.pieces?.toString() || '1',
                    handlingInstructions: (() => {
                        const raw = data.handlingInstructions || ''
                        return raw.includes('%%%REMARKS%%%') ? (raw.split('%%%REMARKS%%%')[0] || '').trim() : raw
                    })(),
                    remarks: (() => {
                        const raw = data.handlingInstructions || ''
                        return raw.includes('%%%REMARKS%%%') ? (raw.split('%%%REMARKS%%%')[1] || '').trim() : ''
                    })(),
                    packetContent: data.packetContent || '',
                    services: data.service?.serviceName || data.serviceId || '',
                    payMode: data.paymentMode === 'CASH' ? 'Cash' : (data.paymentMode === 'ACCOUNT' ? 'Account' : 'Online'),
                    volumetricWeight: data.volumetricWeight?.toString() || '0',
                    weight: data.weight?.toString() || '',
                    // Shipper
                    mobileNumber: data.shipperPhone || '',
                    fullName: data.shipperName || '',
                    companyName: data.shipperCompanyName || '',
                    address: data.shipperAddress || '',
                    address2: data.shipperAddress2 || '',
                    landlineNumber: data.shipperLandline || '',
                    emailAddress: data.shipperEmail || '',
                    cnicNumber: data.shipperCnic || '',
                    // Consignee
                    consigneeMobileNumber: data.consigneePhone || '',
                    consigneeFullName: data.consigneeName || '',
                    consigneeCompanyName: data.consigneeCompanyName || '',
                    consigneeAddress: data.consigneeAddress || '',
                    consigneeAddress2: data.consigneeAddress2 || '',
                    consigneeLandlineNumber: data.consigneeLandline || '',
                    consigneeEmailAddress: data.consigneeEmail || '',
                    consigneeZipCode: data.consigneeZipCode || '',
                    // Pricing
                    otherAmount: data.otherAmount?.toString() || '',
                    codAmount: data.codAmount?.toString() || '',
                    rate: data.rate?.toString() || '0',
                    totalAmount: parseFloat(data.totalAmount || 0),
                    customerRef: data.dcReferenceNo || '',
                })
            } else {
                setError('No booking found with this CN Number.')
            }
        } catch (err) {
            console.error('Error fetching booking:', err)
            setError(err.message || 'Failed to fetch booking details.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Trigger user modal if Account is selected
        if (name === 'payMode' && value === 'Account') {
            setShowUserModal(true)
            if (users.length === 0) {
                api.getUsers()
                    .then(data => {
                        const allUsers = Array.isArray(data) ? data : (data?.data || [])
                        setUsers(allUsers.filter(u => u.role === 'USER' && u.isActive))
                    })
                    .catch(err => console.error('Error fetching users:', err))
            }
        }
    }

    const handleUserSelect = (selectedUser) => {
        setSelectedAccountUser(selectedUser)
        setFormData(prev => ({
            ...prev,
            fullName: selectedUser.username,
            mobileNumber: selectedUser.phone || '', // May be empty
            dcReferenceNo: selectedUser.staffCode || selectedUser.username,
        }))
        setShowUserModal(false)
    }

    const filteredUsers = users.filter(u =>
    (u.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.staffCode?.toLowerCase().includes(userSearchTerm.toLowerCase()))
    )

    // Rate Calculation Logic (same as BookingConsignment)
    useEffect(() => {
        if (!bookingId) return

        const calculateRate = () => {
            if (!formData.originCity || !formData.destination || !formData.services || !formData.product) {
                return parseFloat(formData.rate) || 0
            }

            const physicalWeight = parseFloat(formData.weight || '0')
            const volumetricWeight = parseFloat(formData.volumetricWeight || '0')
            const applicableWeight = Math.max(physicalWeight, volumetricWeight)

            if (applicableWeight <= 0) return 0

            const matchingRule = reduxRules.find(rule =>
                rule.originCityId === formData.originCity &&
                rule.destinationCityId === formData.destination &&
                rule.service?.serviceName === formData.services &&
                applicableWeight >= rule.weightFrom &&
                applicableWeight < rule.weightTo
            )

            return matchingRule ? matchingRule.baseRate : (parseFloat(formData.rate) || 0)
        }

        const calculatedRate = calculateRate()
        const pieces = parseInt(formData.pieces || '1')
        const otherAmount = parseFloat(formData.otherAmount || '0')
        const codAmt = parseFloat(formData.codAmount || '0') || 0
        const shippingCharges = (calculatedRate * pieces) + otherAmount
        const totalAmount = formData.payMode === 'Account' ? 0 : (formData.product === 'COD' ? shippingCharges + codAmt : shippingCharges)

        setFormData(prev => ({
            ...prev,
            rate: calculatedRate.toString(),
            totalAmount: totalAmount
        }))
    }, [
        formData.originCity,
        formData.destination,
        formData.services,
        formData.product,
        formData.weight,
        formData.volumetricWeight,
        formData.pieces,
        formData.otherAmount,
        formData.codAmount,
        reduxRules,
        bookingId
    ])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!bookingId) return

        setIsUpdating(true)
        try {
            const updateData = {
                productId: formData.product,
                serviceId: formData.services,
                destinationCityId: formData.destination,
                originCityId: formData.originCity,
                pieces: parseInt(formData.pieces || '1'),
                handlingInstructions: (formData.handlingInstructions || formData.remarks)
                    ? [formData.handlingInstructions, formData.remarks].filter(Boolean).join('%%%REMARKS%%%')
                    : undefined,
                codAmount: formData.product === 'COD' ? parseFloat(formData.codAmount || '0') || undefined : undefined,
                dcReferenceNo: formData.dcReferenceNo || undefined,
                packetContent: formData.packetContent,
                paymentMode: formData.payMode === 'Cash' ? 'CASH' : (formData.payMode === 'Account' ? 'ACCOUNT' : 'ONLINE'),
                volumetricWeight: parseFloat(formData.volumetricWeight || '0'),
                weight: parseFloat(formData.weight),
                chargeableWeight: Math.max(parseFloat(formData.weight || '0'), parseFloat(formData.volumetricWeight || '0')),

                // Shipper
                shipperPhone: formData.mobileNumber,
                shipperName: formData.fullName,
                shipperCompanyName: formData.companyName,
                shipperAddress: formData.address,
                shipperAddress2: formData.address2,
                shipperLandline: formData.landlineNumber,
                shipperEmail: formData.emailAddress,
                shipperCnic: formData.cnicNumber,

                // Consignee
                consigneePhone: formData.consigneeMobileNumber,
                consigneeName: formData.consigneeFullName,
                consigneeCompanyName: formData.consigneeCompanyName,
                consigneeAddress: formData.consigneeAddress,
                consigneeAddress2: formData.consigneeAddress2,
                consigneeLandline: formData.consigneeLandlineNumber,
                consigneeEmail: formData.consigneeEmailAddress,
                consigneeZipCode: formData.consigneeZipCode,

                // Pricing
                rate: parseFloat(formData.rate),
                otherAmount: parseFloat(formData.otherAmount || '0'),
                totalAmount: formData.totalAmount
            }

            await api.updateBooking(bookingId, updateData)

            setToast({
                isVisible: true,
                message: 'Booking updated successfully!',
                type: 'success'
            })
        } catch (err) {
            console.error('Error updating booking:', err)
            setToast({
                isVisible: true,
                message: err.message || 'Failed to update booking',
                type: 'error'
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Edit Booking</h1>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CN Number
                        </label>
                        <input
                            type="text"
                            value={cnNumber}
                            onChange={(e) => setCnNumber(e.target.value)}
                            placeholder="Enter CN Number to search"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium h-[42px] flex items-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Search
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>

            {bookingId && (
                <div className="space-y-6 animate-fade-in">
                    <ShipmentDetails
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        cities={cities}
                        services={services}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Shipper
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                        />
                        <Consignee
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                        />
                    </div>

                    <OtherAmountSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                    />

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setBookingId(null)}
                            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-bold uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isUpdating}
                            className="px-8 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-all font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg hover:shadow-sky-200 disabled:opacity-70"
                        >
                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Update Booking
                        </button>
                    </div>

                    {/* User Selection Modal (for ACCOUNT pay mode) */}
                    {showUserModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
                                {/* Modal Header */}
                                <div className="bg-sky-600 px-6 py-4 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Select Account User</h3>
                                    <button
                                        onClick={() => setShowUserModal(false)}
                                        className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Search */}
                                <div className="p-4 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search by username or staff code..."
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="max-h-[400px] overflow-y-auto p-4">
                                    {filteredUsers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 italic">
                                            No users found matching your search.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredUsers.map((u) => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => handleUserSelect(u)}
                                                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all text-left"
                                                >
                                                    <div>
                                                        <div className="font-bold text-gray-900">{u.username}</div>
                                                        <div className="text-sm text-gray-500">Code: {u.staffCode || 'N/A'}</div>
                                                    </div>
                                                    <div className="text-sky-600 font-medium">Select →</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                                    <button
                                        onClick={() => setShowUserModal(false)}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
