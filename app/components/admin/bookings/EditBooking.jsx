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
        rate: '',
        totalAmount: 0,
    })

    const { rules: reduxRules, cities } = useSelector((state) => state.pricing)

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
                    handlingInstructions: data.handlingInstructions || '',
                    packetContent: data.packetContent || '',
                    services: data.service?.serviceName || data.serviceId || '',
                    payMode: data.paymentMode === 'CASH' ? 'Cash' : 'Online',
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
                    rate: data.rate?.toString() || '0',
                    totalAmount: parseFloat(data.totalAmount || 0),
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
    }

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
        const totalAmount = (calculatedRate * pieces) + otherAmount

        setFormData(prev => ({
            ...prev,
            rate: calculatedRate.toString(),
            totalAmount: totalAmount
        }))
    }, [
        formData.originCity,
        formData.destination,
        formData.services,
        formData.weight,
        formData.volumetricWeight,
        formData.pieces,
        formData.otherAmount,
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
                handlingInstructions: formData.handlingInstructions,
                packetContent: formData.packetContent,
                paymentMode: formData.payMode === 'Cash' ? 'CASH' : 'ONLINE',
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
                <span className="text-sm text-green-600 font-medium">VER -1.863 LIVE</span>
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
                </div>
            )}
        </div>
    )
}
