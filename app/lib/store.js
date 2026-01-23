'use client'

import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from './api'

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    batchInfo: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.batchInfo = null
      state.isAuthenticated = false
      state.error = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('batchInfo')
      }
    },
    setCredentials: (state, action) => {
      const { token, user, batchInfo } = action.payload
      state.token = token
      state.user = user
      state.batchInfo = batchInfo || { status: 'none' }
      state.isAuthenticated = true
      state.error = null
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('batchInfo', JSON.stringify(state.batchInfo))
      }
    },
    clearError: (state) => {
      state.error = null
    },
    setBatchInfo: (state, action) => {
      state.batchInfo = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('batchInfo', JSON.stringify(action.payload))
      }
    },
    loadFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        const batchInfoStr = localStorage.getItem('batchInfo')
        if (token && userStr) {
          try {
            state.token = token
            state.user = JSON.parse(userStr)
            state.batchInfo = batchInfoStr ? JSON.parse(batchInfoStr) : { status: 'none' }
            state.isAuthenticated = true
          } catch (error) {
            // If parsing fails, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('batchInfo')
            state.token = null
            state.user = null
            state.batchInfo = null
            state.isAuthenticated = false
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        console.log('Login fulfilled payload:', action.payload) // Debug log

        // Handle different response structures
        // Check nested structures: data.access_token, data.token, etc.
        const payload = action.payload
        const token = payload?.access_token
          || payload?.token
          || payload?.accessToken
          || payload?.data?.access_token
          || payload?.data?.token
          || payload?.data?.accessToken

        const user = payload?.user
          || payload?.data?.user
          || payload?.data
          || {}

        const batchInfo = payload?.batchInfo || payload?.data?.batchInfo || { status: 'none' }

        console.log('Extracted token:', token ? 'Found' : 'NOT FOUND') // Debug log
        console.log('Extracted user:', user) // Debug log
        console.log('Extracted batchInfo:', batchInfo) // Debug log

        if (!token) {
          console.error('Token not found in response. Full payload:', payload) // Debug log
          state.error = 'Invalid login response: token not found. Please check server response.'
          state.isAuthenticated = false
          return
        }

        state.token = token
        state.user = user
        state.batchInfo = batchInfo
        state.isAuthenticated = true
        state.error = null

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('batchInfo', JSON.stringify(batchInfo))
          console.log('Data stored in localStorage') // Debug log
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
        state.isAuthenticated = false
      })
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
  },
})

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await api.login(username, password)
      console.log('Login API response:', data) // Debug log
      // Check if data has the expected structure
      if (!data) {
        return rejectWithValue('No data received from server')
      }
      return data
    } catch (error) {
      console.error('Login error:', error) // Debug log
      return rejectWithValue(error.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (registrationData, { rejectWithValue }) => {
    try {
      // Support both old format (username, password) and new format (object with all fields)
      const payload = typeof registrationData === 'object' && !registrationData.username
        ? registrationData
        : { username: registrationData.username, password: registrationData.password, ...registrationData }

      const data = await api.register(
        payload.username,
        payload.password,
        payload.email,
        payload.role,
        payload.name,
        payload.phone,
        payload.cityId
      )
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const { logout, setCredentials, clearError, loadFromStorage, setBatchInfo } = authSlice.actions

// Bookings Slice
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,
    pagination: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    },
  },
  extraReducers: (builder) => {
    // Fetch bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle both paginated {data: [], pagination: {}} and flat [] responses
        if (Array.isArray(action.payload)) {
          state.bookings = action.payload
          state.pagination = null
        } else {
          state.bookings = action.payload?.data || []
          state.pagination = action.payload?.pagination || null
        }
        state.error = null
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings.unshift(action.payload)
        state.error = null
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Fetch single booking
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBooking = action.payload
        state.error = null
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Update booking
    builder
      .addCase(updateBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.bookings.findIndex(b => b.id === action.payload.id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload
        }
        state.error = null
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings = state.bookings.filter(b => b.id !== action.meta.arg)
        if (state.currentBooking?.id === action.meta.arg) {
          state.currentBooking = null
        }
        state.error = null
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Track booking
    builder
      .addCase(trackBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(trackBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBooking = action.payload
        state.error = null
      })
      .addCase(trackBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
  },
})

// Booking Async Thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getBookings(params)
      // Robustly handle both transformed and raw array responses
      return response?.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      console.log('Creating booking with data:', bookingData) // Debug log
      const response = await api.createBooking(bookingData)
      console.log('Booking created successfully:', response) // Debug log
      return response?.data || response
    } catch (error) {
      console.error('Booking creation error:', error) // Debug log
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getBookingById(id)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBooking = createAsyncThunk(
  'bookings/update',
  async ({ id, bookingData }, { rejectWithValue }) => {
    try {
      const response = await api.updateBooking(id, bookingData)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.cancelBooking(id)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const trackBooking = createAsyncThunk(
  'bookings/track',
  async (cnNumber, { rejectWithValue }) => {
    try {
      const response = await api.trackBooking(cnNumber)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const { clearError: clearBookingsError, setCurrentBooking, clearCurrentBooking } = bookingsSlice.actions

// Tracking Slice
const trackingSlice = createSlice({
  name: 'tracking',
  initialState: {
    trackingData: null,
    cnList: [],
    isLoading: false,
    isLoadingCns: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearTrackingData: (state) => {
      state.trackingData = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackShipment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(trackShipment.fulfilled, (state, action) => {
        state.isLoading = false
        state.trackingData = action.payload
        state.error = null
      })
      .addCase(trackShipment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
        state.trackingData = null
      })
    // Fetch user CNs
    builder
      .addCase(fetchUserCns.pending, (state) => {
        state.isLoadingCns = true
        state.error = null
      })
      .addCase(fetchUserCns.fulfilled, (state, action) => {
        state.isLoadingCns = false
        state.cnList = action.payload
        state.error = null
      })
      .addCase(fetchUserCns.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
  },
})

// Pickup Slice
const pickupSlice = createSlice({
  name: 'pickups',
  initialState: {
    pickups: [],
    eligibleBookings: [],
    currentPickup: null,
    isLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentPickup: (state, action) => {
      state.currentPickup = action.payload
    },
  },
  extraReducers: (builder) => {
    // Create pickup
    builder
      .addCase(createPickupRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.isLoading = false
        state.pickups.unshift(action.payload)
        state.success = true
        state.error = null
      })
      .addCase(createPickupRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
        state.success = false
      })
    // Fetch all pickups (admin)
    builder
      .addCase(fetchAllPickups.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllPickups.fulfilled, (state, action) => {
        state.isLoading = false
        state.pickups = action.payload
        state.error = null
      })
      .addCase(fetchAllPickups.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Fetch my pickups
    builder
      .addCase(fetchMyPickups.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyPickups.fulfilled, (state, action) => {
        state.isLoading = false
        state.pickups = action.payload
        state.error = null
      })
      .addCase(fetchMyPickups.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Fetch eligible bookings
    builder
      .addCase(fetchEligibleBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEligibleBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.eligibleBookings = action.payload
        state.error = null
      })
      .addCase(fetchEligibleBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
    // Cancel pickup
    builder
      .addCase(cancelPickupRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelPickupRequest.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.pickups.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.pickups[index] = action.payload
        }
        state.error = null
      })
      .addCase(cancelPickupRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
      .addCase(updatePickupStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePickupStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedPickup = action.payload
        state.pickups = state.pickups.map(p => p.id === updatedPickup.id ? updatedPickup : p)
        state.success = true
      })
      .addCase(updatePickupStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
  },
})

// Tracking Async Thunks
export const trackShipment = createAsyncThunk(
  'tracking/trackShipment',
  async (cnNumber, { rejectWithValue }) => {
    try {
      const response = await api.trackShipment(cnNumber)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchUserCns = createAsyncThunk(
  'tracking/fetchUserCns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMyCns()
      // Robustly handle both transformed and raw array responses
      return response?.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Pickup Async Thunks
export const createPickupRequest = createAsyncThunk(
  'pickups/create',
  async (pickupData, { rejectWithValue }) => {
    try {
      const response = await api.createPickupRequest(pickupData)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAllPickups = createAsyncThunk(
  'pickups/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getAllPickups()
      return response?.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchMyPickups = createAsyncThunk(
  'pickups/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMyPickups()
      // Robustly handle both transformed and raw array responses
      return response?.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchEligibleBookings = createAsyncThunk(
  'pickups/fetchEligible',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getEligibleBookings()
      // Robustly handle both transformed and raw array responses
      return response?.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const cancelPickupRequest = createAsyncThunk(
  'pickups/cancel',
  async (pickupId, { rejectWithValue }) => {
    try {
      const response = await api.cancelPickupRequest(pickupId)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updatePickupStatus = createAsyncThunk(
  'pickups/updateStatus',
  async ({ id, status, riderId }, { rejectWithValue }) => {
    try {
      const response = await api.updatePickupStatus(id, status, riderId)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const { clearError: clearTrackingError, clearTrackingData } = trackingSlice.actions
export const { clearError: clearPickupsError, clearSuccess: clearPickupsSuccess, setCurrentPickup } = pickupSlice.actions

// Customers Slice
const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = action.payload
        state.error = null
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
    // Add customer
    builder
      .addCase(addCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        // Refresh customers list after adding
        state.error = null
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
  },
})

// Customer Async Thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getCustomers()
      return response?.data || (Array.isArray(response) ? response : [])
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addCustomer = createAsyncThunk(
  'customers/add',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.createCustomer(customerData)
      return response?.data || response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const { clearError: clearCustomersError } = customersSlice.actions

// Pricing Slice
const pricingSlice = createSlice({
  name: 'pricing',
  initialState: {
    rules: [],
    cities: [],
    services: [],
    isLoading: false,
    isLoaded: false,
    error: null,
  },
  reducers: {
    clearPricingError: (state) => {
      state.error = null
    },
    resetPricing: (state) => {
      state.isLoaded = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPricing.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllPricing.fulfilled, (state, action) => {
        state.isLoading = false
        state.isLoaded = true
        state.rules = action.payload.rules
        state.cities = action.payload.cities
        state.services = action.payload.services
        state.error = null
      })
      .addCase(fetchAllPricing.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
  }
})

export const fetchAllPricing = createAsyncThunk(
  'pricing/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [rulesResponse, citiesResponse, servicesResponse] = await Promise.all([
        api.getPricingRules(),
        api.getCities(),
        api.getServices(),
      ])

      return {
        rules: Array.isArray(rulesResponse) ? rulesResponse : (rulesResponse?.data || []),
        cities: Array.isArray(citiesResponse) ? citiesResponse : (citiesResponse?.data || []),
        services: Array.isArray(servicesResponse) ? servicesResponse : (servicesResponse?.data || []),
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const { clearPricingError, resetPricing } = pricingSlice.actions

// Store Configuration
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    bookings: bookingsSlice.reducer,
    tracking: trackingSlice.reducer,
    pickups: pickupSlice.reducer,
    customers: customersSlice.reducer,
    pricing: pricingSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setCredentials', 'auth/loadFromStorage'],
      },
    }),
})

export default store

