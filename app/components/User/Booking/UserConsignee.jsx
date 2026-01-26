'use client'

export default function UserConsignee({ formData, handleInputChange, handleSubmit, isReadOnly = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mt-6">
      {/* Header */}
      <div className="bg-sky-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Consignee</h2>
      </div>

      {/* Consignee Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Row 1: Mobile Number and Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="consigneeMobileNumber"
                  value={formData.consigneeMobileNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Mobile number"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="consigneeFullName"
                  value={formData.consigneeFullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Full name"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Company Name (Full Width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="consigneeCompanyName"
                value={formData.consigneeCompanyName}
                onChange={handleInputChange}
                placeholder="Company name"
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Row 3: Address (Full Width, Textarea) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="consigneeAddress"
                value={formData.consigneeAddress}
                onChange={handleInputChange}
                required
                placeholder="Complete address"
                rows={3}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-y"
              />
            </div>

            {/* Row 4: Address2 (Full Width, Text Input) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address2
              </label>
              <input
                type="text"
                name="consigneeAddress2"
                value={formData.consigneeAddress2}
                onChange={handleInputChange}
                placeholder="Additional address"
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Row 5: Landline Number and Email Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landline Number
                </label>
                <input
                  type="text"
                  name="consigneeLandlineNumber"
                  value={formData.consigneeLandlineNumber}
                  onChange={handleInputChange}
                  placeholder="Landline number"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="consigneeEmailAddress"
                  value={formData.consigneeEmailAddress}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 6: Zip Code (Full Width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                name="consigneeZipCode"
                value={formData.consigneeZipCode}
                onChange={handleInputChange}
                placeholder="Zip code"
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

