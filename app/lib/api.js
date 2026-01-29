// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1'

/**
 * API utility functions
 */
export const api = {
  /**
   * Base URL for API requests
   */
  baseURL: API_BASE_URL,

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint (e.g., '/auth/login')
   * @param {object} options - Fetch options
   * @returns {Promise<Response>}
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`API Request: ${options.method || 'GET'} ${url}`)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const isAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register'

    // Check if token exists for protected routes (except login/register)
    if (!token && !isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('No authentication token found. Please login.')
    }

    // Don't set Content-Type for FormData (browser will set it with boundary)
    const isFormData = options.body instanceof FormData
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    }

    if (token && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      return response
    } catch (error) {
      throw new Error(`Network error: ${error.message}`)
    }
  },

  /**
   * Handle API response and parse JSON
   * @param {Response} response - Fetch response
   * @param {string} endpoint - API endpoint (to check if it's auth endpoint)
   * @returns {Promise<object>}
   */
  async handleResponse(response, endpoint = '') {
    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`

      if (isJson) {
        try {
          const errorData = await response.json()
          console.log('API Error RAW:', errorData)

          // Try to extract the best possible string message
          let message = 'An error occurred'

          if (typeof errorData.message === 'string') {
            message = errorData.message
          } else if (Array.isArray(errorData.message)) {
            message = errorData.message.join(', ')
          } else if (errorData.error && typeof errorData.error === 'string') {
            message = errorData.error
          } else if (errorData.error && typeof errorData.error === 'object') {
            message = errorData.error.message || errorData.error.error || JSON.stringify(errorData.error)
          } else if (errorData.message && typeof errorData.message === 'object') {
            message = errorData.message.message || JSON.stringify(errorData.message)
          }

          errorMessage = message
        } catch (e) {
          console.error('API Error: JSON parse failed', e)
        }
      } else {
        try {
          const text = await response.text()
          if (text) errorMessage = text
        } catch (e) { }
      }

      // Handle specific status codes
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        throw new Error('Session expired. Please login again.')
      }

      // Final string conversion safety
      if (typeof errorMessage !== 'string') {
        errorMessage = JSON.stringify(errorMessage)
      }

      console.log('API: Throwing Error with string:', errorMessage)
      throw new Error(String(errorMessage))
    }

    if (isJson) {
      return await response.json()
    }

    return await response.text()
  },

  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<object>} - Auth response with token and user
   */
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return this.handleResponse(response, '/auth/login')
  },

  /**
   * Register new user
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} email - Email (optional)
   * @param {string} role - User role (optional, defaults to USER)
   * @param {string} name - Full name (optional)
   * @param {string} phone - Phone number (optional)
   * @param {string} cityId - City ID (optional)
   * @returns {Promise<object>} - Created user
   */
  async register(username, password, email, role, name, phone, cityId) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        email,
        role,
        name,
        phone,
        cityId,
      }),
    })
    return this.handleResponse(response, '/auth/register')
  },

  /**
   * Register employee (admin only)
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} staffCode - Staff code
   * @param {string} role - User role (USER, ADMIN, SUPER_ADMIN)
   * @returns {Promise<object>} - Created employee
   */
  async registerEmployee(username, password, staffCode, role) {
    const response = await this.request('/auth/admin/register-employee', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        staffCode,
        role,
      }),
    })
    return this.handleResponse(response, '/auth/admin/register-employee')
  },

  /**
   * Create new consignment/booking with file uploads
   * @param {object} bookingData - Booking data
   * @param {File[]} files - Optional array of document files
   * @returns {Promise<object>} - Created booking
   */
  async createConsignment(bookingData, files = []) {
    console.log('API createConsignment called with:', bookingData) // Debug log

    const formData = new FormData()

    // Add all booking fields to FormData
    Object.keys(bookingData).forEach(key => {
      const value = bookingData[key]
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !(value instanceof File)) {
          // Stringify objects/arrays
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
    })

    // Add files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('documents', file)
      })
    }

    const response = await this.request('/consignments', {
      method: 'POST',
      body: formData,
    })
    console.log('API createConsignment response status:', response.status) // Debug log
    return this.handleResponse(response, '/consignments')
  },

  /**
   * Approve a pending consignment
   * @param {string} id - Booking ID
   * @param {object} approveData - Approval data (cnNumber, rate, etc.)
   * @returns {Promise<object>} - Updated consignment
   */
  async approveConsignment(id, approveData) {
    const response = await this.request(`/consignments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(approveData),
    })
    return this.handleResponse(response)
  },

  /**
   * Create new booking (legacy method - redirects to createConsignment)
   * @param {object} bookingData - Booking data
   * @returns {Promise<object>} - Created booking
   */
  async createBooking(bookingData) {
    console.log('API createBooking called with:', bookingData) // Debug log
    const response = await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
    console.log('API createBooking response status:', response.status) // Debug log
    return this.handleResponse(response, '/bookings')
  },

  /**
   * Get all bookings with optional filters
   * @param {object} params - Query parameters (page, limit, status, startDate, endDate, cnNumber)
   * @returns {Promise<object>} - Bookings list with pagination
   */
  async getBookings(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/consignments${queryString ? `?${queryString}` : ''}`
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get all consignments with optional filters
   * @param {object} params - Query parameters (status, customerId, startDate, endDate, cnNumber)
   * @returns {Promise<object>} - Consignments list
   */
  async getConsignments(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/consignments${queryString ? `?${queryString}` : ''}`
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get daily summary and bookings
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<object>} - Summary and bookings list
   */
  async getDailySummary(date) {
    const response = await this.request(`/consignments/daily-summary?date=${date}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<object>} - Booking details
   */
  async getBookingById(id) {
    const response = await this.request(`/consignments/${id}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Track booking by CN number
   * @param {string} cnNumber - CN number
   * @returns {Promise<object>} - Booking details
   */
  async trackBooking(cnNumber) {
    const response = await this.request(`/consignments/track/${cnNumber}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Alias for trackBooking
   */
  trackShipment(cnNumber) {
    return this.trackBooking(cnNumber)
  },

  async getMyCns() {
    const response = await this.request('/consignments/my-cns', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },
  /**
   * Void a consignment by CN number
   * @param {string} cnNumber - CN number
   * @param {string} reason - Reason for voiding
   * @returns {Promise<object>} - Voided consignment
   */
  async voidConsignment(cnNumber, reason) {
    const response = await this.request(`/consignments/void/${cnNumber}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    return this.handleResponse(response)
  },

  /**
   * Update booking
   * @param {string} id - Booking ID
   * @param {object} bookingData - Updated booking data
   * @returns {Promise<object>} - Updated booking
   */
  async updateBooking(id, bookingData) {
    const response = await this.request(`/consignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bookingData),
    })
    return this.handleResponse(response)
  },

  /**
   * Cancel booking
   * @param {string} id - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<object>} - Cancelled booking
   */
  async cancelBooking(id, reason) {
    const response = await this.request(`/consignments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    return this.handleResponse(response)
  },

  /**
   * Get user profile
   * @returns {Promise<object>} - User profile
   */
  async getProfile() {
    const response = await this.request('/users/profile', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  // Batch Methods
  async createBatch(batchData) {
    const response = await this.request('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    })
    return this.handleResponse(response)
  },

  async getBatches(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/batches${queryString ? `?${queryString}` : ''}`
    console.log(`API: getBatches calling ${endpoint}`)
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getLatestBatch(stationCode) {
    const response = await this.request(`/batches/latest${stationCode ? `?stationCode=${stationCode}` : ''}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async updateBatchStatus(id, status) {
    const response = await this.request(`/batches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return this.handleResponse(response)
  },

  /**
   * Update user profile
   * @param {object} profileData - Profile data
   * @returns {Promise<object>} - Updated profile
   */
  async updateProfile(profileData) {
    const response = await this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
    return this.handleResponse(response)
  },

  /**
   * Get all users (admin only)
   * @returns {Promise<object>} - Users list
   */
  async getUsers() {
    const response = await this.request('/users', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get customers
   * @returns {Promise<object>} - Customers list
   */
  async getCustomers() {
    const response = await this.request('/customers', {
      method: 'GET',
    })

    return this.handleResponse(response)
  },

  /**
   * Create customer (via registration endpoint)
   * @param {object} customerData - Customer data (username, password, name, phone, email, cityId)
   * @returns {Promise<object>} - Created user/customer
   */
  async createCustomer(customerData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: customerData.username || customerData.phone, // Use phone as username if not provided
        password: customerData.password || this.generateRandomPassword(),
        email: customerData.email,
        role: 'USER',
        name: customerData.name,
        phone: customerData.phone,
        cityId: customerData.cityId,
      }),
    })
    return this.handleResponse(response, '/auth/register')
  },

  /**
   * Generate random password for auto-generated passwords
   * @returns {string} - Random password
   */
  generateRandomPassword() {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
  },
  /**
   * Get system configuration
   * @returns {Promise<object>} - System configuration
   */
  async getConfiguration() {
    const response = await this.request('/configurations', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Update system configuration
   * @param {object} configData - Configuration update data
   * @returns {Promise<object>} - Updated configuration
   */
  async updateConfiguration(configData) {
    const response = await this.request('/configurations', {
      method: 'POST',
      body: JSON.stringify(configData),
    })
    return this.handleResponse(response)
  },

  // Arrival Scan Methods
  async createArrivalScan(scanData) {
    const response = await this.request('/arrival-scans', {
      method: 'POST',
      body: JSON.stringify(scanData),
    })
    return this.handleResponse(response)
  },

  async getArrivalScans(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/arrival-scans${queryString ? `?${queryString}` : ''}`
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getArrivalScanRiders() {
    const response = await this.request('/arrival-scans/riders', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getArrivalScanDetails(id) {
    const response = await this.request(`/arrival-scans/${id}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async updateArrivalScan(id, scanData) {
    const response = await this.request(`/arrival-scans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(scanData),
    })
    return this.handleResponse(response)
  },

  async completeArrivalScan(id) {
    const response = await this.request(`/arrival-scans/${id}/complete`, {
      method: 'POST',
    })
    return this.handleResponse(response)
  },

  async removeShipmentFromScan(scanId, shipmentId) {
    const response = await this.request(`/arrival-scans/${scanId}/shipments/${shipmentId}`, {
      method: 'DELETE',
    })
    return this.handleResponse(response)
  },

  // Manifest APIs
  async createManifest(manifestData) {
    const response = await this.request('/manifests', {
      method: 'POST',
      body: JSON.stringify(manifestData),
    })
    return this.handleResponse(response)
  },

  async getManifests(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/manifests${queryString ? `?${queryString}` : ''}`
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getManifestDrivers() {
    const response = await this.request('/manifests/drivers', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getManifestVehicles() {
    const response = await this.request('/manifests/vehicles', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getManifestDetails(id) {
    const response = await this.request(`/manifests/${id}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async updateManifest(id, manifestData) {
    const response = await this.request(`/manifests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(manifestData),
    })
    return this.handleResponse(response)
  },

  async completeManifest(id) {
    const response = await this.request(`/manifests/${id}/complete`, {
      method: 'POST',
    })
    return this.handleResponse(response)
  },

  async removeShipmentFromManifest(manifestId, shipmentId) {
    const response = await this.request(`/manifests/${manifestId}/shipments/${shipmentId}`, {
      method: 'DELETE',
    })
    return this.handleResponse(response)
  },

  // Delivery Sheet APIs
  async createDeliverySheet(data) {
    const response = await this.request('/delivery-sheets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  async getDeliverySheetRoutes() {
    const response = await this.request('/delivery-sheets/routes', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getDeliverySheets(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/delivery-sheets${queryString ? `?${queryString}` : ''}`
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getDeliverySheetDetails(id) {
    const response = await this.request(`/delivery-sheets/${id}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async updateDeliverySheet(id, data) {
    const response = await this.request(`/delivery-sheets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  async completeDeliverySheet(id) {
    const response = await this.request(`/delivery-sheets/${id}/complete`, {
      method: 'POST',
    })
    return this.handleResponse(response)
  },

  async removeShipmentFromDeliverySheet(sheetId, shipmentId) {
    const response = await this.request(`/delivery-sheets/${sheetId}/shipments/${shipmentId}`, {
      method: 'DELETE',
    })
    return this.handleResponse(response)
  },

  // Delivery Phase 2 APIs
  async getDeliverySheetForPhase2(sheetNumber) {
    const response = await this.request(`/delivery-sheets/phase2/${sheetNumber}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async updateDeliveryShipmentStatus(sheetId, shipmentId, data) {
    const response = await this.request(`/delivery-sheets/${sheetId}/shipments/${shipmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  async closeDeliverySheet(sheetId) {
    const response = await this.request(`/delivery-sheets/${sheetId}/close`, {
      method: 'POST',
    })
    return this.handleResponse(response)
  },

  // Pickup Request APIs
  async createPickupRequest(pickupData) {
    const response = await this.request('/pickups', {
      method: 'POST',
      body: JSON.stringify(pickupData),
    })
    return this.handleResponse(response)
  },

  async getAllPickups(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const response = await this.request(`/pickups/admin/all${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getMyPickups() {
    const response = await this.request('/pickups/my', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async getEligibleBookings() {
    const response = await this.request('/pickups/eligible-bookings', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  async updatePickupStatus(id, status, riderId, riderName) {
    const body = { status }
    if (riderId) body.riderId = riderId
    if (riderName) body.riderName = riderName
    const response = await this.request(`/pickups/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return this.handleResponse(response)
  },

  async cancelPickupRequest(pickupId) {
    const response = await this.request(`/pickups/${pickupId}/cancel`, {
      method: 'POST',
    })
    return this.handleResponse(response)
  },

  /**
   * Get all pricing rules
   * @param {object} params - Query parameters (originCityId, destinationCityId)
   * @returns {Promise<object>} - Pricing rules list
   */
  async getPricingRules(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/pricing/rules${queryString ? `?${queryString}` : ''}`
    const response = await this.request(endpoint, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get all cities
   * @returns {Promise<object>} - Cities list
   */
  async getCities() {
    const response = await this.request('/pricing/cities', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get all services
   * @returns {Promise<object>} - Services list
   */
  async getServices() {
    const response = await this.request('/pricing/services', {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Get subservices for a given service category
   * @param {string} serviceName - Service category name (e.g., 'NPS All Services')
   * @returns {Promise<Array>} - Array of subservices
   */
  async getSubservices(serviceName) {
    const response = await this.request(`/pricing/subservices?serviceName=${encodeURIComponent(serviceName)}`, {
      method: 'GET',
    })
    return this.handleResponse(response)
  },

  /**
   * Create a new pricing rule
   * @param {object} data - Rule data
   * @returns {Promise<object>} - Created rule
   */
  async createPricingRule(data) {
    const response = await this.request('/pricing/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  /**
   * Update a pricing rule
   * @param {string} id - Rule ID
   * @param {object} data - Update data (baseRate, ratePerKg, etc.)
   * @returns {Promise<object>} - Updated rule
   */
  async updatePricingRule(id, data) {
    const response = await this.request(`/pricing/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  /**
   * Create a new service
   * @param {object} data - Service data (serviceName, serviceType, serviceCode)
   * @returns {Promise<object>} - Created service
   */
  async createService(data) {
    const response = await this.request('/pricing/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  /**
   * Update a service
   * @param {string} id - Service ID
   * @param {object} data - Update data (serviceName, serviceType, status)
   * @returns {Promise<object>} - Updated service
   */
  async updateService(id, data) {
    const response = await this.request(`/pricing/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  /**
   * Delete or deactivate a service
   * @param {string} id - Service ID
   * @returns {Promise<object>} - Result
   */
  async deleteService(id) {
    const response = await this.request(`/pricing/services/${id}`, {
      method: 'DELETE',
    })
    return this.handleResponse(response)
  },

  /**
   * Create a new city
   * @param {object} data - City data (cityName, cityCode)
   * @returns {Promise<object>} - Created city
   */
  async createCity(data) {
    const response = await this.request('/pricing/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  /**
   * Update a city
   * @param {string} id - City ID
   * @param {object} data - Update data (cityName, cityCode, status)
   * @returns {Promise<object>} - Updated city
   */
  async updateCity(id, data) {
    const response = await this.request(`/pricing/cities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  },

  /**
   * Delete or deactivate a city
   * @param {string} id - City ID
   * @returns {Promise<object>} - Result
   */
  async deleteCity(id) {
    const response = await this.request(`/pricing/cities/${id}`, {
      method: 'DELETE',
    })
    return this.handleResponse(response)
  },
}
