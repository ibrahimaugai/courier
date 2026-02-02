'use client'
import { Activity, Database, TrendingUp, Package, Users, Clock, Truck, CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function AdminDashboard() {
  const { user, batchInfo } = useSelector((state) => state.auth)

  return (
    <div className="max-w-7xl w-full animate-fade-in">
      {/* Batch Status Notification */}
      {batchInfo && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-sm animate-slide-up ${batchInfo.status === 'error'
          ? 'bg-amber-50 border-amber-100 text-amber-800'
          : 'bg-emerald-50 border-emerald-100 text-emerald-800'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${batchInfo.status === 'error' ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
              {batchInfo.status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-tight">
                {batchInfo.status === 'active'
                  ? `Active Batch: ${batchInfo.batchCode}`
                  : batchInfo.status === 'error'
                    ? 'Configuration Required'
                    : 'System Status'}
              </p>
              <p className="text-xs opacity-80 font-medium">
                {batchInfo.status === 'active'
                  ? 'Your personal batch is active and ready for bookings.'
                  : batchInfo.status === 'error'
                    ? batchInfo.message
                    : 'System is operational.'}
              </p>
            </div>
          </div>
          {batchInfo.status === 'error' && (
            <a
              href="/admin?tab=config"
              className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-md"
            >
              UPDATE CONFIG
            </a>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-1">
            Welcome, {user?.username}
          </h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Courier Management Dashboard</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-sky-600 px-3 py-1 bg-sky-50 rounded-full border border-sky-100">
            STAFF ID: {user?.staffCode || 'N/A'}
          </span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* System Status Card */}
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-6 rounded-xl border border-sky-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Online</span>
            </div>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">System Status</h3>
          <p className="text-2xl font-bold text-sky-700 mb-1">Active</p>
          <p className="text-sm text-gray-600">All systems operational</p>
        </div>

        {/* Database Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Connected</span>
            </div>
          </div>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Database</h3>
          <p className="text-2xl font-bold text-purple-700 mb-1">Supabase</p>
          <p className="text-sm text-gray-600">Real-time sync active</p>
        </div>

      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bookings</p>
              <p className="text-xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active Users</p>
              <p className="text-xl font-bold text-gray-900">89</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+5% from last week</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">In Transit</p>
              <p className="text-xl font-bold text-gray-900">245</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Clock className="w-3 h-3" />
            <span>Active shipments</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Delivered</p>
              <p className="text-xl font-bold text-gray-900">892</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+18% from last month</span>
          </div>
        </div>
      </div>

      {/* Welcome Panel */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg shadow-md">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Admin Panel
            </h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Welcome to the Admin Panel for Courier RMS. Use the navigation menu to access different modules including booking management,
              operations, batch processing, and reporting features.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">Booking Management</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Operations</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Analytics</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

