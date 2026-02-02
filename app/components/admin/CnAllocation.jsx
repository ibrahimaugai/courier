'use client'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'

export default function CnAllocation() {
  const [stationCode, setStationCode] = useState('')
  const [formData, setFormData] = useState({
    productId: '',
    startCnNumber: '',
    endCnNumber: '',
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
    const { productId, startCnNumber, endCnNumber } = formData

    if (!productId || !startCnNumber || !endCnNumber) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    // Validation removed as per user request
    // if (parseInt(startCnNumber) > parseInt(endCnNumber)) {
    //   setMessage({ type: 'error', text: 'Start CN must be less than End CN' })
    //   return
    // }

    try {
      // Get existing allocations
      const existingAllocations = JSON.parse(localStorage.getItem('cnAllocations') || '{}')

      // Concatenate Start and End to form the CN Number (Single Allocation)
      // As per user request: "123" + "111" = "123111"
      const fullCn = String(startCnNumber) + String(endCnNumber)

      // Update allocation for this product
      existingAllocations[productId] = {
        start: fullCn,
        end: fullCn,
        next: fullCn
      }

      localStorage.setItem('cnAllocations', JSON.stringify(existingAllocations))
      setMessage({ type: 'success', text: `CN ${fullCn} allocated successfully!` })

      // Optional: Clear form
      setFormData(prev => ({ ...prev, startCnNumber: '', endCnNumber: '' }))

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

          {/* Enter Start CN No. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Start CN No.
            </label>
            <input
              type="number"
              name="startCnNumber"
              value={formData.startCnNumber}
              onChange={handleChange}
              placeholder="Enter starting CN number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Enter End CN No. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter End CN No.
            </label>
            <input
              type="number"
              name="endCnNumber"
              value={formData.endCnNumber}
              onChange={handleChange}
              placeholder="Enter ending CN number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
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

