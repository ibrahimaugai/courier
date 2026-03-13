import { useEffect, useState, useRef } from 'react'
import { api } from './api'

let cachedValues = null
let fetchPromise = null

function normalizeAttestationResponse(data) {
  if (!data) return []

  const items = Array.isArray(data) ? data : data?.data || []

  return items
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        if (typeof item.display === 'string') return item.display
        if (typeof item.serviceName === 'string') return item.serviceName
        if (typeof item.name === 'string') return item.name
        if (typeof item.title === 'string') return item.title
      }
      return null
    })
    .filter(Boolean)
}

export function useAttestationServices() {
  const [services, setServices] = useState(() => cachedValues ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    if (cachedValues) {
      // Already loaded
      return () => {
        isMountedRef.current = false
      }
    }

    setIsLoading(true)

    if (!fetchPromise) {
      fetchPromise = api
        .getAttestationCategories()
        .then((data) => {
          const normalized = normalizeAttestationResponse(data)
          if (normalized.length > 0) {
            cachedValues = normalized
            return normalized
          }
          return []
        })
        .catch(() => {
          return []
        })
    }

    fetchPromise.finally(() => {
      if (!isMountedRef.current) return
      setIsLoading(false)
    })

    fetchPromise.then((vals) => {
      if (!isMountedRef.current) return
      setServices(vals)
    })

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return { services, isLoading }
}
