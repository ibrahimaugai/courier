'use client'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

export default function CnAllocation() {
  const [stationCode, setStationCode] = useState('')
  const [formData, setFormData] = useState({
    productId: '',
    cn: '',
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      const response = await api.getConfiguration()
      const responseData = response.data || response
      const config = responseData.config || (responseData.stationCode ? responseData : null)

      if (config && config.stationCode) {
        setStationCode(config.stationCode)
      }
    } catch (error) {
      console.error('Failed to fetch configuration:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSave = () => {
    setMessage({ type: '', text: '' })
    const { productId, cn } = formData

    if (!productId || !cn || String(cn).trim() === '') {
      setMessage({ type: 'error', text: 'Please select a product and enter Cn.' })
      return
    }

    try {
      const existingAllocations = JSON.parse(localStorage.getItem('cnAllocations') || '{}')
      const cnValue = String(cn).trim()
      existingAllocations[productId] = { next: cnValue }
      localStorage.setItem('cnAllocations', JSON.stringify(existingAllocations))
      setMessage({ type: 'success', text: `Cn ${cnValue} allocated successfully. It will increment on each booking.` })
      setFormData(prev => ({ ...prev, cn: '' }))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      setMessage({ type: 'error', text: 'Failed to save allocation.' })
    }
  }

  return (
    <div className="max-w-7xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">CN Allocation</h1>
      </div>

      {/* CN Allocation Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">CN Allocation (Consignment Number)</h2>

        {message.text && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-5">
          {/* Select Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white">
              <option value="">Select Product</option>
              <option value="General">General</option>
              <option value="International">International</option>
              <option value="OLE">OLE</option>
              <option value="Logistics">Logistics</option>
              <option value="Sentiments">Sentiments</option>
              <option value="COD">COD</option>
            </select>
          </div>

          {/* Cn – single value; booking will increment it on use */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cn
            </label>
            <input
              type="text"
              name="cn"
              value={formData.cn}
              onChange={handleChange}
              placeholder="Enter Cn (e.g. 123111)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This value is used for the next booking and increments automatically after each booking.
            </p>
          </div>

          {/* Station Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Station Code
            </label>
            <input
              type="text"
              value={stationCode}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Station code is set from system configuration
            </p>
          </div>

          {/* ADD RECORD Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-sky-600 text-white font-bold uppercase rounded-md hover:bg-sky-700 transition-colors shadow-md">
              ADD RECORD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

