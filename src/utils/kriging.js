export class SimpleKriging {
  constructor() {
    this.nugget = 0.1
    this.sill = 1.0
    this.range = 1000
    this.model = 'exponential'
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  variogram(distance) {
    if (distance === 0) return 0
    return this.nugget + this.sill * (1 - Math.exp(-3 * distance / this.range))
  }

  createCovarianceMatrix(knownPoints) {
    const n = knownPoints.length
    const C = []
    for (let i = 0; i < n + 1; i++) {
      C[i] = []
      for (let j = 0; j < n + 1; j++) {
        if (i === n || j === n) {
          C[i][j] = i === n && j === n ? 0 : 1
        } else {
          const distance = this.calculateDistance(
            knownPoints[i].lat, knownPoints[i].lon,
            knownPoints[j].lat, knownPoints[j].lon
          )
          C[i][j] = this.sill - this.variogram(distance)
        }
      }
    }
    return C
  }

  solveLinearSystem(A, b) {
    const n = A.length
    const x = new Array(n).fill(0)
    const augmented = A.map((row, i) => [...row, b[i]])
    for (let i = 0; i < n; i++) {
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      ;[augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i]
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j]
        }
      }
    }
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n]
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j]
      }
      x[i] /= augmented[i][i]
    }
    return x
  }

  interpolate(targetLat, targetLon, knownPoints) {
    if (knownPoints.length === 0) return null
    if (knownPoints.length === 1) return knownPoints[0].value
    try {
      const C = this.createCovarianceMatrix(knownPoints)
      const d = []
      for (let i = 0; i < knownPoints.length; i++) {
        const distance = this.calculateDistance(targetLat, targetLon, knownPoints[i].lat, knownPoints[i].lon)
        d.push(this.sill - this.variogram(distance))
      }
      d.push(1)
      const weights = this.solveLinearSystem(C, d)
      let interpolatedValue = 0
      for (let i = 0; i < knownPoints.length; i++) {
        interpolatedValue += weights[i] * knownPoints[i].value
      }
      return Math.max(0, interpolatedValue)
    } catch {
      return null
    }
  }

  autoAdjustParameters(knownPoints) {
    if (knownPoints.length < 2) return
    const distances = []
    for (let i = 0; i < knownPoints.length; i++) {
      for (let j = i + 1; j < knownPoints.length; j++) {
        distances.push(this.calculateDistance(knownPoints[i].lat, knownPoints[i].lon, knownPoints[j].lat, knownPoints[j].lon))
      }
    }
    if (distances.length > 0) {
      const meanDistance = distances.reduce((a, b) => a + b) / distances.length
      this.range = meanDistance * 0.7
    }
    const values = knownPoints.map(p => p.value)
    const mean = values.reduce((a, b) => a + b) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    this.sill = Math.max(0.1, variance)
  }
}


