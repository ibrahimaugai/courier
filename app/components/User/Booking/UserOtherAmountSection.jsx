'use client'

import { Printer, Save, Loader2 } from 'lucide-react'

export default function UserOtherAmountSection({
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  isReadOnly = false,
  buttonLabel = 'Save Booking'
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-6 font-sans">
      <form onSubmit={handleSubmit}>
        {/* Important Notice */}
        <div className="mb-6 bg-sky-50 border border-sky-100 rounded-md p-4">
          <p className="text-sm text-sky-800 italic">
            <strong>Note:</strong> Final shipping charges and amount will be calculated and confirmed by the Admin after reviewing your booking request.
          </p>
        </div>

        {/* Bottom Section: Total Amount and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Total Amount Display */}
          <div className="border border-sky-100 rounded-md px-6 py-3 bg-sky-50 shadow-sm border-l-4 border-l-sky-600">
            <span className="text-sm font-medium text-sky-700">Estimated Amount: </span>
            <span className="text-xl font-bold text-sky-900">PKR {formData.totalAmount ? formData.totalAmount.toLocaleString() : '0'}</span>
            <span className="text-[10px] block text-sky-600 mt-1">* Pending admin approval</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full sm:w-auto">
            {!isReadOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors flex items-center gap-2 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {buttonLabel}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
