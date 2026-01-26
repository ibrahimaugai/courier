'use client'

export default function UserShipper({ formData, handleInputChange, handleSubmit, isReadOnly = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mt-6">
      {/* Header */}
      <div className="bg-sky-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Shipper</h2>
      </div>

      {/* Shipper Form */}
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
                  name="mobileNumber"
                  value={formData.mobileNumber}
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
                  name="fullName"
                  value={formData.fullName}
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
                name="companyName"
                value={formData.companyName}
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
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Complete address"
                rows={3}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-y"
              />
            </div>

            {/* Row 4: Address2 (Full Width, Textarea) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address2
              </label>
              <textarea
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                placeholder="Additional address"
                rows={3}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-y"
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
                  name="landlineNumber"
                  value={formData.landlineNumber}
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
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 6: CNIC Number (Full Width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNIC Number
              </label>
              <input
                type="text"
                name="cnicNumber"
                value={formData.cnicNumber}
                onChange={handleInputChange}
                placeholder="CNIC number"
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

