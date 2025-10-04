import React from 'react'

const Sidebar = ({ sensorData, clickedPoint, clickedValue }) => {
  const getCOColorClass = (coLevel) => {
    if (coLevel <= 9) return 'safe'
    if (coLevel <= 35) return 'moderate'
    if (coLevel <= 100) return 'unhealthy'
    return 'dangerous'
  }

  const stationarySensors = Object.entries(sensorData || {})
    .filter(([id, data]) => !data.lat && !data.lon)
    .map(([id]) => ({ id, name: id }))

  const mobileSensors = Object.entries(sensorData || {})
    .filter(([id, data]) => data.lat && data.lon)

  return (
    <div className="sidebar">
      <div className="sensor-panel">
        <h2>📍 Stationary Sensors</h2>
        <div className="sensor-list">
          {stationarySensors.map(sensor => {
            const data = sensorData[sensor.id]
            const co = data?.ppm || 0
            return (
              <div key={sensor.id} className={`sensor-item ${getCOColorClass(co)}`}>
                <span className="sensor-name">{sensor.name}</span>
                <span className="sensor-value">{co.toFixed(1)} ppm</span>
                <div className="sensor-timestamp">{data?.lastUpdate?.toLocaleTimeString?.() || ''}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="sensor-panel">
        <h2>🚗 Moving Sensor</h2>
        <div className="sensor-list">
          {mobileSensors.map(([id, data]) => (
            <div key={id} className={`sensor-item ${getCOColorClass(data.ppm || 0)}`}>
              <span className="sensor-name">{id}</span>
              <span className="sensor-value">{(data.ppm || 0).toFixed(1)} ppm</span>
              <div className="sensor-location">GPS: {data.lat.toFixed(4)}, {data.lon.toFixed(4)}</div>
              <div className="sensor-timestamp">{data?.lastUpdate?.toLocaleTimeString?.() || ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sensor-panel">
        <h2>🧮 Interpolated Point</h2>
        <div className="sensor-list">
          {clickedPoint && clickedValue !== null ? (
            <div className={`sensor-item ${getCOColorClass(clickedValue)}`}>
              <span className="sensor-name">Clicked Point</span>
              <span className="sensor-value">{clickedValue.toFixed(1)} ppm</span>
              <div className="sensor-location">GPS: {clickedPoint.lat.toFixed(5)}, {clickedPoint.lon.toFixed(5)}</div>
              <div className="sensor-timestamp">Interpolated</div>
            </div>
          ) : (
            <div className="sensor-item">
              <span className="sensor-name">No point clicked</span>
              <span className="sensor-value">-- ppm</span>
              <div className="sensor-timestamp">Click within bounds to interpolate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar


