'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock } from 'lucide-react'

export default function OnTimeDeliveryModal({
  isOpen,
  onClose,
  initialDate = '',
  initialTime = '',
  onConfirm,
}) {
  const [deliveryDate, setDeliveryDate] = useState(initialDate || '')
  const [deliveryTime, setDeliveryTime] = useState(initialTime || '')

  useEffect(() => {
    if (isOpen) {
      setDeliveryDate(initialDate || '')
      setDeliveryTime(initialTime || '')
    }
  }, [isOpen, initialDate, initialTime])

  const handleConfirm = () => {
    if (!deliveryDate.trim()) return
    const date = deliveryDate.trim()
    const time = (deliveryTime || '09:00').trim()
    onConfirm(date, time)
    onClose()
  }

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">On Time Service – Delivery Date & Time</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600">
            Select the date and time when the package will be delivered so the customer is informed.
          </p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 pointer-events-none" />
              <input
                type="date"
                value={deliveryDate}
                min={today}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 pointer-events-none" />
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!deliveryDate.trim()}
            className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
