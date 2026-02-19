'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import {
  Package as PackageIcon,
  LogOut,
  Truck,
  Search,
  Package,
  Menu,
  X,
  RefreshCw
} from 'lucide-react'
import { logout } from '../../lib/store'

export default function Sidebar({ activePage, setActivePage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const menuItems = [
    { name: 'Booking', icon: Package },
    { name: 'Pickup Request', icon: Truck },
    { name: 'Track Shipment', icon: Search },
    { name: 'Shift Close', icon: RefreshCw },
  ]

  const handleMenuClick = (pageName) => {
    setActivePage(pageName)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-sky-600 text-white rounded-md shadow-lg hover:bg-sky-700 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 shadow-sm z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/nps-logo.png"
              alt="NPS Logo"
              className="h-16 w-auto object-contain"
            />
            <div className="mt-2 text-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-sky-600">User Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {/* My Shipments */}
          <div
            onClick={() => handleMenuClick('My Shipments')}
            className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${activePage === 'My Shipments' || activePage === 'Home'
                ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
                : 'text-gray-700 hover:bg-sky-50'
              }`}
          >
            <PackageIcon className="mr-3 w-5 h-5" />
            <span className="text-sm font-medium">My Shipments</span>
          </div>

          {/* Menu Items */}
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                onClick={() => handleMenuClick(item.name)}
                className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${activePage === item.name
                    ? 'bg-sky-600 text-white shadow-md border-l-4 border-sky-400'
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
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
