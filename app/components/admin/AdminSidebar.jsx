'use client'

import { useState, useEffect } from 'react'
import {
  Home,
  Truck,
  LogOut,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Printer,
  Scissors,
  BarChart,
  Calculator,
  RefreshCw,
  XCircle,
  Settings,
  Package,
  FileText,
  DollarSign,
  Edit
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../lib/store'

export default function AdminSidebar({ activePage, setActivePage }) {
  const [isOperationsOpen, setIsOperationsOpen] = useState(false)
  const [isBookingsOpen, setIsBookingsOpen] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, batchInfo } = useSelector((state) => state.auth)
  const isConfigMissing = batchInfo?.status === 'error'

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const bookingsSubItems = [
    { name: 'Booking', icon: Package, shortcut: 'BKG' },
    { name: 'Booking Requests', icon: FileText, shortcut: 'REQ' },
    { name: 'CN Allocation', icon: FileText, shortcut: 'ALC' },
    { name: 'CN Reprint', icon: Printer, shortcut: 'RPT' },
    { name: 'Edit Booking', icon: Edit, shortcut: 'EDT' },
    { name: 'CN Void', icon: XCircle, shortcut: 'VOID' },
  ]

  const operationsSubItems = [
    { name: 'Arrival Scan', shortcut: 'ASC' },
    { name: 'Manifest', shortcut: 'MNF' },
    { name: 'De Manifest', shortcut: 'DMF' },
    { name: 'Delivery Phase 1', shortcut: 'DP1' },
    { name: 'Delivery Phase 2', shortcut: 'DP2' },
    { name: 'Pickup Management', shortcut: 'PUM' },
    { name: 'Shipment Tracking', shortcut: 'SHT' },
  ]

  const menuItems = [
    { name: 'Employee Registration', icon: Package },
    { name: 'Batch Cut Off', icon: Scissors },
    { name: 'Shift Close', icon: RefreshCw },
    { name: 'Configuration', icon: Settings },
    { name: 'RMS Today', icon: BarChart },
    { name: 'Pricing Rates', icon: DollarSign },
  ]

  const isBookingsActive = bookingsSubItems.some(item => activePage === item.name)
  const isOperationsActive = operationsSubItems.some(item => activePage === item.name)
  const isMenuItemActive = menuItems.some(item => activePage === item.name)

  // Auto-open dropdowns when their submenu items are active
  useEffect(() => {
    if (isOperationsActive) {
      setIsOperationsOpen(true)
    }
    if (isBookingsActive) {
      setIsBookingsOpen(true)
    }
  }, [isOperationsActive, isBookingsActive])

  const handleBackToUser = () => {
    router.push('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/nps-logo.png"
            alt="NPS Logo"
            className="h-16 w-auto object-contain"
          />
          <div className="mt-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-sky-600">Admin Control</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">

        {/* Bookings Dropdown */}
        <div className={isConfigMissing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}>
          <div
            onClick={() => !isConfigMissing && setIsBookingsOpen(!isBookingsOpen)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${isBookingsActive
              ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
              : 'text-gray-700 hover:bg-sky-50'
              }`}
          >
            <div className="flex items-center">
              <Package className="mr-3 w-5 h-5" />
              <span className="text-sm font-medium">Bookings</span>
            </div>
            {isBookingsOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          {/* Bookings Submenu */}
          {isBookingsOpen && (
            <div className="bg-sky-50/50">
              {bookingsSubItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={index}
                    onClick={() => setActivePage(item.name)}
                    className={`flex items-center justify-between px-8 py-2.5 cursor-pointer transition-all duration-200 ${activePage === item.name
                      ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
                      : 'text-gray-600 hover:bg-sky-100 hover:border-l-2 hover:border-sky-400'
                      }`}
                  >
                    <div className="flex items-center">
                      <IconComponent className="mr-2 w-4 h-4" />
                      <span className={`text-sm ${activePage === item.name ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                    </div>
                    <span className={`text-xs ${activePage === item.name ? 'text-white/90' : 'text-gray-500'}`}>{item.shortcut}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Operations Dropdown */}
        <div className={isConfigMissing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}>
          <div
            onClick={() => !isConfigMissing && setIsOperationsOpen(!isOperationsOpen)}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${isOperationsActive
              ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
              : 'text-gray-700 hover:bg-sky-50'
              }`}
          >
            <div className="flex items-center">
              <Truck className="mr-3 w-5 h-5" />
              <span className="text-sm font-medium">Operations</span>
            </div>
            {isOperationsOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          {/* Operations Submenu */}
          {isOperationsOpen && (
            <div className="bg-sky-50/50">
              {operationsSubItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setActivePage(item.name)}
                  className={`flex items-center justify-between px-8 py-2.5 cursor-pointer transition-all duration-200 ${activePage === item.name
                    ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
                    : 'text-gray-600 hover:bg-sky-100 hover:border-l-2 hover:border-sky-400'
                    }`}
                >
                  <span className={`text-sm ${activePage === item.name ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                  <span className={`text-xs ${activePage === item.name ? 'text-white/90' : 'text-gray-500'}`}>{item.shortcut}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other Menu Items */}
        {menuItems.map((item, index) => {
          // Hide Employee Registration and Pricing Rates for non-SUPER_ADMIN users
          if ((item.name === 'Employee Registration' || item.name === 'Pricing Rates') && user?.role !== 'SUPER_ADMIN') {
            return null
          }

          const IconComponent = item.icon
          const isDisabled = isConfigMissing && item.name !== 'Configuration'

          return (
            <div
              key={index}
              onClick={() => !isDisabled && setActivePage(item.name)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${activePage === item.name
                ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
                : isDisabled
                  ? 'text-gray-400 opacity-50 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-sky-50'
                }`}
            >
              <IconComponent className="mr-3 w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

