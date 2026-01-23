'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { api } from '../lib/api'
import { fetchAllPricing } from '../lib/store'
import AdminProtectedRoute from '../components/AdminProtectedRoute'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminDashboard from '../components/admin/AdminDashboard'
import BookingConsignment from '../components/admin/bookings/BookingConsignment'
import ArrivalScan from '../components/admin/Operations/Arrivalscan'
import Manifest from '../components/admin/Operations/Manifest'
import DeManifest from '../components/admin/Operations/DeManifest'
import DeManifestShipment from '../components/admin/Operations/DeManifestShipment'
import CreateNewManifest from '../components/admin/Operations/CreateNewManifest'
import CreateArrivalSheet from '../components/admin/Operations/CreateArrivalSheet'
import EditArrivalSheet from '../components/admin/Operations/EditArrivalSheet'
import EditManifest from '../components/admin/Operations/EditManifest'
import LoadingToDd from '../components/admin/Operations/LoadingToDd'
import CreateDeliveryPhase1 from '../components/admin/Operations/CreateDeliveryPhase1'
import EditDeliveryPhase1 from '../components/admin/Operations/EditDeliveryPhase1'
import DeliveryPhase1 from '../components/admin/Operations/DeliveryPhase1'
import DeliveryPhase2 from '../components/admin/Operations/DeliveryPhase2'
import PickupManagement from '../components/admin/Operations/PickupManagement'
import ShipmentTracking from '../components/admin/Operations/ShipmentTracking'
import CnReprint from '../components/admin/CnReprint'
import BatchCutOff from '../components/admin/BatchCutOff'
import RmsToday from '../components/admin/RmsToday'
import ShiftClose from '../components/admin/ShiftClose'
import CnVoid from '../components/admin/CnVoid'
import Configuration from '../components/admin/Configration'
import CnAllocation from '../components/admin/CnAllocation'
import EmployeeRegistration from '../components/admin/EmployeeRegistration'
import BookingRequests from '../components/admin/bookings/BookingRequests'
import PricingRates from '../components/admin/PricingRates'
import EditBooking from '../components/admin/bookings/EditBooking'

export default function AdminPanel() {
  const dispatch = useDispatch()
  const { batchInfo } = useSelector((state) => state.auth)
  const { isLoaded: pricingLoaded } = useSelector((state) => state.pricing)
  const [activePage, setActivePage] = useState('Configuration')
  const [scanId, setScanId] = useState(null)

  // Force configuration page if config is missing
  useEffect(() => {
    if (batchInfo?.status === 'error' && activePage !== 'Configuration') {
      setActivePage('Configuration')
    }
  }, [batchInfo, activePage])

  // Pre-fetch pricing data on admin panel load
  useEffect(() => {
    if (!pricingLoaded) {
      dispatch(fetchAllPricing())
    }
  }, [dispatch, pricingLoaded])

  const handleSetActivePage = (page, id = null) => {
    // Prevent navigating away if config is missing
    if (batchInfo?.status === 'error' && page !== 'Configuration') {
      return
    }
    setActivePage(page)
    setScanId(id)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Booking':
        return <BookingConsignment />
      case 'Arrival Scan':
        return <ArrivalScan setActivePage={handleSetActivePage} />
      case 'Create Arrival Sheet':
        return <CreateArrivalSheet setActivePage={handleSetActivePage} />
      case 'Edit Arrival Sheet':
        return <EditArrivalSheet setActivePage={handleSetActivePage} scanId={scanId} />
      case 'Manifest':
        return <Manifest setActivePage={handleSetActivePage} />
      case 'Create New Manifest':
        return <CreateNewManifest setActivePage={handleSetActivePage} />
      case 'Edit Manifest':
        return <EditManifest setActivePage={handleSetActivePage} manifestId={scanId} />
      case 'De Manifest':
        return <DeManifest setActivePage={handleSetActivePage} />
      case 'De-Manifest Shipments':
        return <DeManifestShipment setActivePage={handleSetActivePage} manifestId={scanId} />
      case 'Loading To DD':
        return <LoadingToDd />
      case 'Delivery Phase 1':
        return <DeliveryPhase1 setActivePage={handleSetActivePage} />
      case 'Create Delivery Phase 1':
        return <CreateDeliveryPhase1 setActivePage={handleSetActivePage} />
      case 'Edit Delivery Phase 1':
        return <EditDeliveryPhase1 setActivePage={handleSetActivePage} sheetId={scanId} />
      case 'Delivery Phase 2':
        return <DeliveryPhase2 setActivePage={handleSetActivePage} />
      case 'Pickup Management':
        return <PickupManagement />
      case 'Shipment Tracking':
        return <ShipmentTracking />
      case 'CN Reprint':
        return <CnReprint />
      case 'Batch Cut Off':
        return <BatchCutOff />
      case 'RMS Today':
        return <RmsToday />
      case 'Shift Close':
        return <ShiftClose />
      case 'CN Void':
        return <CnVoid />
      case 'Configuration':
        return <Configuration />
      case 'CN Allocation':
        return <CnAllocation />
      case 'Booking Requests':
        return <BookingRequests />
      case 'Edit Booking':
        return <EditBooking />
      case 'Employee Registration':
        return <EmployeeRegistration />
      case 'Pricing Rates':
        return <PricingRates />
      case 'Admin Home':
      default:
        return <AdminDashboard />
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen bg-sky-50 overflow-x-hidden">
        <div className="print:hidden">
          <AdminSidebar activePage={activePage} setActivePage={handleSetActivePage} />
        </div>
        <main className="flex-1 ml-64 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden print:ml-0 print:p-0">
          {renderPage()}
        </main>
      </div>
    </AdminProtectedRoute>
  )
}
