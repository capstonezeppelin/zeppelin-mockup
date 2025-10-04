import React, { useCallback, useState } from 'react'
import Header from './components/Header'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import { useMockSensorData } from './hooks/useSensorData'

function App() {
  const { sensorData, sensorCount, defaultSensorLocations, bounds } = useMockSensorData()
  const [clickedPoint, setClickedPoint] = useState(null)
  const [clickedValue, setClickedValue] = useState(null)

  const handlePointClick = useCallback((pt) => {
    setClickedPoint(pt)
  }, [])

  return (
    <div className="App">
      <Header sensorCount={sensorCount} />
      <div className="main-container">
        <MapView
          sensorData={sensorData}
          defaultSensorLocations={defaultSensorLocations}
          bounds={bounds}
          onPointClick={handlePointClick}
          clickedPoint={clickedPoint}
          clickedValue={clickedValue}
          setClickedValue={setClickedValue}
        />
        <Sidebar sensorData={sensorData} clickedPoint={clickedPoint} clickedValue={clickedValue} />
      </div>
    </div>
  )
}

export default App


