'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Edit, Package, Loader2, CheckCircle, AlertCircle, ArrowLeft, Lock } from 'lucide-react'
import { fetchBookingById, updateBooking, clearBookingsError } from '../../lib/store'
import Toast from '../Toast'
import UserShipmentDetails from './Booking/UserShipmentDetails'
import UserShipper from './Booking/UserShipper'
import UserConsignee from './Booking/UserConsignee'
import UserOtherAmountSection from './Booking/UserOtherAmountSection'

export default function EditBooking({ selectedShipment, setActivePage, setSelectedShipment }) {
  const dispatch = useDispatch()
  const { isLoading, error, currentBooking } = useSelector((state) => state.bookings)
  const [success, setSuccess] = useState(false)
  const [localError, setLocalError] = useState('')
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })

  const [formData, setFormData] = useState({
    product: '',
    destination: '',
    cnNumber: '',
    pieces: '1',
    handlingInstructions: '',
    packetContent: '',
    services: '',
    payMode: '',
    volumetricWeight: '0',
    weight: '',
    // Shipper fields
    mobileNumber: '',
    fullName: '',
    companyName: '',
    address: '',
    address2: '',
    landlineNumber: '',
    emailAddress: '',
    cnicNumber: '',
    // Consignee fields
    consigneeMobileNumber: '',
    consigneeFullName: '',
    consigneeCompanyName: '',
    consigneeAddress: '',
    consigneeAddress2: '',
    consigneeLandlineNumber: '',
    consigneeEmailAddress: '',
    consigneeZipCode: '',
    // Other Amount
    otherAmount: '',
    totalAmount: 0,
    originCity: '',
  })

  // Fetch booking data on mount
  useEffect(() => {
    const bookingId = selectedShipment?.id || selectedShipment?.originalBooking?.id

    if (bookingId) {
      dispatch(fetchBookingById(bookingId))
    }
  }, [selectedShipment, dispatch])

  // Track which booking is currently loaded in the form
  const [loadedBookingId, setLoadedBookingId] = useState(null)
  // Track if we have already populated from the full booking data
  const [hasPopulatedFullData, setHasPopulatedFullData] = useState(false)

  const [isDirty, setIsDirty] = useState(false)

  // Populate form when booking data is loaded
  useEffect(() => {
    const booking = currentBooking || selectedShipment?.originalBooking || selectedShipment
    const bookingId = booking?.id
    if (!bookingId) return

    const isFullData = !!currentBooking

    // Populate if:
    // 1. It's a completely different booking (ID changed)
    // 2. OR we only had partial data before and now we have full data from currentBooking
    // AND the user hasn't started typing yet (unless it's a new booking ID)
    if (bookingId !== loadedBookingId || (isFullData && !hasPopulatedFullData && !isDirty)) {
      // Helper to match dropdown values (Code - CityName)
      const formatCity = (city) => {
        if (!city) return ''
        if (city.cityCode && city.cityName) {
          return `${city.cityCode} - ${city.cityName}`
        }
        return city.cityName || city.cityCode || ''
      }

      // Helper to match dropdown values (Code - Name)
      const formatDropdownValue = (item, idField, codeField, nameField) => {
        if (!item) return booking[idField] || ''
        const code = item[codeField]
        const name = item[nameField]

        if (!code && !name) return booking[idField] || ''
        if (!code) return name
        if (!name) return code

        const codeClean = code.toLowerCase().trim()
        const nameClean = name.toLowerCase().trim()

        if (codeClean === nameClean) return name
        // If name already contains code, just use name (e.g. Code "INTL", Name "INTL - DOCUMENTS")
        if (nameClean.includes(codeClean)) return name

        return `${code} - ${name}`
      }

      setFormData({
        product: booking.product?.productName || booking.productId || '',
        destination: formatCity(booking.destinationCity) || booking.destinationCityId || '',
        cnNumber: booking.cnNumber || '',
        pieces: booking.pieces?.toString() || '1',
        handlingInstructions: booking.handlingInstructions || '',
        packetContent: booking.packetContent || '',
        services: formatDropdownValue(booking.service, 'serviceId', 'serviceCode', 'serviceName'),
        payMode: (booking.paymentMode || booking.payMode) === 'ONLINE' ? 'Online' : 'Cash',
        volumetricWeight: booking.volumetricWeight?.toString() || '0',
        weight: booking.weight?.toString() || '',

        // Financials (Handling Prisma Decimal as strings)
        rate: booking.rate?.toString() || '0',
        otherAmount: booking.otherAmount?.toString() || '0',
        totalAmount: parseFloat(booking.totalAmount?.toString() || '0'),
        codAmount: booking.codAmount?.toString() || '0',
        declaredValue: booking.declaredValue?.toString() || '0',

        // Shipper fields
        mobileNumber: booking.shipperPhone || booking.customer?.phone || '',
        fullName: booking.shipperName || booking.customer?.name || '',
        companyName: booking.shipperCompanyName || booking.customer?.companyName || '',
        address: booking.shipperAddress || booking.customer?.address || '',
        address2: booking.shipperAddress2 || '',
        landlineNumber: booking.shipperLandline || '',
        emailAddress: booking.shipperEmail || booking.customer?.email || '',
        cnicNumber: booking.shipperCnic || booking.customer?.cnic || '',

        // Consignee fields
        consigneeMobileNumber: booking.consigneePhone || '',
        consigneeFullName: booking.consigneeName || '',
        consigneeCompanyName: booking.consigneeCompanyName || '',
        consigneeAddress: booking.consigneeAddress || '',
        consigneeAddress2: booking.consigneeAddress2 || '',
        consigneeLandlineNumber: booking.consigneeLandline || '',
        consigneeEmailAddress: booking.consigneeEmail || '',
        consigneeZipCode: booking.consigneeZipCode || '',
        originCity: formatCity(booking.originCity) || booking.originCityId || '',
      })
      setLoadedBookingId(bookingId)
      setHasPopulatedFullData(isFullData)
      if (bookingId !== loadedBookingId) {
        setIsDirty(false)
      }
    }
  }, [currentBooking, selectedShipment, loadedBookingId, hasPopulatedFullData, isDirty])

  const rawStatus = currentBooking?.status || selectedShipment?.originalBooking?.status || selectedShipment?.status
  const isEditable = rawStatus === 'PENDING' || rawStatus === 'BOOKED' || rawStatus === 'PICKUP_REQUESTED'
  const isReadOnly = !isEditable
  const displayStatus = rawStatus?.replace('_', ' ') || 'Unknown'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setIsDirty(true)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (localError || error) {
      setLocalError('')
      dispatch(clearBookingsError())
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setSuccess(false)
    setLocalError('')
    dispatch(clearBookingsError())

    if (!isEditable) {
      setLocalError(`This booking cannot be edited because its status is ${displayStatus}.`)
      return
    }

    const bookingId = selectedShipment?.id || selectedShipment?.originalBooking?.id || currentBooking?.id

    if (!bookingId) {
      setLocalError('No booking ID found')
      return
    }

    try {
      const updateData = {
        productId: formData.product || null,
        serviceId: formData.services || null,
        destinationCityId: formData.destination || null,
        originCityId: formData.originCity || null,
        pieces: parseInt(formData.pieces || '1'),
        handlingInstructions: formData.handlingInstructions || null,
        packetContent: formData.packetContent || '',
        payMode: formData.payMode === 'Online' ? 'ONLINE' : 'CASH',
        weight: parseFloat(formData.weight || '0'),
        volumetricWeight: parseFloat(formData.volumetricWeight || '0') || null,

        // Financials
        rate: parseFloat(formData.rate || '0'),
        otherAmount: parseFloat(formData.otherAmount || '0'),
        totalAmount: parseFloat(formData.totalAmount || '0'),
        codAmount: parseFloat(formData.codAmount || '0'),
        declaredValue: parseFloat(formData.declaredValue || '0'),

        // Shipper Info
        mobileNumber: formData.mobileNumber || null,
        fullName: formData.fullName || null,
        companyName: formData.companyName || null,
        address: formData.address || null,
        address2: formData.address2 || null,
        landlineNumber: formData.landlineNumber || null,
        emailAddress: formData.emailAddress || null,
        cnicNumber: formData.cnicNumber || null,

        // Consignee Info
        consigneeMobileNumber: formData.consigneeMobileNumber || null,
        consigneeFullName: formData.consigneeFullName || null,
        consigneeCompanyName: formData.consigneeCompanyName || null,
        consigneeAddress: formData.consigneeAddress || null,
        consigneeAddress2: formData.consigneeAddress2 || null,
        consigneeLandlineNumber: formData.consigneeLandlineNumber || null,
        consigneeEmailAddress: formData.consigneeEmailAddress || null,
        consigneeZipCode: formData.consigneeZipCode || null,
      }

      const result = await dispatch(updateBooking({ id: bookingId, bookingData: updateData }))

      if (updateBooking.fulfilled.match(result)) {
        setSuccess(true)
        setToast({
          isVisible: true,
          message: 'Booking updated successfully!',
          type: 'success'
        })
        // Reset population flag to sync with the confirmed record from the server
        setHasPopulatedFullData(false)

        setTimeout(() => {
          setSuccess(false)
          setActivePage?.('My Shipments')
        }, 2000)
      } else {
        const errorMsg = result.payload || result.error?.message || 'Failed to update booking'
        setLocalError(errorMsg)
        setToast({
          isVisible: true,
          message: errorMsg,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      setLocalError(error.message || 'Failed to update booking')
    }
  }

  const handleBack = () => {
    setSelectedShipment?.(null)
    setActivePage?.('My Shipments')
  }

  if (isLoading && !formData.cnNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading booking details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isReadOnly ? 'View Booking' : 'Edit Booking'}
          </h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shipments
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {isReadOnly && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 shadow-sm">
          <Lock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium mb-1">Booking in Read-Only Mode</p>
            <p className="text-yellow-700 text-sm">
              This booking current status is "{displayStatus}". You can only view the details as it's no longer editable.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">Booking updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Error Message */}
      {(error || localError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error || localError}</p>
        </div>
      )}

      {/* Main Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <UserShipmentDetails
          formData={formData}
          handleInputChange={handleInputChange}
          isReadOnly={isReadOnly}
        />

        <UserShipper
          formData={formData}
          handleInputChange={handleInputChange}
          isReadOnly={isReadOnly}
        />

        <UserConsignee
          formData={formData}
          handleInputChange={handleInputChange}
          isReadOnly={isReadOnly}
        />

        <UserOtherAmountSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isSubmitting={isLoading}
          isReadOnly={isReadOnly}
          buttonLabel="Update Booking"
        />
      </form>

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={5000}
      />
    </div>
  )
}
