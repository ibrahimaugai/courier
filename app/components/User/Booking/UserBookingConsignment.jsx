'use client'

import { useState, useEffect, useMemo } from 'react'
import { Edit, Sparkles, X, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllPricing } from '../../../lib/store'
import { api } from '../../../lib/api'
import { printBookingSlip, printCodSlip } from '../../../lib/bookingSlipPrint'
import Toast from '../../Toast'
import UserShipmentDetails from './UserShipmentDetails'
import UserShipper from './UserShipper'
import UserConsignee from './UserConsignee'
import UserOtherAmountSection from './UserOtherAmountSection'
import SubservicesModal from '../../admin/bookings/SubservicesModal'
import OnTimeDeliveryModal from '../../admin/bookings/OnTimeDeliveryModal'

export default function UserBookingConsignment() {
  const dispatch = useDispatch()
  const { rules: reduxRules, cities, services: reduxServices, isLoading: pricingLoading } = useSelector((state) => state.pricing)
  const ATTESTATION_SERVICE_VALUES = [
    'ATS - Doc MOFA Attestation',
    'ATR - Doc MOFA Home Delivery',
    'APN - Apostille Normal',
    'APU - Apostille Urgent',
    'AE - UAE Embassy',
    'BV - Board Verification',
    'HEC - HEC',
    'IBCC - IBCC',
    'National Bureau',
  ]


  const [showMofaModal, setShowMofaModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [showApostilleModal, setShowApostilleModal] = useState(false)
  const [selectedApostilleDocuments, setSelectedApostilleDocuments] = useState([])
  const [showUaeEmbassyModal, setShowUaeEmbassyModal] = useState(false)
  const [selectedUaeEmbassyDocuments, setSelectedUaeEmbassyDocuments] = useState([])
  const [showBoardVerificationModal, setShowBoardVerificationModal] = useState(false)
  const [selectedBoardVerificationDocuments, setSelectedBoardVerificationDocuments] = useState([])
  const [showHecModal, setShowHecModal] = useState(false)
  const [selectedHecDocuments, setSelectedHecDocuments] = useState([])
  const [showIbccModal, setShowIbccModal] = useState(false)
  const [selectedIbccDocuments, setSelectedIbccDocuments] = useState([])
  const [showNationalBureauModal, setShowNationalBureauModal] = useState(false)
  const [selectedNationalBureauDocuments, setSelectedNationalBureauDocuments] = useState([])
  const [showSubservicesModal, setShowSubservicesModal] = useState(false)
  const [selectedSubservices, setSelectedSubservices] = useState([])
  const [subservicesData, setSubservicesData] = useState({}) // Cache subservices by service name
  const [formData, setFormData] = useState({
    product: '',
    destination: '',
    cnNumber: '',
    pieces: '1',
    handlingInstructions: '',
    packetContent: '',
    services: '',
    payMode: '',
    volumetricWeight: '0',
    weight: '',
    // Shipper fields
    mobileNumber: '',
    fullName: '',
    companyName: '',
    address: '',
    address2: '',
    landlineNumber: '',
    emailAddress: '',
    cnicNumber: '',
    // Consignee fields
    consigneeMobileNumber: '',
    consigneeFullName: '',
    consigneeCompanyName: '',
    consigneeAddress: '',
    consigneeAddress2: '',
    consigneeLandlineNumber: '',
    consigneeEmailAddress: '',
    consigneeZipCode: '',
    // Other Amount
    otherAmount: '',
    totalAmount: 0,
    originCity: '', // Should be set based on user profile/selection
    preferredDeliveryDate: '',
    preferredDeliveryTime: '',
  })
  const [showOnTimeDeliveryModal, setShowOnTimeDeliveryModal] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })
  const [documentFiles, setDocumentFiles] = useState([])

  // Fetch pricing data on mount
  useEffect(() => {
    dispatch(fetchAllPricing())
  }, [dispatch])

  // CN Number: when customer selects COD product, get next CN from API (same format as admin)
  useEffect(() => {
    if (!formData.product) {
      setFormData(prev => ({ ...prev, cnNumber: '' }))
      return
    }
    if (formData.product === 'COD') {
      api.getNextCnCod()
        .then((res) => {
          const data = res?.data ?? res
          const cn = data?.cnNumber ?? data?.cn ?? ''
          setFormData(prev => ({ ...prev, cnNumber: cn }))
        })
        .catch((err) => {
          setFormData(prev => ({ ...prev, cnNumber: '' }))
          setToast({
            isVisible: true,
            message: err?.message || 'Could not get CN number. Please try again.',
            type: 'error',
          })
        })
      return
    }
    setFormData(prev => ({ ...prev, cnNumber: '' }))
  }, [formData.product])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'services' && value === 'On Time Service' && formData.product === 'General') {
      setShowOnTimeDeliveryModal(true)
    }
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      }
      // Reset services when product changes
      if (name === 'product') {
        updated.services = ''
      }
      // When selecting a Blue Box Xkg service, auto-set weight and volumetric weight to X (locked)
      if (name === 'services' && value) {
        if (value.match(/^Blue Box (\d+)kg$/)) {
          const kg = RegExp.$1
          updated.weight = kg
          updated.volumetricWeight = kg
        } else {
          // Switching to L-Flayer, Over Night, On Time Service, etc. — clear weight fields
          updated.weight = ''
          updated.volumetricWeight = ''
        }
      }
      return updated
    })
  }
  // Auto-open document modal when service requiring documents is selected
  useEffect(() => {
    const service = (formData.services || '').trim()
    const product = (formData.product || '').trim()

    // Handle Attestation services (shown under General) - show subservices modal
    if (service && ATTESTATION_SERVICE_VALUES.includes(service)) {
      setShowSubservicesModal(true)
      if (!subservicesData[service]) {
        api.getSubservices(service)
          .then((data) => {
            const subservices = Array.isArray(data) ? data : data?.data || []
            setSubservicesData((prev) => ({ ...prev, [service]: subservices }))
          })
          .catch((err) => console.error('Error fetching subservices:', err))
      }
      return
    }

    // Handle other document modals
    if (service === 'ATS - Doc MOFA Attestation' || service === 'ATR - Doc MOFA Home Delivery') {
      setShowMofaModal(true)
    } else if (service === 'APN - Apostille Normal' || service === 'APU - Apostille Urgent') {
      setShowApostilleModal(true)
    } else if (service === 'AE - UAE Embassy') {
      setShowUaeEmbassyModal(true)
    } else if (service === 'BV - Board Verification') {
      setShowBoardVerificationModal(true)
    } else if (service === 'HEC - HEC') {
      setShowHecModal(true)
    } else if (service === 'IBCC - IBCC') {
      setShowIbccModal(true)
    } else if (service === 'National Bureau') {
      setShowNationalBureauModal(true)
    }
  }, [formData.services, formData.product])

  // Dynamic Rate Calculation (Mirroring Admin Logic)
  const calculateRate = useMemo(() => {
    return () => {
      if (!reduxRules || reduxRules.length === 0) return 0

      const { originCity, destination, services, product, weight, volumetricWeight } = formData

      if (!services || !product || (!weight && !volumetricWeight)) {
        return 0
      }

      const isAttestationServiceSelected = ATTESTATION_SERVICE_VALUES.includes(services)
      // Origin and Destination are required for non-Attestation services
      if (!isAttestationServiceSelected && (!originCity || !destination)) {
        return 0
      }

      // 1. Calculate Applicable Weight (Max of physical and volumetric)
      const physicalWeight = parseFloat(weight) || 0
      const volWeight = parseFloat(volumetricWeight) || 0
      const applicableWeight = Math.max(physicalWeight, volWeight)

      // For "Blue Box Xkg" services, use service "Blue Box" and weight X for pricing
      const blueBoxKgMatch = services && String(services).match(/^Blue Box (\d+)kg$/)
      const effectiveService = blueBoxKgMatch ? 'Blue Box' : services
      const effectiveWeight = blueBoxKgMatch ? parseFloat(blueBoxKgMatch[1]) : applicableWeight

      // 2. Find matching rules
      let applicableRules = []

      if (ATTESTATION_SERVICE_VALUES.includes(services)) {
        applicableRules = reduxRules.filter(r =>
          r.service?.serviceName === services &&
          r.service?.serviceType === 'Attestation'
        )
      } else {
        applicableRules = reduxRules.filter(r =>
          r.originCityId === originCity &&
          r.destinationCityId === destination &&
          r.service?.serviceName === effectiveService
        )
      }

      if (applicableRules.length === 0) return 0

      // 3. Find exact weight tier match (use effectiveWeight for Blue Box Xkg)
      const weightForTier = effectiveService === 'Blue Box' && blueBoxKgMatch ? effectiveWeight : applicableWeight
      const matchingRule = applicableRules.find(r =>
        weightForTier >= parseFloat(r.weightFrom) &&
        weightForTier <= parseFloat(r.weightTo)
      )

      if (matchingRule) {
        return parseFloat(matchingRule.baseRate) || 0
      }

      // 4. Fallback: If weight exceeds all tiers, use the highest tier's rate
      const highestTierRule = applicableRules.reduce((highest, current) => {
        return parseFloat(current.weightTo) > parseFloat(highest.weightTo) ? current : highest
      }, applicableRules[0])

      return parseFloat(highestTierRule.baseRate) || 0
    }
  }, [reduxRules, formData.originCity, formData.destination, formData.services, formData.weight, formData.volumetricWeight, formData.product])

  // Update totalAmount whenever pricing factors change
  useEffect(() => {
    const baseRate = calculateRate()
    const pieces = parseInt(formData.pieces || '1')

    // Total for all pieces
    const rateTotal = baseRate * pieces

    // Add other charges
    const otherAmount = parseFloat(formData.otherAmount) || 0

    // Add document prices
    const getSelectedDocuments = () => {
      const docs = [
        ...selectedDocuments.map(id => mofaDocuments.find(d => d.id === id)),
        ...selectedApostilleDocuments.map(id => apostilleDocuments.find(d => d.id === id)),
        ...selectedUaeEmbassyDocuments.map(id => uaeEmbassyDocuments.find(d => d.id === id)),
        ...selectedBoardVerificationDocuments.map(id => boardVerificationDocuments.find(d => d.id === id)),
        ...selectedHecDocuments.map(id => hecDocuments.find(d => d.id === id)),
        ...selectedIbccDocuments.map(id => ibccDocuments.find(d => d.id === id)),
        ...selectedNationalBureauDocuments.map(id => nationalBureauDocuments.find(d => d.id === id))
      ].filter(Boolean)
      return docs
    }

    const docs = getSelectedDocuments()
    const docsTotal = docs.reduce((sum, doc) => sum + (doc.price || 0), 0)

    // Calculate subservices total for Attestation services (by service name; product can be General)
    let subservicesTotal = 0
    if (ATTESTATION_SERVICE_VALUES.includes(formData.services) && selectedSubservices.length > 0 && formData.services) {
      const currentSubservices = subservicesData[formData.services] || []
      subservicesTotal = selectedSubservices.reduce((total, id) => {
        const subservice = currentSubservices.find((s) => s.id === id)
        return total + (subservice ? subservice.price : 0)
      }, 0)
    }

    const physicalWeight = parseFloat(formData.weight) || 0
    const volWeight = parseFloat(formData.volumetricWeight) || 0
    const chargeableWeight = Math.max(physicalWeight, volWeight)

    // Force numeric safety
    const rate = Number(baseRate) || 0
    const pcs = Number(pieces) || 1
    const docTotal = Number(docsTotal) || 0
    const other = Number(otherAmount) || 0
    const subservices = Number(subservicesTotal) || 0

    // Only calculate total if we have ALL required fields and a valid rate
    const hasRequiredFields = formData.product && formData.originCity && formData.destination && formData.services && formData.weight

    let finalRate = 0
    let totalAmount = 0

    if (hasRequiredFields && rate > 0) {
      finalRate = rate
      totalAmount = (rate * pcs) + docTotal + other + subservices
    } else if (ATTESTATION_SERVICE_VALUES.includes(formData.services) && (subservices > 0 || docTotal > 0 || other > 0 || formData.services)) {
      totalAmount = docTotal + other + subservices
    }

    setFormData(prev => ({
      ...prev,
      rate: finalRate.toString(),
      totalAmount: totalAmount,
      chargeableWeight: chargeableWeight
    }))
  }, [
    calculateRate,
    formData.pieces,
    formData.otherAmount,
    formData.product,
    formData.services,
    selectedDocuments,
    selectedApostilleDocuments,
    selectedUaeEmbassyDocuments,
    selectedBoardVerificationDocuments,
    selectedHecDocuments,
    selectedIbccDocuments,
    selectedNationalBureauDocuments,
    selectedSubservices,
    subservicesData,
    formData.weight,
    formData.volumetricWeight
  ])

  const handleOpenDocumentModal = (modalType) => {
    switch (modalType) {
      case 'mofa':
        setShowMofaModal(true)
        break
      case 'apostille':
        setShowApostilleModal(true)
        break
      case 'uaeEmbassy':
        setShowUaeEmbassyModal(true)
        break
      case 'boardVerification':
        setShowBoardVerificationModal(true)
        break
      case 'hec':
        setShowHecModal(true)
        break
      case 'ibcc':
        setShowIbccModal(true)
        break
      case 'nationalBureau':
        setShowNationalBureauModal(true)
        break
      default:
        break
    }
  }

  const mofaDocuments = [
    { id: 1, name: 'Nikah Nama', price: 5000 },
    { id: 2, name: 'Marriage Registration Certificate', price: 5000 },
    { id: 3, name: 'B-Form', price: 5000 },
    { id: 4, name: 'Birth Registration Certificate', price: 5000 },
    { id: 5, name: 'Family Registration Certificate', price: 5000 },
    { id: 6, name: 'Death Certificate', price: 5000 },
    { id: 7, name: 'Divorce Certificate', price: 5000 },
    { id: 8, name: 'SSC Certificate', price: 5000 },
    { id: 9, name: 'HSSC Certificate', price: 5000 },
    { id: 10, name: "Bachelor's Degree", price: 5000 },
    { id: 11, name: "Bachelor's Transcript", price: 5000 },
    { id: 12, name: "Master's Degree", price: 5000 },
    { id: 13, name: "Master's Transcript", price: 5000 },
    { id: 14, name: 'M.Phil Degree', price: 5000 },
    { id: 15, name: 'M.Phil Transcript', price: 5000 },
    { id: 16, name: 'PhD Degree', price: 5000 },
    { id: 17, name: 'PhD Transcript', price: 5000 },
    { id: 18, name: 'Passport Copy', price: 5000 },
    { id: 19, name: 'Medical Certificate', price: 5000 },
    { id: 20, name: 'Police Record Certificate', price: 5000 },
    { id: 21, name: 'Commercial Documents', price: 25000 },
    { id: 22, name: 'Other Documents', price: 5000 },
    { id: 23, name: 'School Leaving Certificate', price: 5000 },
    { id: 24, name: 'School Result Cards', price: 5000 },
    { id: 25, name: 'Stamp Paper', price: 45000 },
    { id: 26, name: 'Licence NOC', price: 5000 },
    { id: 27, name: 'Bank Statement', price: 7500 },
    { id: 28, name: 'Account Maintenance Letter', price: 7500 },
  ]

  const apostilleDocuments = [
    { id: 1, name: 'Nikah Nama', price: 6000 },
    { id: 2, name: 'Marriage Registration Certificate', price: 6000 },
    { id: 3, name: 'B-Form', price: 6000 },
    { id: 4, name: 'Birth Registration Certificate', price: 6000 },
    { id: 5, name: 'Family Registration Certificate', price: 6000 },
    { id: 6, name: 'Death Certificate', price: 6000 },
    { id: 7, name: 'Divorce Certificate', price: 6000 },
    { id: 8, name: 'SSC Certificate', price: 6000 },
    { id: 9, name: 'HSSC Certificate', price: 6000 },
    { id: 10, name: "Bachelor's Degree", price: 6000 },
    { id: 11, name: "Bachelor's Transcript", price: 6000 },
    { id: 12, name: "Master's Degree", price: 6000 },
    { id: 13, name: "Master's Transcript", price: 6000 },
    { id: 14, name: 'M.Phil Degree', price: 6000 },
    { id: 15, name: 'M.Phil Transcript', price: 6000 },
    { id: 16, name: 'PhD Degree', price: 6000 },
    { id: 17, name: 'PhD Transcript', price: 6000 },
    { id: 18, name: 'Passport Copy', price: 6000 },
    { id: 19, name: 'Medical Certificate', price: 6000 },
    { id: 20, name: 'Police Record Certificate', price: 6000 },
    { id: 21, name: 'Commercial Documents', price: 6000 },
    { id: 22, name: 'Other Documents', price: 6000 },
  ]

  const uaeEmbassyDocuments = [
    { id: 1, name: 'Nikah Nama', price: 24500 },
    { id: 2, name: 'Marriage Registration Certificate', price: 24500 },
    { id: 3, name: 'B-Form', price: 24500 },
    { id: 4, name: 'Birth Registration Certificate', price: 24500 },
    { id: 5, name: 'Family Registration Certificate', price: 24500 },
    { id: 6, name: 'SSC Certificate', price: 24500 },
    { id: 7, name: 'HSSC Certificate', price: 24500 },
    { id: 8, name: "Bachelor's Degree", price: 24500 },
    { id: 9, name: "Bachelor's Transcript", price: 24500 },
    { id: 10, name: "Master's Degree", price: 24500 },
    { id: 11, name: "Master's Transcript", price: 24500 },
    { id: 12, name: 'M.Phil Degree', price: 24500 },
    { id: 13, name: 'M.Phil Transcript', price: 24500 },
    { id: 14, name: 'PhD Degree', price: 24500 },
    { id: 15, name: 'PhD Transcript', price: 24500 },
    { id: 16, name: 'Police Record Certificate', price: 24500 },
    { id: 17, name: 'Other Documents', price: 24500 },
  ]

  const boardVerificationDocuments = [
    { id: 1, name: 'SSC Degree', price: 6000 },
    { id: 2, name: 'HSSC Degree', price: 6000 },
    { id: 3, name: 'SSC Marksheet', price: 6000 },
    { id: 4, name: 'HSSC Marksheet', price: 6000 },
  ]

  const hecDocuments = [
    { id: 1, name: "Bachelor's Degree Original", price: 3000 },
    { id: 2, name: "Bachelor's Transcript Original", price: 3000 },
    { id: 3, name: "Master's Degree Original", price: 3000 },
    { id: 4, name: "Master's Transcript Original", price: 3000 },
    { id: 5, name: 'M.Phil Degree Original', price: 3000 },
    { id: 6, name: 'M.Phil Transcript Original', price: 3000 },
    { id: 7, name: 'PhD Degree Original', price: 3000 },
    { id: 8, name: 'PhD Transcript Original', price: 3000 },
    { id: 9, name: "Bachelor's Degree Copy", price: 3000 },
    { id: 10, name: "Bachelor's Transcript Copy", price: 3000 },
    { id: 11, name: "Master's Degree Copy", price: 3000 },
    { id: 12, name: "Master's Transcript Copy", price: 3000 },
    { id: 13, name: 'M.Phil Degree Copy', price: 3000 },
    { id: 14, name: 'M.Phil Transcript Copy', price: 3000 },
    { id: 15, name: 'PhD Degree Copy', price: 3000 },
    { id: 16, name: 'PhD Transcript Copy', price: 3000 },
  ]

  const ibccDocuments = [
    { id: 1, name: 'SSC Degree', price: 7000 },
    { id: 2, name: 'HSSC Degree', price: 7000 },
    { id: 3, name: 'SSC Marksheet', price: 7000 },
    { id: 4, name: 'HSSC Marksheet', price: 7000 },
  ]

  const nationalBureauDocuments = [
    { id: 1, name: 'Police Record Certificate', price: 27000 },
  ]

  const handleDocumentToggle = (documentId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleApostilleDocumentToggle = (documentId) => {
    setSelectedApostilleDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleUaeEmbassyDocumentToggle = (documentId) => {
    setSelectedUaeEmbassyDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleBoardVerificationDocumentToggle = (documentId) => {
    setSelectedBoardVerificationDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleHecDocumentToggle = (documentId) => {
    setSelectedHecDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleIbccDocumentToggle = (documentId) => {
    setSelectedIbccDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleNationalBureauDocumentToggle = (documentId) => {
    setSelectedNationalBureauDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected documents:', selectedDocuments)
    setShowMofaModal(false)
  }

  const handleApostilleConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected apostille documents:', selectedApostilleDocuments)
    setShowApostilleModal(false)
  }

  const handleUaeEmbassyConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected UAE Embassy documents:', selectedUaeEmbassyDocuments)
    setShowUaeEmbassyModal(false)
  }

  const handleBoardVerificationConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected Board Verification documents:', selectedBoardVerificationDocuments)
    setShowBoardVerificationModal(false)
  }

  const handleHecConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected HEC documents:', selectedHecDocuments)
    setShowHecModal(false)
  }

  const handleIbccConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected IBCC documents:', selectedIbccDocuments)
    setShowIbccModal(false)
  }

  const handleNationalBureauConfirmSelection = () => {
    // Store selected documents (can be added to formData if needed)
    console.log('Selected National Bureau documents:', selectedNationalBureauDocuments)
    setShowNationalBureauModal(false)
  }

  const handleCloseModal = () => {
    setShowMofaModal(false)
    // Optionally reset selected documents when closing
    // setSelectedDocuments([])
  }

  const handleCloseApostilleModal = () => {
    setShowApostilleModal(false)
    // Optionally reset selected documents when closing
    // setSelectedApostilleDocuments([])
  }

  const handleCloseUaeEmbassyModal = () => {
    setShowUaeEmbassyModal(false)
    // Optionally reset selected documents when closing
    // setSelectedUaeEmbassyDocuments([])
  }

  const handleCloseBoardVerificationModal = () => {
    setShowBoardVerificationModal(false)
    // Optionally reset selected documents when closing
    // setSelectedBoardVerificationDocuments([])
  }

  const handleCloseHecModal = () => {
    setShowHecModal(false)
    // Optionally reset selected documents when closing
    // setSelectedHecDocuments([])
  }

  const handleCloseIbccModal = () => {
    setShowIbccModal(false)
    // Optionally reset selected documents when closing
    // setSelectedIbccDocuments([])
  }

  const handleCloseNationalBureauModal = () => {
    setShowNationalBureauModal(false)
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setDocumentFiles(Array.from(e.target.files))
    }
  }

  // Get selected documents with their details
  const getSelectedDocuments = () => {
    const service = formData.services || ''
    let documents = []
    let documentServiceType = ''

    if (service === 'ATS - Doc MOFA Attestation' || service === 'ATR - Doc MOFA Home Delivery' || service === 'INTL - DOCUMENTS') {
      documentServiceType = 'MOFA'
      documents = selectedDocuments.map(id => {
        const doc = mofaDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    } else if (service === 'APN - Apostille Normal' || service === 'APU - Apostille Urgent') {
      documentServiceType = 'Apostille'
      documents = selectedApostilleDocuments.map(id => {
        const doc = apostilleDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    } else if (service === 'AE - UAE Embassy') {
      documentServiceType = 'UAE Embassy'
      documents = selectedUaeEmbassyDocuments.map(id => {
        const doc = uaeEmbassyDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    } else if (service === 'BV - Board Verification') {
      documentServiceType = 'Board Verification'
      documents = selectedBoardVerificationDocuments.map(id => {
        const doc = boardVerificationDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    } else if (service === 'HEC - HEC') {
      documentServiceType = 'HEC'
      documents = selectedHecDocuments.map(id => {
        const doc = hecDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    } else if (service === 'IBCC - IBCC') {
      documentServiceType = 'IBCC'
      documents = selectedIbccDocuments.map(id => {
        const doc = ibccDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    } else if (service === 'National Bureau') {
      documentServiceType = 'National Bureau'
      documents = selectedNationalBureauDocuments.map(id => {
        const doc = nationalBureauDocuments.find(d => d.id === id)
        return doc ? { name: doc.name, price: doc.price } : null
      }).filter(Boolean)
    }

    return { documents, documentServiceType }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.product || !formData.destination || !formData.services || !formData.payMode ||
      !formData.weight || !formData.packetContent || !formData.mobileNumber || !formData.fullName ||
      !formData.address || !formData.consigneeMobileNumber || !formData.consigneeFullName ||
      !formData.consigneeAddress) {
      setToast({
        isVisible: true,
        message: 'Please fill all required fields',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { documents, documentServiceType } = getSelectedDocuments()

      // For "Blue Box Xkg" services, send service "Blue Box" so backend resolves correctly; weight is already set
      const effectiveServiceId = formData.services && formData.services.match(/^Blue Box (\d+)kg$/) ? 'Blue Box' : formData.services

      const effectiveProductId = ATTESTATION_SERVICE_VALUES.includes(formData.services) ? 'Attestation' : formData.product
      const bookingData = {
        productId: effectiveProductId,
        serviceId: effectiveServiceId,
        destinationCityId: formData.destination,
        originCityId: formData.originCity,
        cnNumber: formData.cnNumber || undefined,
        pieces: parseInt(formData.pieces || '1'),
        handlingInstructions: formData.handlingInstructions || undefined,
        packetContent: formData.packetContent,
        payMode: formData.payMode === 'Cash' ? 'CASH' : 'ONLINE', // Map to PaymentMode enum
        preferredDeliveryDate: formData.preferredDeliveryDate || undefined,
        preferredDeliveryTime: formData.preferredDeliveryTime || undefined,
        weight: parseFloat(formData.weight || '0'),
        volumetricWeight: parseFloat(formData.volumetricWeight || '0') || undefined,

        // Shipper Info
        mobileNumber: formData.mobileNumber,
        fullName: formData.fullName,
        companyName: formData.companyName || undefined,
        address: formData.address,
        address2: formData.address2 || undefined,
        landlineNumber: formData.landlineNumber || undefined,
        emailAddress: formData.emailAddress || undefined,
        cnicNumber: formData.cnicNumber || undefined,

        // Consignee Info
        consigneeMobileNumber: formData.consigneeMobileNumber,
        consigneeFullName: formData.consigneeFullName,
        consigneeCompanyName: formData.consigneeCompanyName || undefined,
        consigneeAddress: formData.consigneeAddress,
        consigneeAddress2: formData.consigneeAddress2 || undefined,
        consigneeLandlineNumber: formData.consigneeLandlineNumber || undefined,
        consigneeEmailAddress: formData.consigneeEmailAddress || undefined,
        consigneeZipCode: formData.consigneeZipCode || undefined,

        // Pricing
        rate: formData.rate || 0,
        otherAmount: parseFloat(formData.otherAmount) || 0,
        totalAmount: formData.totalAmount || 0,
        chargeableWeight: formData.chargeableWeight || 0,

        // Documents
        documents: documents.length > 0 ? documents : undefined,
        documentServiceType: documentServiceType || undefined,
      }

      const result = await api.createConsignment(bookingData, documentFiles)
      const booking = result?.data || result
      const cnNumber = booking?.cnNumber || 'N/A'

      setToast({
        isVisible: true,
        message: `Booking created successfully! CN Number: ${cnNumber}`,
        type: 'success'
      })

      // CN print on save – necessary for customer to get their copy
      try {
        const citiesMap = (cities || []).reduce((acc, c) => { acc[c.id] = c.cityName || c.name; return acc }, {})
        const printData = {
          ...booking,
          fullName: booking?.fullName ?? formData.fullName,
          mobileNumber: booking?.mobileNumber ?? formData.mobileNumber,
          address: booking?.address ?? formData.address,
          consigneeFullName: booking?.consigneeName ?? formData.consigneeFullName,
          consigneeMobileNumber: booking?.consigneePhone ?? formData.consigneeMobileNumber,
          consigneeAddress: booking?.consigneeAddress ?? formData.consigneeAddress,
          originCity: booking?.originCity ?? (formData.originCity ? { cityName: citiesMap[formData.originCity] || formData.originCity } : null),
          destinationCity: booking?.destinationCity ?? (formData.destination ? { cityName: citiesMap[formData.destination] || formData.destination } : null),
          product: booking?.product ?? (formData.product ? { productName: formData.product } : null),
          service: booking?.service ?? (formData.services ? { serviceName: formData.services } : null),
        }
        let config = {}
        try {
          const res = await api.getConfiguration()
          config = res?.data?.config ?? res?.config ?? (res?.stationCode ? res : null) ?? {}
        } catch (_) {}
        const isCod = formData.product === 'COD' || booking?.productId === 'COD' || (booking?.product?.productName || '').toUpperCase() === 'COD'
        if (isCod) {
          printCodSlip(printData, { config })
        } else {
          printBookingSlip(printData, { config })
        }
      } catch (printErr) {
        console.warn('CN print failed:', printErr)
      }

      // Reset form
      setFormData({
        product: '',
        destination: '',
        cnNumber: '',
        pieces: '1',
        handlingInstructions: '',
        packetContent: '',
        services: '',
        payMode: '',
        volumetricWeight: '0',
        weight: '',
        mobileNumber: '',
        fullName: '',
        companyName: '',
        address: '',
        address2: '',
        landlineNumber: '',
        emailAddress: '',
        cnicNumber: '',
        consigneeMobileNumber: '',
        consigneeFullName: '',
        consigneeCompanyName: '',
        consigneeAddress: '',
        consigneeAddress2: '',
        consigneeLandlineNumber: '',
        consigneeEmailAddress: '',
        consigneeZipCode: '',
        otherAmount: '',
        totalAmount: 0,
        originCity: '',
        preferredDeliveryDate: '',
        preferredDeliveryTime: '',
      })
      setSelectedDocuments([])
      setDocumentFiles([])

    } catch (error) {
      console.error('Error creating booking:', error)
      setToast({
        isVisible: true,
        message: error.message || 'Failed to send booking request.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Booking (Consignment)</h1>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>

      {pricingLoading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-gray-600 font-medium">Fetching available cities and services...</p>
          </div>
        </div>
      )}

      {/* Shipment Details Section */}
      <UserShipmentDetails
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        selectedDocuments={selectedDocuments}
        selectedApostilleDocuments={selectedApostilleDocuments}
        selectedUaeEmbassyDocuments={selectedUaeEmbassyDocuments}
        selectedBoardVerificationDocuments={selectedBoardVerificationDocuments}
        selectedHecDocuments={selectedHecDocuments}
        selectedIbccDocuments={selectedIbccDocuments}
        selectedNationalBureauDocuments={selectedNationalBureauDocuments}
        onOpenDocumentModal={handleOpenDocumentModal}
        cities={cities}
        services={reduxServices}
        selectedSubservices={selectedSubservices}
        onOpenSubservicesModal={() => setShowSubservicesModal(true)}
        subservicesData={subservicesData}
        onOpenOnTimeDeliveryModal={() => setShowOnTimeDeliveryModal(true)}
      />

      {/* Shipper Section */}
      <UserShipper formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />

      {/* Consignee Section */}
      <UserConsignee formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />

      {/* Other Amount and Actions Section */}
      <UserOtherAmountSection
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={5000}
      />

      {/* Dynamic Subservices Modal for Attestation Services */}
      <SubservicesModal
        isOpen={showSubservicesModal}
        onClose={() => setShowSubservicesModal(false)}
        serviceName={formData.services}
        selectedSubservices={selectedSubservices}
        onSubservicesChange={(subservices) => {
          setSelectedSubservices(subservices)
        }}
        onSubservicesDataLoaded={(serviceName, subservices) => {
          setSubservicesData((prev) => ({
            ...prev,
            [serviceName]: subservices,
          }))
        }}
      />

      {/* On Time Service – delivery date & time */}
      <OnTimeDeliveryModal
        isOpen={showOnTimeDeliveryModal}
        onClose={() => setShowOnTimeDeliveryModal(false)}
        initialDate={formData.preferredDeliveryDate}
        initialTime={formData.preferredDeliveryTime}
        onConfirm={(date, time) => {
          setFormData(prev => ({
            ...prev,
            preferredDeliveryDate: date,
            preferredDeliveryTime: time,
          }))
        }}
      />

      {/* MOFA Document Selection Modal */}
      {showMofaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select Documents for MOFA Attestation Documents</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {mofaDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`doc-${doc.id}`}
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedDocuments.map((docId) => {
                        const doc = mofaDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedDocuments.reduce((total, docId) => {
                            const doc = mofaDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apostille Document Selection Modal */}
      {showApostilleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select Documents for Apostille Documents</h3>
              <button
                onClick={handleCloseApostilleModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {apostilleDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`apostille-doc-${doc.id}`}
                        checked={selectedApostilleDocuments.includes(doc.id)}
                        onChange={() => handleApostilleDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`apostille-doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedApostilleDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedApostilleDocuments.map((docId) => {
                        const doc = apostilleDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleApostilleDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedApostilleDocuments.reduce((total, docId) => {
                            const doc = apostilleDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseApostilleModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApostilleConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UAE Embassy Document Selection Modal */}
      {showUaeEmbassyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select Documents for UAE Embassy Documents</h3>
              <button
                onClick={handleCloseUaeEmbassyModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {uaeEmbassyDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`uae-doc-${doc.id}`}
                        checked={selectedUaeEmbassyDocuments.includes(doc.id)}
                        onChange={() => handleUaeEmbassyDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`uae-doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedUaeEmbassyDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedUaeEmbassyDocuments.map((docId) => {
                        const doc = uaeEmbassyDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleUaeEmbassyDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedUaeEmbassyDocuments.reduce((total, docId) => {
                            const doc = uaeEmbassyDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseUaeEmbassyModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUaeEmbassyConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Verification Document Selection Modal */}
      {showBoardVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select Documents for Board Verification Documents</h3>
              <button
                onClick={handleCloseBoardVerificationModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {boardVerificationDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`bv-doc-${doc.id}`}
                        checked={selectedBoardVerificationDocuments.includes(doc.id)}
                        onChange={() => handleBoardVerificationDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`bv-doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedBoardVerificationDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedBoardVerificationDocuments.map((docId) => {
                        const doc = boardVerificationDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleBoardVerificationDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedBoardVerificationDocuments.reduce((total, docId) => {
                            const doc = boardVerificationDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseBoardVerificationModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBoardVerificationConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEC Document Selection Modal */}
      {showHecModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select Documents for HEC Documents</h3>
              <button
                onClick={handleCloseHecModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {hecDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`hec-doc-${doc.id}`}
                        checked={selectedHecDocuments.includes(doc.id)}
                        onChange={() => handleHecDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`hec-doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedHecDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedHecDocuments.map((docId) => {
                        const doc = hecDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleHecDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedHecDocuments.reduce((total, docId) => {
                            const doc = hecDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseHecModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleHecConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IBCC Document Selection Modal */}
      {showIbccModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select Documents for IBCC Documents</h3>
              <button
                onClick={handleCloseIbccModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {ibccDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`ibcc-doc-${doc.id}`}
                        checked={selectedIbccDocuments.includes(doc.id)}
                        onChange={() => handleIbccDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`ibcc-doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedIbccDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedIbccDocuments.map((docId) => {
                        const doc = ibccDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleIbccDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedIbccDocuments.reduce((total, docId) => {
                            const doc = ibccDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseIbccModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleIbccConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* National Bureau Document Selection Modal */}
      {showNationalBureauModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Select document</h3>
              <button
                onClick={handleCloseNationalBureauModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Available Documents Section */}
              <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Available Documents</h4>
                <div className="space-y-3">
                  {nationalBureauDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        id={`nb-doc-${doc.id}`}
                        checked={selectedNationalBureauDocuments.includes(doc.id)}
                        onChange={() => handleNationalBureauDocumentToggle(doc.id)}
                        className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                      <label htmlFor={`nb-doc-${doc.id}`} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Documents Section */}
              <div className="w-1/2 p-6 overflow-y-auto flex flex-col">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Selected Documents</h4>
                {selectedNationalBureauDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-400">No documents selected</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 flex-1 mb-4">
                      {selectedNationalBureauDocuments.map((docId) => {
                        const doc = nationalBureauDocuments.find(d => d.id === docId)
                        return doc ? (
                          <div key={docId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-600">PKR {doc.price.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleNationalBureauDocumentToggle(docId)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                    {/* Total Amount Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-sky-600">
                          PKR {selectedNationalBureauDocuments.reduce((total, docId) => {
                            const doc = nationalBureauDocuments.find(d => d.id === docId)
                            return total + (doc ? doc.price : 0)
                          }, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleCloseNationalBureauModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleNationalBureauConfirmSelection}
                className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

