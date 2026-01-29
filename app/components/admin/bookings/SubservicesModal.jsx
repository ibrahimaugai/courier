'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { api } from '../../../lib/api'

export default function SubservicesModal({
  isOpen,
  onClose,
  serviceName,
  selectedSubservices = [],
  onSubservicesChange,
  onSubservicesDataLoaded,
}) {
  const [localSelected, setLocalSelected] = useState(selectedSubservices)
  const [subservices, setSubservices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch subservices from backend when modal opens or serviceName changes
  useEffect(() => {
    if (isOpen && serviceName) {
      setLoading(true)
      setError(null)
      // Reset localSelected when service changes to avoid stale selections
      setLocalSelected(selectedSubservices || [])
      api
        .getSubservices(serviceName)
        .then((data) => {
          const subservicesData = Array.isArray(data) ? data : data?.data || []
          setSubservices(subservicesData)
          // Notify parent component about loaded subservices data
          if (onSubservicesDataLoaded) {
            onSubservicesDataLoaded(serviceName, subservicesData)
          }
          // Clean up localSelected to only include valid IDs
          setLocalSelected((prev) => {
            const valid = prev.filter((id) => subservicesData.some((s) => s.id === id))
            return valid
          })
        })
        .catch((err) => {
          console.error('Error fetching subservices:', err)
          setError('Failed to load subservices. Please try again.')
          setSubservices([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (!isOpen) {
      // Reset when modal closes
      setSubservices([])
    }
  }, [isOpen, serviceName, selectedSubservices])

  const handleToggle = (subserviceId) => {
    setLocalSelected((prev) => {
      if (prev.includes(subserviceId)) {
        return prev.filter((id) => id !== subserviceId)
      } else {
        return [...prev, subserviceId]
      }
    })
  }

  const handleConfirm = () => {
    // Only pass valid selected IDs
    onSubservicesChange(validSelectedIds)
    onClose()
  }

  const handleCancel = () => {
    setLocalSelected(selectedSubservices) // Reset to original selection
    onClose()
  }

  // Filter localSelected to only include IDs that exist in current subservices
  const validSelectedIds = localSelected.filter((id) =>
    subservices.some((s) => s.id === id)
  )

  const totalAmount = validSelectedIds.reduce((total, id) => {
    const subservice = subservices.find((s) => s.id === id)
    return total + (subservice ? subservice.price : 0)
  }, 0)

  // Update localSelected to remove invalid IDs when subservices change
  useEffect(() => {
    if (subservices.length > 0) {
      setLocalSelected((prev) => {
        const valid = prev.filter((id) => subservices.some((s) => s.id === id))
        // Only update if there's a difference to avoid infinite loops
        if (valid.length !== prev.length) {
          return valid
        }
        return prev
      })
    }
  }, [subservices])

  if (!isOpen || !serviceName) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Select Subservices for {serviceName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Available Subservices</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Available Subservices Section */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Available Subservices</h4>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-red-300 rounded-md bg-red-50">
                <p className="text-red-600">{error}</p>
              </div>
            ) : subservices.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-400">No subservices available for this service</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subservices.map((subservice) => {
                  const isSelected = validSelectedIds.includes(subservice.id)
                  return (
                    <div
                      key={subservice.id}
                      className={`flex items-start gap-3 p-3 rounded-md border transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-300 shadow-sm'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="relative flex items-center mt-1">
                        <input
                          type="checkbox"
                          id={`subservice-${subservice.id}`}
                          checked={isSelected}
                          onChange={() => handleToggle(subservice.id)}
                          className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 cursor-pointer"
                        />
                      </div>
                      <label
                        htmlFor={`subservice-${subservice.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="text-sm font-medium text-gray-900">{subservice.name}</div>
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          PKR {subservice.price.toLocaleString('en-PK')}
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Selected Subservices Section */}
          <div className="w-1/2 p-6 overflow-y-auto flex flex-col bg-gray-50">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Subservices</h4>
            {localSelected.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-400">No subservices selected</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 flex-1 mb-4">
                  {validSelectedIds.map((subserviceId) => {
                    const subservice = subservices.find((s) => s.id === subserviceId)
                    return subservice ? (
                      <div
                        key={subserviceId}
                        className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {subservice.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            PKR {subservice.price.toLocaleString('en-PK')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle(subserviceId)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
                {/* Total Amount Display */}
                <div className="mt-auto pt-4 border-t border-gray-300 bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-sky-600">
                      PKR {totalAmount.toLocaleString('en-PK')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {validSelectedIds.length} subservice{validSelectedIds.length !== 1 ? 's' : ''}{' '}
                    selected
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium shadow-md"
          >
            Confirm Selection ({validSelectedIds.length})
          </button>
        </div>
      </div>
    </div>
  )
}
