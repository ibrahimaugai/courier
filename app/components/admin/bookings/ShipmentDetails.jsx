'use client'

import React, { useMemo } from 'react'

// Attestation removed from list; attestation services appear under General
const PRODUCT_TYPES = ['General', 'International', 'OLE', 'Logistics', 'Sentiments', 'COD']
const ATTESTATION_SERVICE_VALUES = [
  'ATS - Doc MOFA Attestation',
  'ATR - Doc MOFA Home Delivery',
  'APN - Apostille Normal',
  'APU - Apostille Urgent',
  'AE - UAE Embassy',
  'BV - Board Verification',
  'HEC - HEC',
  'IBCC - IBCC',
  'National Bureau',
]

// Blue Box weight-tier services: 1kg–10kg, then 15, 20, 25kg. "Blue Box" (generic) is excluded.
const BLUE_BOX_WEIGHT_SERVICES = [
  ...Array.from({ length: 10 }, (_, i) => `Blue Box ${i + 1}kg`),
  'Blue Box 15kg',
  'Blue Box 20kg',
  'Blue Box 25kg',
]

export default function ShipmentDetails({
  formData,
  handleInputChange,
  handleSubmit,
  selectedDocuments = [],
  selectedApostilleDocuments = [],
  selectedUaeEmbassyDocuments = [],
  selectedBoardVerificationDocuments = [],
  selectedHecDocuments = [],
  selectedIbccDocuments = [],
  selectedNationalBureauDocuments = [],
  onOpenDocumentModal,
  onFileChange,
  cnAllocationError,
  cities = [],
  services = [], // New prop
  selectedSubservices = [],
  onOpenSubservicesModal,
  subservicesData = {},
  onOpenOnTimeDeliveryModal,
}) {
  const isOnTimeService = formData.product === 'General' && formData.services === 'On Time Service'
  const hasPreferredDelivery = !!(formData.preferredDeliveryDate || formData.preferredDeliveryTime)
  const formatDeliveryDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T12:00:00')
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  const formatDeliveryTime = (timeStr) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':').map(Number)
    if (h === 12) return `12:${String(m || 0).padStart(2, '0')} PM`
    if (h === 0) return `12:${String(m || 0).padStart(2, '0')} AM`
    return `${h > 12 ? h - 12 : h}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }
  // Get all active operational cities
  const activeCities = cities
    .filter(city => city && city.status === 'active')
    .sort((a, b) => a.cityName.localeCompare(b.cityName))

  // Get available products (service types) - Fixed whitelist
  const availableProducts = PRODUCT_TYPES

  // Get available services for the selected product
  const availableServices = useMemo(() => {
    if (!services || !Array.isArray(services) || !formData.product) return []
    
    // For General product: General services + Blue Box tiers + all attestation services
    if (formData.product === 'General') {
      const fromDb = services
        .filter(s => s.serviceType === 'General')
        .map(s => ({ value: s.serviceName, label: s.serviceName }))
        .filter(s => s.value !== 'Blue Box')
        .sort((a, b) => a.label.localeCompare(b.label))
      const blueBoxOptions = BLUE_BOX_WEIGHT_SERVICES.map(name => ({ value: name, label: name }))
      const attestationOptions = ATTESTATION_SERVICE_VALUES.map(name => ({ value: name, label: name }))
      return [...fromDb, ...blueBoxOptions, ...attestationOptions]
    }
    
    // Regular services for other products
    return services
      .filter(s => s.serviceType === formData.product)
      .map(s => ({ value: s.serviceName, label: s.serviceName }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [services, formData.product])

  // When a Blue Box Xkg service is selected, weight and volumetric weight are locked to X kg
  const blueBoxWeightMatch = formData.services && formData.services.match(/^Blue Box (\d+)kg$/)
  const isWeightLockedForBlueBox = Boolean(blueBoxWeightMatch)
  const lockedWeightKg = blueBoxWeightMatch ? blueBoxWeightMatch[1] : ''

  // Check if current service is an attestation service that needs subservices (by service name; product can be General)
  const isAttestationService = useMemo(() => {
    return formData.services ? ATTESTATION_SERVICE_VALUES.includes(formData.services) : false
  }, [formData.services])

  // Determine which document section to show based on selected service
  const getDocumentSectionInfo = () => {
    const service = formData.services || ''

    // Handle attestation services with subservices
    if (isAttestationService) {
      return {
        heading: `${service.toUpperCase()} SUBSERVICES`,
        documentCount: selectedSubservices.length,
        onOpen: () => onOpenSubservicesModal?.(),
      }
    }

    if (service === 'ATS - Doc MOFA Attestation' || service === 'ATR - Doc MOFA Home Delivery') {
      return {
        heading: 'MOFA ATTESTATION DOCUMENTS',
        documentCount: selectedDocuments.length,
        onOpen: () => onOpenDocumentModal?.('mofa')
      }
    }

    if (service === 'APN - Apostille Normal' || service === 'APU - Apostille Urgent') {
      return {
        heading: 'APOSTILLE DOCUMENTS',
        documentCount: selectedApostilleDocuments.length,
        onOpen: () => onOpenDocumentModal?.('apostille')
      }
    }

    if (service === 'AE - UAE Embassy') {
      return {
        heading: 'UAE EMBASSY DOCUMENTS',
        documentCount: selectedUaeEmbassyDocuments.length,
        onOpen: () => onOpenDocumentModal?.('uaeEmbassy')
      }
    }

    if (service === 'BV - Board Verification') {
      return {
        heading: 'BOARD VERIFICATION DOCUMENTS',
        documentCount: selectedBoardVerificationDocuments.length,
        onOpen: () => onOpenDocumentModal?.('boardVerification')
      }
    }

    if (service === 'HEC - HEC') {
      return {
        heading: 'HEC DOCUMENTS',
        documentCount: selectedHecDocuments.length,
        onOpen: () => onOpenDocumentModal?.('hec')
      }
    }

    if (service === 'IBCC - IBCC') {
      return {
        heading: 'IBCC DOCUMENTS',
        documentCount: selectedIbccDocuments.length,
        onOpen: () => onOpenDocumentModal?.('ibcc')
      }
    }

    if (service === 'National Bureau') {
      return {
        heading: 'NATIONAL BUREAU DOCUMENTS',
        documentCount: selectedNationalBureauDocuments.length,
        onOpen: () => onOpenDocumentModal?.('nationalBureau')
      }
    }

    return null
  }

  const documentSection = getDocumentSectionInfo()

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-sky-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Shipment Details</h2>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
                >
                  <option value="" disabled>Select Product</option>
                  {availableProducts.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>

              {/* Origin City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin City <span className="text-red-500">*</span>
                </label>
                <select
                  name="originCity"
                  value={formData.originCity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
                >
                  <option value="">Select Origin</option>
                  {activeCities.map(city => (
                    <option key={`origin-${city.id}`} value={city.id}>
                      {city.cityName} ({city.cityCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination <span className="text-red-500">*</span>
                </label>
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
                >
                  <option value="">Select Destination</option>
                  {activeCities.map(city => (
                    <option key={`dest-${city.id}`} value={city.id}>
                      {city.cityName} ({city.cityCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* CN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CN Number
                </label>
                <input
                  type="text"
                  name="cnNumber"
                  value={formData.cnNumber}
                  onChange={handleInputChange}
                  placeholder="Auto-generated CN"
                  readOnly
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none transition-colors ${cnAllocationError
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                />
                {cnAllocationError && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {cnAllocationError}
                  </p>
                )}
              </div>

              {/* Pieces */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pieces
                </label>
                <input
                  type="number"
                  name="pieces"
                  value={formData.pieces}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Handling Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handling Instructions
                </label>
                <select
                  name="handlingInstructions"
                  value={formData.handlingInstructions || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
                >
                  <option value="">Select handling instructions</option>
                  <option value="Special Handling">Special Handling</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Original Documents">Original Documents</option>
                  <option value="Handle with Care">Handle with Care</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks || ''}
                  onChange={handleInputChange}
                  placeholder="Enter remarks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>

              {/* COD Amount (when product is COD) */}
              {formData.product === 'COD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Amount
                  </label>
                  <input
                    type="number"
                    name="codAmount"
                    value={formData.codAmount || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Amount to collect on delivery"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">Order Amount will be added to the total amount</p>
                </div>
              )}

              {/* Customer Ref # */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Ref #
                </label>
                <input
                  type="text"
                  name="customerRef"
                  value={formData.customerRef || ''}
                  onChange={handleInputChange}
                  placeholder="Enter customer reference"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Packet Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Packet Content <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="packetContent"
                  value={formData.packetContent}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter packet contents"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services <span className="text-red-500">*</span>
                </label>
                <select
                  name="services"
                  value={formData.services}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.product || availableServices.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {!formData.product ? 'Select Product First' : availableServices.length === 0 ? 'No services available' : 'Select Service'}
                  </option>
                  {availableServices.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
                {/* On Time Service – delivery date/time preview */}
                {isOnTimeService && (
                  <div className="mt-2 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                    <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">Preferred delivery (On Time Service)</p>
                    {hasPreferredDelivery ? (
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formData.preferredDeliveryDate && formatDeliveryDate(formData.preferredDeliveryDate)}
                          {formData.preferredDeliveryDate && formData.preferredDeliveryTime && ' at '}
                          {formData.preferredDeliveryTime && formatDeliveryTime(formData.preferredDeliveryTime)}
                        </span>
                        {onOpenOnTimeDeliveryModal && (
                          <button
                            type="button"
                            onClick={onOpenOnTimeDeliveryModal}
                            className="text-xs font-semibold text-sky-600 hover:text-sky-800 underline"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Select date & time in the pop-up or click service again to open.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pay Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="payMode"
                  value={formData.payMode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
                >
                  <option value="" disabled>Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              {/* Volumetric Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volumetric Weight
                </label>
                <input
                  type="number"
                  name="volumetricWeight"
                  value={isWeightLockedForBlueBox ? lockedWeightKg : formData.volumetricWeight}
                  onChange={handleInputChange}
                  placeholder="0"
                  disabled={isWeightLockedForBlueBox}
                  readOnly={isWeightLockedForBlueBox}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-gray-100"
                />
                {isWeightLockedForBlueBox && (
                  <p className="mt-1 text-xs text-sky-600">Set by selected service (Blue Box {lockedWeightKg}kg)</p>
                )}
              </div>

              {/* Weight/Kg */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight/Kg <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={isWeightLockedForBlueBox ? lockedWeightKg : formData.weight}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter weight"
                  disabled={isWeightLockedForBlueBox}
                  readOnly={isWeightLockedForBlueBox}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-gray-100"
                />
                {isWeightLockedForBlueBox && (
                  <p className="mt-1 text-xs text-sky-600">Set by selected service (Blue Box {lockedWeightKg}kg)</p>
                )}
              </div>
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-1">Estimated Total</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-sky-900">PKR {parseFloat(formData.totalAmount || 0).toLocaleString()}</span>
                  <span className="text-sm text-sky-600 font-medium">(Incl. all charges)</span>
                </div>
                {/* Show subservices total if applicable */}
                {isAttestationService && selectedSubservices && selectedSubservices.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-sky-200">
                    <p className="text-xs text-gray-600">
                      Subservices: <span className="font-semibold text-sky-700">
                        PKR {(() => {
                          const currentSubservices = subservicesData[formData.services] || []
                          const total = selectedSubservices.reduce((sum, id) => {
                            const subservice = currentSubservices.find((s) => s.id === id)
                            return sum + (subservice ? subservice.price : 0)
                          }, 0)
                          return total.toLocaleString('en-PK')
                        })()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Chargeable Weight</p>
                <p className="text-lg font-bold text-gray-700">
                  {Math.max(parseFloat(formData.weight || 0), parseFloat(formData.volumetricWeight || 0))} kg
                </p>
              </div>
            </div>
          </div>

          {/* Document Selection Section */}
          {documentSection && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-sky-600">{documentSection.heading}</h3>
                  <span className="text-sm text-gray-600">
                    {documentSection.documentCount === 0
                      ? 'No documents selected'
                      : `${documentSection.documentCount} document${documentSection.documentCount > 1 ? 's' : ''} selected`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={documentSection.onOpen}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
                >
                  {documentSection.documentCount > 0 ? 'Edit' : 'Select Documents'}
                </button>
              </div>
              {/* File Upload for Documents */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document Files (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && onFileChange) {
                      onFileChange(e)
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload document files (JPG, PNG, PDF, DOC, DOCX). Max 10MB per file.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
