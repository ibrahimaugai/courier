'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, X, AlertCircle, Info } from 'lucide-react'

export default function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const Icon = icons[type] || CheckCircle

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md ${colors[type]}`}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded hover:bg-opacity-20 transition-colors ${iconColors[type]}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

