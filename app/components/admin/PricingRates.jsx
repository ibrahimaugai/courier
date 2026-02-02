'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { api } from '../../lib/api'
import { fetchAllPricing } from '../../lib/store'
import { Filter, RefreshCw, TrendingUp, MapPin, Package, Loader2, Pencil, X, Plus, Trash2, Settings2, CheckCircle, Search } from 'lucide-react'
import AttestationPricingTable from './AttestationPricingTable'

const PRODUCT_TYPES = ['General', 'International', 'OLE', 'Logistics', 'Sentiments', 'Attestation', 'COD']

const DEFAULT_WEIGHT_RANGES = [
  { from: 0, to: 0.5 },
  { from: 0.5, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
  { from: 8, to: 9 },
  { from: 9, to: 10 },
  { from: 10, to: 11 },
  { from: 11, to: 12 },
  { from: 12, to: 13 },
  { from: 13, to: 14 },
  { from: 14, to: 15 },
  { from: 15, to: 16 },
  { from: 16, to: 17 },
  { from: 17, to: 18 },
  { from: 18, to: 19 },
  { from: 19, to: 20 },
  { from: 20, to: 21 },
  { from: 21, to: 22 },
  { from: 22, to: 23 },
  { from: 23, to: 24 },
  { from: 24, to: 25 },
]

export default function PricingRates() {
  const dispatch = useDispatch()
  const { rules: reduxRules, cities: reduxCities, services: reduxServices, isLoaded, isLoading: reduxLoading } = useSelector((state) => state.pricing)

  const [pricingRules, setPricingRules] = useState([])
  const [cities, setCities] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalRules: 0,
    routes: 0,
    cities: 0,
    services: 0
  })
  const [filters, setFilters] = useState({
    originCity: '',
    destinationCity: '',
    serviceType: 'General', // Default to General
  })
  const [editingRule, setEditingRule] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Service Management State
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [newService, setNewService] = useState({ serviceName: '', serviceType: 'General' })
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false)

  // City Management State
  const [showCityModal, setShowCityModal] = useState(false)
  const [newCity, setNewCity] = useState({ cityName: '', cityCode: '' })
  const [isCitySubmitting, setIsCitySubmitting] = useState(false)

  // Load data from Redux when rules change or component mounts
  useEffect(() => {
    if (isLoaded) {
      processData(reduxRules, reduxCities, reduxServices)
    } else if (!reduxLoading) {
      dispatch(fetchAllPricing())
    }
  }, [isLoaded, reduxRules, reduxCities, reduxServices, reduxLoading, dispatch])

  const processData = (rawRules, rawCities, rawServices) => {
    try {
      setLoading(true)
      setError(null)

      // Store all cities and services for management
      const allCities = [...rawCities].sort((a, b) => (a.cityName || '').localeCompare(b.cityName || ''))
      const allServices = [...rawServices].sort((a, b) => (a.serviceName || '').localeCompare(b.serviceName || ''))

      setCities(allCities)
      setServices(allServices)

      // Deduplicate Rules
      const uniqueRulesMap = new Map()
      rawRules.forEach(rule => {
        const key = `${rule.originCityId}-${rule.destinationCityId}-${rule.serviceId}-${rule.weightFrom}-${rule.weightTo}`
        if (!uniqueRulesMap.has(key)) {
          uniqueRulesMap.set(key, rule)
        }
      })
      const cleanRules = Array.from(uniqueRulesMap.values())
      setPricingRules(cleanRules)

      // Calculate stats (based on active items)
      const activeCitiesCount = allCities.filter(c => c.status === 'active').length
      const activeServicesCount = allServices.filter(s => s.status === 'active').length
      const uniqueRoutes = new Set(cleanRules.map(r => `${r.originCityId}-${r.destinationCityId}`))
      const activeServiceTypes = new Set(allServices.filter(s => s.status === 'active').map(s => s.serviceType))

      setStats({
        totalRules: cleanRules.length,
        routes: uniqueRoutes.size,
        cities: activeCitiesCount,
        services: activeServicesCount,
        types: activeServiceTypes.size
      })
    } catch (err) {
      console.error('Error processing pricing data:', err)
      setError('Failed to process pricing data.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    dispatch(fetchAllPricing())
  }

  // Get available service types
  const serviceTypes = PRODUCT_TYPES

  // Memos for active lists (for filters and grid)
  const activeCities = useMemo(() => cities.filter(c => c.status === 'active'), [cities])
  const activeServices = useMemo(() => services.filter(s => s.status === 'active'), [services])

  // Full list of services for the selected product type
  const productServices = useMemo(() => {
    return activeServices
      .filter(s => s.serviceType === filters.serviceType)
      .sort((a, b) => a.serviceName.localeCompare(b.serviceName))
  }, [activeServices, filters.serviceType])

  // Get service columns for the selected type
  const activeServiceColumns = useMemo(() => {
    return [...productServices]
  }, [productServices])

  // Group rules by route and ensure standard ranges
  const groupedByRoute = useMemo(() => {
    const groups = (Array.isArray(pricingRules) ? pricingRules : []).reduce((acc, rule) => {
      // Filter by service type
      if (rule.service?.serviceType !== filters.serviceType) return acc

      // Filter by origin city if selected
      if (filters.originCity && rule.originCityId !== filters.originCity) return acc

      // Filter by destination city if selected
      if (filters.destinationCity && rule.destinationCityId !== filters.destinationCity) return acc

      const routeKey = `${rule.originCity?.cityCode || ''}-${rule.destinationCity?.cityCode || ''}`
      const routeName = `${rule.originCity?.cityName || ''} → ${rule.destinationCity?.cityName || ''}`

      if (!acc[routeKey]) {
        acc[routeKey] = {
          route: routeName,
          routeCode: routeKey,
          originCityId: rule.originCityId,
          destinationCityId: rule.destinationCityId,
          weightMap: {},
        }
      }

      const weightKey = `${rule.weightFrom}_${rule.weightTo}`
      if (!acc[routeKey].weightMap[weightKey]) {
        acc[routeKey].weightMap[weightKey] = {
          weightFrom: parseFloat(rule.weightFrom),
          weightTo: parseFloat(rule.weightTo),
          services: {},
        }
      }

      acc[routeKey].weightMap[weightKey].services[rule.service?.id] = rule
      return acc
    }, {})

    // If specific route filters are set but no data exists, add empty virtual group
    if (filters.originCity && filters.destinationCity) {
      const origin = activeCities.find(c => c.id === filters.originCity)
      const destination = activeCities.find(c => c.id === filters.destinationCity)

      if (origin && destination) {
        const routeKey = `${origin.cityCode}-${destination.cityCode}`
        if (!groups[routeKey]) {
          groups[routeKey] = {
            route: `${origin.cityName} → ${destination.cityName}`,
            routeCode: routeKey,
            originCityId: origin.id,
            destinationCityId: destination.id,
            weightMap: {},
          }
        }
      }
    }

    // Standardize each group with default weight ranges
    Object.keys(groups).forEach((routeKey) => {
      const group = groups[routeKey]

      // Inject missing standard ranges
      DEFAULT_WEIGHT_RANGES.forEach(range => {
        const key = `${range.from}_${range.to}`
        if (!group.weightMap[key]) {
          group.weightMap[key] = {
            weightFrom: range.from,
            weightTo: range.to,
            services: {},
          }
        }
      })

      const weightEntries = Object.entries(group.weightMap)
      weightEntries.sort((a, b) => a[1].weightFrom - b[1].weightFrom)
      group.weightRanges = weightEntries.map(([key, value]) => value)
    })

    return groups
  }, [pricingRules, filters, activeCities])

  // map for days fallback
  const ATTESTATION_DAYS_MAP = {
    'Mofa General Attestation': '4 to 5 working days',
    'Apostille Urgent single page': '4 to 5 working days',
    'Appostille file URGENT': '4 to 5 working days',
    'National Beuro Urgent': '10 to 12 working days',
    'Uae Embassy': '7 to 8 working days',
    'Saudia Embassy': '7 to 8 working days',
    'Saudi Culture': '12 to 15 working days',
    'Oman Embassy': '7 to 8 working days',
    'Kuwait Embassy': '7 to 8 working days',
    'Bahrain embassy': '7 to 8 working days',
    'Qatar Embassy': '7 to 8 working days',
    'Hec Attestation': '8 working days',
    'University Verification': '4 to 5 working days',
    'Ibcc Attestation Urgent': '4 to 5 working days',
    'Gujranwala Borad verification': '4 to 5 working days',
    'Fedral Board Verification': '5 to 6 working days',
    'Lahore Board Verification': '5 to 6 working days',
    'IBCC ENQUIVALENCE DEGREE + IBCC ATTEST': '12 WORKING DAYS',
    'Technical Board verification': '5 to 6 working days',
    'Foreigner marriage certificate': '6 working days',
    'Divorce certificate General Mofa': '6 working days',
    'Stamp paper General mofa': '6 working days',
    'Stamp paper Apostille Urgent': '3 to 4 working days',
    'Commercial documents urgent appostille': '12 working days',
    'commercial documents Mofa Attestation': '6 working days',
    'Stamp paper apostille Normal': '10 working days',
    'Translation': '4 to 5 working days',
  }

  const getDays = (name) => {
    // Try exact match first
    if (ATTESTATION_DAYS_MAP[name]) return ATTESTATION_DAYS_MAP[name]

    // Try case-insensitive lookup
    const lower = name.toLowerCase()
    const entry = Object.entries(ATTESTATION_DAYS_MAP).find(([k, v]) => k.toLowerCase() === lower)
    return entry ? entry[1] : 'N/A'
  }

  // Prepare attestation services data (different structure than weight-based services)
  const attestationServices = useMemo(() => {
    if (filters.serviceType !== 'Attestation') return []

    return (Array.isArray(pricingRules) ? pricingRules : [])
      .filter(rule => rule.service?.serviceType === 'Attestation')
      .map(rule => ({
        id: rule.service.id,
        ruleId: rule.id,
        serviceName: rule.service.serviceName,
        days: rule.service.days || getDays(rule.service.serviceName), // Use fallback
        baseRate: parseFloat(rule.baseRate),
        additionalCharges: rule.additionalCharges ? parseFloat(rule.additionalCharges) : null
      }))
  }, [pricingRules, filters.serviceType])

  const handleUpdatePrice = async (e) => {
    e.preventDefault()
    if (!editingRule) return

    try {
      setIsUpdating(true)
      if (editingRule.id) {
        await api.updatePricingRule(editingRule.id, {
          baseRate: parseFloat(editingRule.baseRate),
        })
      } else {
        await api.createPricingRule({
          originCityId: editingRule.originCityId,
          destinationCityId: editingRule.destinationCityId,
          serviceId: editingRule.serviceId,
          weightFrom: editingRule.weightFrom,
          weightTo: editingRule.weightTo,
          baseRate: parseFloat(editingRule.baseRate || 0),
        })
      }
      setEditingRule(null)
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error updating rate:', err)
      alert('Failed to update pricing rule')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateService = async (e) => {
    e.preventDefault()
    if (!newService.serviceName) return

    try {
      setIsServiceSubmitting(true)
      await api.createService(newService)
      setNewService({ serviceName: '', serviceType: filters.serviceType || 'General' })
      dispatch(fetchAllPricing())
      // Keep modal open if needed or close it
    } catch (err) {
      console.error('Error creating service:', err)
      alert(err.message || 'Failed to create service')
    } finally {
      setIsServiceSubmitting(false)
    }
  }

  const handleDeleteService = async (id, status) => {
    const msg = status === 'active'
      ? 'Are you sure you want to deactivate this service? This will hide it from the booking forms.'
      : 'Are you sure you want to permanently delete this service? This only works if no bookings have ever used it.'

    if (!confirm(msg)) return

    try {
      await api.deleteService(id)
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error deleting service:', err)
      alert(err.message || 'Failed to delete service')
    }
  }

  const handleCreateCity = async (e) => {
    e.preventDefault()
    if (!newCity.cityName || !newCity.cityCode) return

    try {
      setIsCitySubmitting(true)
      await api.createCity(newCity)
      setNewCity({ cityName: '', cityCode: '' })
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error creating city:', err)
      alert(err.message || 'Failed to create city')
    } finally {
      setIsCitySubmitting(false)
    }
  }

  const handleDeleteCity = async (id, status) => {
    const msg = status === 'active'
      ? 'Are you sure you want to deactivate this city? This will hide it from the booking forms.'
      : 'Are you sure you want to permanently delete this city? This only works if no pricing rules or bookings use it.'

    if (!confirm(msg)) return

    try {
      await api.deleteCity(id)
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error deleting city:', err)
      alert(err.message || 'Failed to delete city')
    }
  }

  const handleActivateCity = async (id) => {
    try {
      await api.updateCity(id, { status: 'active' })
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error activating city:', err)
      alert(err.message || 'Failed to activate city')
    }
  }

  const handleActivateService = async (id) => {
    try {
      await api.updateService(id, { status: 'active' })
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error activating service:', err)
      alert(err.message || 'Failed to activate service')
    }
  }

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'PKR 0'
    return `PKR ${parseFloat(amount).toLocaleString('en-PK')}`
  }

  const formatWeight = (from, to) => {
    if (parseFloat(from) === 0 && parseFloat(to) === 0.5) return '0 - 0.5 KG'
    if (parseFloat(from) === 0.5 && parseFloat(to) === 1) return '0.5 - 1 KG'
    return `${from} - ${to} KG`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing rates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-sky-600" />
              Service & Pricing Management
            </h1>
            <p className="text-gray-600 mt-1">Configure service types, names, and their corresponding rates</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCityModal(true)}
              className="px-4 py-2 border-2 border-emerald-600 text-emerald-600 bg-white rounded-md hover:bg-emerald-50 transition-colors flex items-center gap-2 font-medium"
            >
              <MapPin className="w-4 h-4" />
              Manage Cities
            </button>
            <button
              onClick={() => setShowServiceModal(true)}
              className="px-4 py-2 border-2 border-sky-600 text-sky-600 bg-white rounded-md hover:bg-sky-50 transition-colors flex items-center gap-2 font-medium"
            >
              <Settings2 className="w-4 h-4" />
              Manage Services
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors flex items-center gap-2 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${reduxLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Service Type (Product)</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters(f => ({ ...f, serviceType: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium"
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Origin</label>
            <select
              value={filters.originCity}
              onChange={(e) => setFilters(f => ({ ...f, originCity: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium"
            >
              <option value="">All Origins</option>
              {activeCities.map(city => <option key={city.id} value={city.id}>{city.cityName}</option>)}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Destination</label>
            <select
              value={filters.destinationCity}
              onChange={(e) => setFilters(f => ({ ...f, destinationCity: e.target.value }))}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium"
            >
              <option value="">All Destinations</option>
              {activeCities.map(city => <option key={city.id} value={city.id}>{city.cityName}</option>)}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-sky-600 text-white text-sm font-bold rounded-md hover:bg-sky-700 transition-all flex items-center gap-2 shadow-sm shadow-sky-100"
          >
            <Search className="w-4 h-4" />
            Find Rates
          </button>

          <button
            onClick={() => setFilters({ originCity: '', destinationCity: '', serviceType: 'General' })}
            className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-8">
        {filters.serviceType === 'Attestation' ? (
          // Attestation Services Table
          attestationServices.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-20 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No attestation services found</p>
            </div>
          ) : (
            <AttestationPricingTable
              services={attestationServices}
              onUpdateRate={async (ruleId, data) => {
                await api.updatePricingRule(ruleId, data)
                dispatch(fetchAllPricing())
              }}
            />
          )
        ) : (
          // Regular Weight-Based Pricing Grid
          Object.keys(groupedByRoute).length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-20 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No rates found for the selected filters</p>
            </div>
          ) : (
            Object.values(groupedByRoute).map((routeGroup, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{routeGroup.route}</h3>
                    <p className="text-xs font-bold text-sky-600 tracking-widest">{routeGroup.routeCode}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Current Filter</p>
                      <p className="text-sm font-bold text-gray-700">{filters.serviceType}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky left-0 bg-gray-50 z-10 w-48">Weight Tier</th>
                        {activeServiceColumns.map(service => (
                          <th key={service.id} className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[140px]">
                            {service.serviceName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {routeGroup.weightRanges.map((tier, tIdx) => (
                        <tr key={tIdx} className="hover:bg-sky-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-700 sticky left-0 bg-white group-hover:bg-sky-50/80 transition-colors">
                            {formatWeight(tier.weightFrom, tier.weightTo)}
                          </td>
                          {activeServiceColumns.map(service => {
                            const rule = tier.services[service.id]
                            return (
                              <td key={service.id} className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`text-sm font-bold ${rule ? 'text-sky-900' : 'text-gray-300'}`}>
                                    {formatCurrency(rule ? rule.baseRate : 0)}
                                  </span>
                                  <button
                                    onClick={() => setEditingRule({
                                      ...(rule || {}),
                                      id: rule?.id,
                                      serviceName: service.serviceName,
                                      serviceId: service.id,
                                      originCity: routeGroup.route.split(' → ')[0],
                                      destinationCity: routeGroup.route.split(' → ')[1],
                                      originCityId: routeGroup.originCityId,
                                      destinationCityId: routeGroup.destinationCityId,
                                      weightFrom: tier.weightFrom,
                                      weightTo: tier.weightTo,
                                      baseRate: rule ? rule.baseRate : 0
                                    })}
                                    className={`p-1 hover:text-sky-600 transition-all ${rule ? 'opacity-0 group-hover:opacity-100' : 'text-gray-200'}`}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Service Management Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-sky-600 p-6 flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-xl font-black uppercase tracking-tight">Service Management</h2>
                <p className="text-sky-100 text-xs font-bold">Define your product types and available services</p>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-2 hover:bg-sky-500 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Add New Service */}
              <div className="space-y-6">
                <div className="bg-sky-50 p-6 rounded-xl border border-sky-100">
                  <h3 className="text-sm font-black text-sky-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Service
                  </h3>
                  <form onSubmit={handleCreateService} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-sky-600 uppercase mb-1">Service Type (Product)</label>
                      <select
                        required
                        value={newService.serviceType}
                        onChange={e => setNewService(s => ({ ...s, serviceType: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-900"
                      >
                        {PRODUCT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-sky-600 uppercase mb-1">Service Name (e.g. Over Night)</label>
                      <input
                        type="text"
                        required
                        value={newService.serviceName}
                        onChange={e => setNewService(s => ({ ...s, serviceName: e.target.value }))}
                        placeholder="Over Night"
                        className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isServiceSubmitting}
                      className="w-full bg-sky-600 text-white py-3 rounded-lg font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
                    >
                      {isServiceSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Service'}
                    </button>
                  </form>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed italic">
                  <strong>Technical Note:</strong> When you add a new service, it will appear as a column in the rates table. To set prices, you'll need to update existing weight tiers or use the bulk seeder (coming soon).
                </div>
              </div>

              {/* Right: Existing Services List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Active Services
                </h3>
                <div className="space-y-3">
                  {services.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic text-sm">No services configured yet</div>
                  ) : (
                    services
                      .filter(s => PRODUCT_TYPES.includes(s.serviceType))
                      .reduce((acc, s) => {
                        const typeIdx = acc.findIndex(g => g.type === s.serviceType)
                        if (typeIdx > -1) acc[typeIdx].list.push(s)
                        else acc.push({ type: s.serviceType, list: [s] })
                        return acc
                      }, []).map(group => (
                        <div key={group.type} className="border border-gray-100 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">{group.type}</div>
                          <div className="p-2 space-y-1">
                            {group.list.map(s => (
                              <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg group transition-colors ${s.status === 'active' ? 'hover:bg-gray-50' : 'bg-red-50/30'}`}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-700">{s.serviceName}</span>
                                  {s.status === 'inactive' && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Inactive</span>}
                                </div>
                                <div className="flex gap-1 items-center">
                                  {s.status === 'inactive' && (
                                    <button
                                      onClick={() => handleActivateService(s.id)}
                                      className="p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                      title="Reactivate Service"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteService(s.id, s.status)}
                                    className={`p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${s.status === 'active' ? 'text-red-300 hover:text-red-500 hover:bg-red-50' : 'text-red-500 hover:bg-red-100'}`}
                                    title={s.status === 'active' ? 'Deactivate Service' : 'Permanently Delete Service'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* City Management Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-emerald-600 p-6 flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-xl font-black uppercase tracking-tight">City Management</h2>
                <p className="text-emerald-100 text-xs font-bold">Manage operational cities and their identifiers</p>
              </div>
              <button
                onClick={() => setShowCityModal(false)}
                className="p-2 hover:bg-emerald-500 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Add New City */}
              <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                  <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New City
                  </h3>
                  <form onSubmit={handleCreateCity} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">City Name (e.g. Islamabad)</label>
                      <input
                        type="text"
                        required
                        value={newCity.cityName}
                        onChange={e => setNewCity(s => ({ ...s, cityName: e.target.value }))}
                        placeholder="Islamabad"
                        className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-bold text-emerald-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">City Code (3 Letters, e.g. ISB)</label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        value={newCity.cityCode}
                        onChange={e => setNewCity(s => ({ ...s, cityCode: e.target.value.toUpperCase() }))}
                        placeholder="ISB"
                        className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-bold text-emerald-900"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCitySubmitting}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                    >
                      {isCitySubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add City'}
                    </button>
                  </form>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed italic">
                  <strong>Technical Note:</strong> When you add a new city, it will become available in the Origin and Destination filters globally. Pricing rules for new routes will need to be configured separately.
                </div>
              </div>

              {/* Right: Existing Cities List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Operational Cities
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {cities.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic text-sm">No cities configured yet</div>
                  ) : (
                    cities.map(city => (
                      <div key={city.id} className={`flex items-center justify-between p-3 border rounded-xl group transition-all ${city.status === 'active' ? 'border-gray-100 hover:bg-emerald-50' : 'border-red-100 bg-red-50/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${city.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {city.cityCode}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">{city.cityName}</span>
                            {city.status === 'inactive' && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Inactive</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          {city.status === 'inactive' && (
                            <button
                              onClick={() => handleActivateCity(city.id)}
                              className="p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-md transition-all opacity-0 group-hover:opacity-100"
                              title="Reactivate City"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCity(city.id, city.status)}
                            className={`p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${city.status === 'active' ? 'text-red-300 hover:text-red-500 hover:bg-red-50' : 'text-red-500 hover:bg-red-100'}`}
                            title={city.status === 'active' ? 'Deactivate City' : 'Permanently Delete City'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal (Synced with Route Symmetry) */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-sky-600 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Update Rate</h3>
                <p className="text-sky-100 text-[10px] font-bold tracking-widest uppercase">Symmetry Mode Active</p>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="text-white hover:bg-sky-500 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="p-8 space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>Route</span>
                  <span className="text-sky-600">{editingRule.originCity} → {editingRule.destinationCity}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>Service</span>
                  <span className="text-sky-600">{editingRule.serviceName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                  <span>Weight Range</span>
                  <span className="text-sky-600">{formatWeight(editingRule.weightFrom, editingRule.weightTo)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Base Rate (PKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">PKR</span>
                  <input
                    type="number"
                    required
                    autoFocus
                    value={editingRule.baseRate}
                    onChange={e => setEditingRule(prev => ({ ...prev, baseRate: e.target.value }))}
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-lg font-black text-gray-900 transition-all"
                  />
                </div>
              </div>

              <div className="bg-sky-50 p-4 rounded-xl text-[10px] font-bold text-sky-700 leading-relaxed text-center italic">
                {editingRule.originCity !== editingRule.destinationCity
                  ? `Note: The reverse route price for ${editingRule.destinationCity} to ${editingRule.originCity} will also be updated automatically.`
                  : "Intra-city route: Changes only affect this specific city pool."}
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-sky-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-sky-100 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
