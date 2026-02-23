'use client'

import { useState } from 'react'
import Sidebar from './components/User/Sidebar'
import MyShipments from './components/User/MyShipments'
import UserBookingConsignment from './components/User/Booking/UserBookingConsignment'
import EditBooking from './components/User/EditBooking'
import PickupRequest from './components/User/PickupRequest'
import TrackShipment from './components/User/TrackShipment'
import UserShiftClose from './components/User/UserShiftClose'
import RmsToday from './components/admin/RmsToday'
import ProtectedRoute from './components/ProtectedRoute'

export default function Home() {
  const [activePage, setActivePage] = useState('My Shipments')
  const [selectedShipment, setSelectedShipment] = useState(null)

  const renderPage = () => {
    switch (activePage) {
      case 'Booking':
        return <UserBookingConsignment />
      case 'Edit Booking':
        return <EditBooking 
          selectedShipment={selectedShipment} 
          setActivePage={setActivePage}
          setSelectedShipment={setSelectedShipment}
        />
      case 'Pickup Request':
        return <PickupRequest />
      case 'Track Shipment':
        return <TrackShipment />
      case 'RMS Today':
        return <RmsToday />
      case 'Shift Close':
        return <UserShiftClose />
      case 'My Shipments':
      case 'Home': // Support legacy 'Home' for backward compatibility
      default:
        return <MyShipments 
          setActivePage={setActivePage}
          setSelectedShipment={setSelectedShipment}
        />
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-sky-50 overflow-x-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
          {renderPage()}
        </main>
      </div>
    </ProtectedRoute>
  )
}

