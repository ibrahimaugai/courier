'use client'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../../lib/api'
import { printBookingSlip, printCodSlip } from '../../lib/bookingSlipPrint'
import { Loader2, Search, Printer } from 'lucide-react'

export default function CnReprint() {
  const user = useSelector((state) => state.auth?.user)
  const [cnNumber, setCnNumber] = useState('')
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!cnNumber.trim()) return

    setIsLoading(true)
    setError('')
    setBookingData(null)

    try {
      const result = await api.trackBooking(cnNumber)
      const data = result.data || result // Handle unwrapped or wrapped response

      if (data) {
        setBookingData(data)
      } else {
        setError('No booking found with this CN Number.')
      }
    } catch (err) {
      console.error('Error fetching booking:', err)
      // Standard Error objects have a .message string
      setError(err.message || 'Failed to fetch booking details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl">
      {/* Header Section */}
      <div className="mb-6">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">CN Reprint</h1>
        </div>
      </div>

      {/* Reprint Form Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Reprint Consignment Number</h2>

        {/* Input Field with Search Button */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter CN Number
            </label>
            <input
              type="text"
              value={cnNumber}
              onChange={(e) => setCnNumber(e.target.value)}
              placeholder="Enter CN Number to search"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium shadow-md flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}
      </div>

      {bookingData && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8 animate-fade-in">
          {/* Reprint CN - Print booking slip */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                let config = {}
                try {
                  const res = await api.getConfiguration()
                  const data = res?.data?.config ?? res?.config ?? (res?.stationCode ? res : null)
                  if (data) config = { ...data }
                } catch (_) {}
                config.staffCode = config.staffCode ?? user?.staffCode
                config.username = config.username ?? config.updatedByUser?.username ?? user?.username
                const isCod = bookingData.product && (bookingData.product.productName === 'COD' || bookingData.product.productCode === 'COD')
                if (isCod) {
                  printCodSlip(bookingData, { config })
                } else {
                  printBookingSlip(bookingData, { config })
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium shadow-md"
            >
              <Printer className="w-5 h-5" />
              Reprint CN
            </button>
          </div>

          {/* Top Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">CN Number</h3>
              <p className="text-lg font-bold text-gray-900">{bookingData.cnNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Booking Date</h3>
              <p className="text-lg font-semibold text-gray-900">
                {bookingData.bookingDate ? new Date(bookingData.bookingDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Current Status</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {bookingData.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Origin</h3>
              <p className="text-base font-semibold text-gray-900">
                {bookingData.originCity?.cityName || bookingData.originCity?.name || bookingData.originCityId || '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Destination</h3>
              <p className="text-base font-semibold text-gray-900">
                {bookingData.destinationCity?.cityName || bookingData.destinationCity?.name || bookingData.destinationCityId || '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Product / Service</h3>
              <p className="text-base font-semibold text-gray-900">
                {bookingData.product?.productName || bookingData.product?.name || bookingData.productId || '-'}
                {' / '}
                {bookingData.service?.serviceName || bookingData.service?.name || bookingData.serviceId || '-'}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Shipper & Consignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipper */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Shipper Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{bookingData.shipperName || bookingData.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone:</span>
                  <span className="text-sm font-medium text-gray-900">{bookingData.shipperPhone || bookingData.customer?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Address:</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                    {bookingData.shipperAddress || bookingData.customer?.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Consignee */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Consignee Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{bookingData.consigneeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phone:</span>
                  <span className="text-sm font-medium text-gray-900">{bookingData.consigneePhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Address:</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                    {bookingData.consigneeAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Shipment Info & Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Shipment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500">Pieces</span>
                  <span className="block text-sm font-medium text-gray-900">{bookingData.pieces}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Weight</span>
                  <span className="block text-sm font-medium text-gray-900">{bookingData.weight} kg</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-gray-500">Packet Content</span>
                  <span className="block text-sm font-medium text-gray-900">{bookingData.packetContent}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Charges</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Rate:</span>
                  <span className="text-sm font-semibold text-gray-900">{bookingData.rate}</span>
                </div>
                {bookingData.otherAmount && parseFloat(bookingData.otherAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Other Charges:</span>
                    <span className="text-sm font-semibold text-gray-900">{bookingData.otherAmount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-800">Total Amount:</span>
                  <span className="text-base font-bold text-green-600">PKR {bookingData.totalAmount}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-xs font-medium text-gray-500">Payment Mode:</span>
                  <span className="text-xs font-bold text-gray-700">{bookingData.paymentMode || bookingData.payMode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

