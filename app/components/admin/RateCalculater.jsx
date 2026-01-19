'use client'

export default function RateCalculator() {
  return (
    <div className="max-w-7xl">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img src="/nps-logo.png" alt="NPS Logo" className="h-12 w-auto" />
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Rate Calculator</h1>
          <span className="text-sm text-green-600 font-medium">VER -1.863 LIVE</span>
        </div>
      </div>

      {/* Calculate Shipment Rate Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Calculate Shipment Rate</h2>
        
        <div className="space-y-5">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin
            </label>
            <input
              type="text"
              value="Sialkot"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Origin is set from system configuration
            </p>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
              <option value="">Select Destination</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
              <option value="">Select Service</option>
            </select>
          </div>

          {/* Weight and Pieces - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight (kg) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="Enter weight"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Pieces */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pieces
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Calculate Rate Button */}
          <div className="pt-4">
            <button className="w-full py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors shadow-md">
              Calculate Rate
            </button>
          </div>
        </div>
      </div>

      {/* Rate Information Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rate Information</h2>
        <ul className="space-y-2 list-disc list-inside text-gray-700">
          <li>Rates are calculated based on weight, destination, and service type</li>
          <li>Overnight service includes premium delivery charges</li>
          <li>Blue Box services have standardized rates by weight</li>
          <li>Weight is calculated per kg with minimum 1kg charge</li>
          <li>Additional charges may apply for special handling</li>
          <li>Origin station is automatically set from system configuration</li>
        </ul>
      </div>
    </div>
  )
}

