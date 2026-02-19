'use client'
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import {
  Calendar,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  DollarSign,
  Weight,
  CreditCard,
  Wallet,
  ArrowRight
} from 'lucide-react'

export default function RmsToday() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState({ bookings: [], summary: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDailySummary()
  }, [selectedDate])

  const fetchDailySummary = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await api.getDailySummary(selectedDate)
      setData(result?.data || result)
    } catch (err) {
      console.error('Error fetching daily summary:', err)
      setError(err.message || 'Failed to fetch record management system data.')
    } finally {
      setIsLoading(false)
    }
  }

  const { bookings, summary } = data
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="max-w-7xl animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RMS Today</h1>
          <p className="text-sm text-gray-500 mt-1 italic tracking-tight uppercase font-medium">Record Management System</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mt-2 font-medium">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Search className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Operational Date
            </label>
            <div className="relative group">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all font-bold text-gray-900 text-lg shadow-sm"
              />
              <Calendar className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-sky-400 group-hover:text-sky-600 transition-colors pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-8 py-5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 active:scale-95 transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-sky-600/20 flex items-center gap-3"
          >
            <Search className="w-5 h-5" />
            SHOW TODAY
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-sky-400 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-sky-50 rounded-xl group-hover:bg-sky-100 transition-colors text-sky-600">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Total Volume</span>
            </div>
            <p className="text-xs text-gray-400 font-bold mb-1">Bookings</p>
            <p className="text-3xl font-black text-gray-900">{summary.totalBookings}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-emerald-400 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Revenue</span>
            </div>
            <p className="text-xs text-gray-400 font-bold mb-1">Total PKR</p>
            <p className="text-3xl font-black text-gray-900">Rs. {summary.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-amber-400 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors text-amber-600">
                <Weight className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Weight Load</span>
            </div>
            <p className="text-xs text-gray-400 font-bold mb-1">Total KG</p>
            <p className="text-3xl font-black text-gray-900">{summary.totalWeight.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:border-indigo-400 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors text-indigo-600">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Packages</span>
            </div>
            <p className="text-xs text-gray-400 font-bold mb-1">Total Pieces</p>
            <p className="text-3xl font-black text-gray-900">{summary.totalPackages}</p>
          </div>
        </div>
      )}

      {/* Secondary Summary - Payment Breakdown */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Pay Mode Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'CASH', icon: CreditCard, color: 'sky', count: summary.payModeBreakdown.CASH, rev: summary.revenueBreakdown.CASH },
                { label: 'COD (Cash On Delivery)', icon: Wallet, color: 'emerald', count: summary.payModeBreakdown.COD, rev: summary.revenueBreakdown.COD },
                { label: 'ONLINE', icon: ArrowRight, color: 'amber', count: summary.payModeBreakdown.ONLINE, rev: summary.revenueBreakdown.ONLINE },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-${item.color}-100 text-${item.color}-600 rounded-lg`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-none mb-1">{item.label}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{item.count} Shipments</p>
                    </div>
                  </div>
                  <p className={`text-base font-black text-${item.color}-700`}>Rs. {item.rev.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sky-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 transform rotate-12 opacity-10">
              <Package className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black tracking-tight mb-2">Operational Summary</h2>
              <p className="text-sky-100 opacity-80 font-medium mb-6">Activity metrics for {formattedDate}</p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-3xl font-black">{(summary.totalRevenue / (summary.totalBookings || 1)).toFixed(0)}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-sky-300">Avg Revenue / Booking</p>
                </div>
                <div>
                  <p className="text-3xl font-black">{(summary.totalWeight / (summary.totalBookings || 1)).toFixed(2)}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-sky-300">Avg Weight (KG)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Daily Bookings Register</h2>
            <p className="text-xs text-gray-500 font-bold mt-0.5">{formattedDate}</p>
          </div>
          {bookings?.length > 0 && (
            <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-black border border-sky-200">
              {bookings.length} TOTAL RECORDS
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-sky-600 animate-spin" />
              <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Generating RMS Snapshot...</p>
            </div>
          ) : error ? (
            <div className="py-20 px-8 flex flex-col items-center text-center">
              <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase italic tracking-tight">System Access Error</h3>
              <p className="text-gray-500 max-w-sm font-medium">{error}</p>
            </div>
          ) : bookings?.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5 border-b border-gray-100">CN Number</th>
                  <th className="px-8 py-5 border-b border-gray-100">Destination</th>
                  <th className="px-8 py-5 border-b border-gray-100">Service</th>
                  <th className="px-8 py-5 border-b border-gray-100">Weight/Pcs</th>
                  <th className="px-8 py-5 border-b border-gray-100">Details</th>
                  <th className="px-8 py-5 border-b border-gray-100 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const isVoided = booking.status === 'VOIDED'
                  return (
                  <tr key={booking.id} className={`transition-colors group cursor-default ${isVoided ? 'bg-red-50/50 hover:bg-red-50/70' : 'hover:bg-sky-50/40'}`}>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-black tracking-tight group-hover:tracking-normal transition-all ${isVoided ? 'text-gray-500 line-through' : 'text-sky-700'}`}>{booking.cnNumber}</span>
                          {isVoided && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-200 text-red-800 border border-red-300">
                              Void
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Ref ID: {booking.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 ${isVoided ? 'opacity-70' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight mb-0.5">{booking.destinationCity?.cityName ?? '—'}</span>
                        <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100 inline-block w-fit font-black uppercase">{booking.destinationCity?.cityCode ?? ''}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 ${isVoided ? 'opacity-70' : ''}`}>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tighter">
                        {booking.service?.serviceName ?? '—'}
                      </span>
                    </td>
                    <td className={`px-8 py-5 ${isVoided ? 'opacity-70' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900">{booking.weight} KG</span>
                          <span className="text-[10px] text-gray-500 font-bold">{booking.pieces} PCS</span>
                        </div>
                      </div>
                    </td>
                    <td className={`px-8 py-5 ${isVoided ? 'opacity-70' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight truncate max-w-[120px]">{booking.packetContent}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit mt-1 ${booking.payMode === 'COD' ? 'bg-emerald-100 text-emerald-800' :
                          booking.paymentMode === 'CASH' ? 'bg-sky-100 text-sky-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                          {booking.payMode ?? booking.paymentMode ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-sm">
                      {isVoided ? (
                        <span className="text-red-600 font-black uppercase">Void</span>
                      ) : (
                        <span className="text-gray-900">{parseFloat(booking.totalAmount).toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-32 px-10 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest italic">Zero Activity Detected</h3>
              <p className="text-gray-400 text-sm font-medium mt-2 max-w-xs">No records have been filed for the selected date sequence in the Record Management System.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


