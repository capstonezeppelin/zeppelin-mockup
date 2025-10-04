import { useEffect, useMemo, useRef, useState } from 'react'

// Mock sensor IDs (all 8 senders)
const STATIC_IDS = ['sender1', 'sender2', 'sender3', 'sender4', 'sender5', 'sender6', 'sender7', 'sender8']
const MOBILE_ID = 'mobile1'

// Static sensor coordinates (exact coordinates from user)
const STATIC_COORDS = {
  sender1: { lat: -7.764729, lon: 110.376655 },
  sender2: { lat: -7.767512, lon: 110.378690 },
  sender3: { lat: -7.768433, lon: 110.382745 },
  sender4: { lat: -7.765948, lon: 110.373671 },
  sender5: { lat: -7.771038, lon: 110.378416 },
  sender6: { lat: -7.771900, lon: 110.381235 },
  sender7: { lat: -7.771218, lon: 110.374818 },
  sender8: { lat: -7.775635, lon: 110.376152 }
}

// Bounding polygon defined by corner sensors (sender1, sender3, sender4, sender8)
const BOUNDS = [
  [STATIC_COORDS.sender1.lat, STATIC_COORDS.sender1.lon],
  [STATIC_COORDS.sender3.lat, STATIC_COORDS.sender3.lon],
  [STATIC_COORDS.sender8.lat, STATIC_COORDS.sender8.lon],
  [STATIC_COORDS.sender4.lat, STATIC_COORDS.sender4.lon]
]

const clamp = (val, min, max) => Math.min(max, Math.max(min, val))

export const useMockSensorData = () => {
  const [sensorData, setSensorData] = useState({})
  const [sensorCount, setSensorCount] = useState({ online: 0, total: 0 })
  const seedRef = useRef(Math.random() * 1000)
  const mobileRef = useRef({
    lat: (STATIC_COORDS.sender1.lat + STATIC_COORDS.sender8.lat) / 2,
    lon: (STATIC_COORDS.sender1.lon + STATIC_COORDS.sender8.lon) / 2,
    heading: Math.random() * Math.PI * 2
  })

  // Generate realistic ppm around urban background (5-35 ppm) with occasional spikes
  const generatePPM = (base, t, jitter) => {
    const diurnal = 5 * Math.sin(t / 60000) // slow drift
    const noise = (Math.random() - 0.5) * jitter
    const spike = Math.random() < 0.03 ? 30 * Math.random() : 0
    return clamp(base + diurnal + noise + spike, 1, 150)
  }

  // Keep mobile within polygon bounding box by reflecting heading on boundary
  const stepMobile = () => {
    const speedMetersPerStep = 8 // ~4 m/s at 2s interval
    const metersPerDegLat = 111320
    const metersPerDegLon = 111320 * Math.cos((mobileRef.current.lat * Math.PI) / 180)
    const dLat = (Math.sin(mobileRef.current.heading) * speedMetersPerStep) / metersPerDegLat
    const dLon = (Math.cos(mobileRef.current.heading) * speedMetersPerStep) / metersPerDegLon
    let nextLat = mobileRef.current.lat + dLat
    let nextLon = mobileRef.current.lon + dLon

    const minLat = Math.min(...BOUNDS.map(b => b[0]))
    const maxLat = Math.max(...BOUNDS.map(b => b[0]))
    const minLon = Math.min(...BOUNDS.map(b => b[1]))
    const maxLon = Math.max(...BOUNDS.map(b => b[1]))

    let heading = mobileRef.current.heading
    if (nextLat < minLat || nextLat > maxLat) {
      heading = -heading // reflect vertically
      nextLat = clamp(nextLat, minLat, maxLat)
    }
    if (nextLon < minLon || nextLon > maxLon) {
      heading = Math.PI - heading // reflect horizontally
      nextLon = clamp(nextLon, minLon, maxLon)
    }
    // random wander
    heading += (Math.random() - 0.5) * 0.2
    mobileRef.current = { lat: nextLat, lon: nextLon, heading }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const t = now + seedRef.current * 1000

      // Update mobile position first
      stepMobile()

      const newData = {}
      STATIC_IDS.forEach((id, idx) => {
        const base = 12 + (idx % 8) * 2
        newData[id] = {
          ppm: generatePPM(base, t + idx * 1234, 6),
          lastUpdate: new Date(),
          isOnline: true
        }
      })

      newData[MOBILE_ID] = {
        ppm: generatePPM(15, t + 8888, 10),
        lat: mobileRef.current.lat,
        lon: mobileRef.current.lon,
        lastUpdate: new Date(),
        isOnline: true
      }

      setSensorData(newData)
      setSensorCount({ online: Object.keys(newData).length, total: Object.keys(newData).length })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const defaultSensorLocations = useMemo(() => ({
    sender1: STATIC_COORDS.sender1,
    sender2: STATIC_COORDS.sender2,
    sender3: STATIC_COORDS.sender3,
    sender4: STATIC_COORDS.sender4,
    sender5: STATIC_COORDS.sender5,
    sender6: STATIC_COORDS.sender6,
    sender7: STATIC_COORDS.sender7,
    sender8: STATIC_COORDS.sender8
  }), [])

  return { sensorData, sensorCount, defaultSensorLocations, bounds: BOUNDS }
}


