'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { api } from '../../lib/api'
import { fetchAllPricing } from '../../lib/store'
import { Filter, RefreshCw, TrendingUp, MapPin, Package, Loader2, Pencil, X } from 'lucide-react'

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
  })
  const [editingRule, setEditingRule] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

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

      // Whitelist of cities we care about
      const WHITELIST_CODES = ['ISB', 'LHE', 'GUJ', 'SLT', 'NRL']

      // Deduplicate and Filter Cities by WHITELIST
      const uniqueCitiesMap = new Map()
      rawCities.forEach(city => {
        if (city && city.cityCode) {
          const code = city.cityCode.toUpperCase()
          if (WHITELIST_CODES.includes(code) && !uniqueCitiesMap.has(code)) {
            uniqueCitiesMap.set(code, city)
          }
        }
      })
      const cleanCities = Array.from(uniqueCitiesMap.values())

      // Deduplicate Services by serviceCode
      const uniqueServicesMap = new Map()
      rawServices.forEach(service => {
        if (service && service.serviceCode && !uniqueServicesMap.has(service.serviceCode)) {
          uniqueServicesMap.set(service.serviceCode, service)
        }
      })
      const cleanServices = Array.from(uniqueServicesMap.values())

      // Whitelist of active services
      const ACTIVE_SERVICES = ['Over Night', 'L-Flayer', 'Blue Box', 'On Time Service']

      // Filter and Deduplicate Rules to only include Whitelisted Cities AND Active Services
      const uniqueRulesMap = new Map()
      rawRules.forEach(rule => {
        const originCode = rule.originCity?.cityCode?.toUpperCase()
        const destCode = rule.destinationCity?.cityCode?.toUpperCase()
        const serviceName = rule.service?.serviceName

        if (
          WHITELIST_CODES.includes(originCode) &&
          WHITELIST_CODES.includes(destCode) &&
          ACTIVE_SERVICES.includes(serviceName)
        ) {
          const key = `${rule.originCityId}-${rule.destinationCityId}-${rule.serviceId}-${rule.weightFrom}-${rule.weightTo}`
          if (!uniqueRulesMap.has(key)) {
            uniqueRulesMap.set(key, rule)
          }
        }
      })
      const cleanRules = Array.from(uniqueRulesMap.values())

      setPricingRules(cleanRules)
      setCities(cleanCities)
      setServices(cleanServices) // Keep all services in state but we'll show filtered stats

      // Calculate accurate stats
      const uniqueRoutes = new Set(cleanRules.map(r =>
        `${r.originCityId}-${r.destinationCityId}`
      ))

      setStats({
        totalRules: cleanRules.length,
        routes: uniqueRoutes.size,
        cities: cleanCities.length,
        services: ACTIVE_SERVICES.length
      })
    } catch (err) {
      console.error('Error processing pricing data:', err)
      setError('Failed to process pricing data.')
    } finally {
      setLoading(false)
    }
  }

  // Refresh handler specifically for the component
  const handleRefresh = () => {
    dispatch(fetchAllPricing())
  }

  // Filter and group pricing rules
  const filteredRules = (Array.isArray(pricingRules) ? pricingRules : []).filter((rule) => {
    if (filters.originCity && rule.originCity?.id !== filters.originCity) return false
    if (filters.destinationCity && rule.destinationCity?.id !== filters.destinationCity) return false
    return true
  })

  // Group rules by route only, then organize by weight and service
  const groupedByRoute = filteredRules.reduce((acc, rule) => {
    const routeKey = `${rule.originCity?.cityCode || ''}-${rule.destinationCity?.cityCode || ''}`
    const routeName = `${rule.originCity?.cityName || ''} → ${rule.destinationCity?.cityName || ''}`

    if (!acc[routeKey]) {
      acc[routeKey] = {
        route: routeName,
        routeCode: routeKey,
        weightMap: {}, // Map of weight ranges to services
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

    const serviceName = rule.service?.serviceName || 'Unknown'
    acc[routeKey].weightMap[weightKey].services[serviceName] = {
      id: rule.id,
      baseRate: parseFloat(rule.baseRate),
      ratePerKg: parseFloat(rule.ratePerKg),
      additionalCharges: rule.additionalCharges ? parseFloat(rule.additionalCharges) : null,
      status: rule.status,
      // Metadata for editing modal
      originCity: rule.originCity?.cityName,
      destinationCity: rule.destinationCity?.cityName,
      serviceName: serviceName,
      weightFrom: rule.weightFrom,
      weightTo: rule.weightTo,
    }

    return acc
  }, {})

  // Convert weightMap to sorted array for each route
  Object.keys(groupedByRoute).forEach((routeKey) => {
    const weightEntries = Object.entries(groupedByRoute[routeKey].weightMap)
    weightEntries.sort((a, b) => a[1].weightFrom - b[1].weightFrom)
    groupedByRoute[routeKey].weightRanges = weightEntries.map(([key, value]) => value)
  })

  // Service column order
  // Service column order (Excluding Economy)
  const serviceColumns = ['Over Night', 'L-Flayer', 'Blue Box', 'On Time Service']

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      originCity: '',
      destinationCity: '',
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return `PKR ${parseFloat(amount).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatWeight = (from, to) => {
    if (parseFloat(from) === 0 && parseFloat(to) === 0.5) return '0 - 0.5 KG'
    if (parseFloat(from) === 0.5 && parseFloat(to) === 1) return '0.5 - 1 KG'
    return `${from} - ${to} KG`
  }

  const handleUpdatePrice = async (e) => {
    e.preventDefault()
    if (!editingRule) return

    try {
      setIsUpdating(true)
      await api.updatePricingRule(editingRule.id, {
        baseRate: parseFloat(editingRule.baseRate),
      })
      setEditingRule(null)
      dispatch(fetchAllPricing())
    } catch (err) {
      console.error('Error updating rate:', err)
      alert('Failed to update pricing rule')
    } finally {
      setIsUpdating(false)
    }
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
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
              Pricing Rates
            </h1>
            <p className="text-gray-600 mt-1">View and manage all pricing rules across routes and services</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${reduxLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-sky-600">{stats.totalRules}</p>
              </div>
              <Package className="w-8 h-8 text-sky-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Routes</p>
                <p className="text-2xl font-bold text-green-600">{stats.routes}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cities</p>
                <p className="text-2xl font-bold text-purple-600">{stats.cities}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services</p>
                <p className="text-2xl font-bold text-orange-600">{stats.services}</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Origin City</label>
            <select
              value={filters.originCity}
              onChange={(e) => handleFilterChange('originCity', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">All Cities</option>
              {Array.isArray(cities) && cities
                .sort((a, b) => a.cityName.localeCompare(b.cityName))
                .map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination City</label>
            <select
              value={filters.destinationCity}
              onChange={(e) => handleFilterChange('destinationCity', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">All Cities</option>
              {Array.isArray(cities) && cities
                .sort((a, b) => a.cityName.localeCompare(b.cityName))
                .map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityName}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="space-y-6">
        {Object.keys(groupedByRoute).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No pricing rules found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          Object.values(groupedByRoute).map((routeGroup, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{routeGroup.route}</h3>
                    <p className="text-sm text-gray-600 mt-1">{routeGroup.routeCode}</p>
                  </div>
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                    {routeGroup.weightRanges.length} Weight Tiers
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                        WEIGHT
                      </th>
                      {serviceColumns.map((serviceName) => (
                        <th
                          key={serviceName}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                        >
                          {serviceName === 'L-Flayer' ? 'FLYER' : serviceName.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {routeGroup.weightRanges.map((weightRange, weightIndex) => (
                      <tr key={weightIndex} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10">
                          {formatWeight(weightRange.weightFrom, weightRange.weightTo)}
                        </td>
                        {serviceColumns.map((serviceName) => {
                          const serviceData = weightRange.services[serviceName]
                          return (
                            <td
                              key={serviceName}
                              className="px-6 py-4 whitespace-nowrap text-center group"
                            >
                              {serviceData ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatCurrency(serviceData.baseRate)}
                                    </span>
                                    {serviceData.status !== 'active' && (
                                      <span className="text-xs text-gray-500">
                                        ({serviceData.status})
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => setEditingRule({ ...serviceData })}
                                    className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all duration-200"
                                    title="Edit Rate"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
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
        )}
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-sky-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-lg font-bold">Update Pricing</h3>
              <button
                onClick={() => setEditingRule(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="p-6 space-y-4">
              <div className="bg-sky-50 rounded-lg p-4 text-sm text-sky-800 border border-sky-100 mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Route:</span>
                  <span>{editingRule.originCity} → {editingRule.destinationCity}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Service:</span>
                  <span>{editingRule.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Weight:</span>
                  <span>{formatWeight(editingRule.weightFrom, editingRule.weightTo)}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-sky-200 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                  Symmetry Update Active: {editingRule.originCity !== editingRule.destinationCity ?
                    `Price for ${editingRule.destinationCity} → ${editingRule.originCity} will also update.` :
                    'Intra-city route.'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Rate (PKR)
                </label>
                <input
                  type="number"
                  value={editingRule.baseRate}
                  onChange={(e) => setEditingRule({ ...editingRule, baseRate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-sky-400 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
