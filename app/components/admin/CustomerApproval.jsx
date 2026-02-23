'use client'

import { useState, useEffect } from 'react'
import { Users, Loader2, CheckCircle, X, UserCheck, Search } from 'lucide-react'
import { api } from '../../lib/api'

export default function CustomerApproval() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPending = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getPendingCustomers()
      const data = Array.isArray(result) ? result : result?.data || []
      setCustomers(data)
    } catch (err) {
      console.error('Error fetching pending customers:', err)
      setError(err?.message || 'Failed to load pending customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (customer) => {
    setApprovingId(customer.id)
    setError('')
    try {
      await api.approveCustomer(customer.id)
      setSuccess(`${customer.username} has been approved and can now login`)
      await fetchPending()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err?.message || 'Failed to approve customer')
    } finally {
      setApprovingId(null)
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.username?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm?.toLowerCase())
  )

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-8 w-[2px] bg-gray-200"></div>
        <div>
          <h2 className="text-sm font-black text-sky-600 uppercase tracking-widest">Super Admin</h2>
          <h1 className="text-2xl font-black text-gray-900">Customer Approval</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">PENDING CUSTOMERS</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                {customers.length} awaiting approval
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Customers who register must be approved before they can login. Approve each customer below.
          </p>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-sky-600" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 sticky top-0 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">SR</th>
                  <th className="px-6 py-4">USERNAME</th>
                  <th className="px-6 py-4">EMAIL</th>
                  <th className="px-6 py-4">REGISTERED</th>
                  <th className="px-6 py-4">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-24 px-10 text-center">
                      <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                      <p className="text-sm font-black text-gray-300 uppercase tracking-widest">
                        {searchTerm ? 'No matching customers' : 'No pending customers'}
                      </p>
                      {!searchTerm && (
                        <p className="text-xs text-gray-400 mt-1">
                          New customer signups will appear here
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer, idx) => (
                    <tr key={customer.id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-sky-700">{customer.username}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-600">
                        {customer.email || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {new Date(customer.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleApprove(customer)}
                          disabled={approvingId === customer.id}
                          className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                        >
                          {approvingId === customer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(error || success) && (
        <div
          className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            error ? 'bg-white text-red-600 border-red-100' : 'bg-white text-emerald-600 border-emerald-100'
          }`}
        >
          <div className={`p-2 rounded-full ${error ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {error ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <p className="font-black text-sm uppercase tracking-tight pr-4">{error || success}</p>
          <button
            onClick={() => {
              setError('')
              setSuccess('')
            }}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
