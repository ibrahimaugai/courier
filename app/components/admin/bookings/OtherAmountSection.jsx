'use client'

import { Printer, Save, Loader2 } from 'lucide-react'

export default function OtherAmountSection({ formData, handleInputChange, handleSubmit, isSubmitting = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Rate Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              required
              placeholder="Enter rate"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Other Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Amount (Add/Subtract from total)
            </label>
            <input
              type="number"
              name="otherAmount"
              value={formData.otherAmount}
              onChange={handleInputChange}
              placeholder="Enter additional amount (+ or -)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Bottom Section: Total Amount and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Total Amount Display */}
          <div className="border-2 border-sky-600 rounded-md px-6 py-3 bg-white">
            <span className="text-sm font-medium text-gray-700">Total Amount: </span>
            <span className="text-lg font-bold text-gray-900">PKR {formData.totalAmount ? formData.totalAmount.toLocaleString() : '0'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="px-6 py-2 border-2 border-sky-600 text-sky-600 bg-white rounded-md hover:bg-sky-50 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <Printer className="w-4 h-4" />
              Print CN
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors flex items-center gap-2 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Booking
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

