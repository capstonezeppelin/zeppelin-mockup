import React from 'react'

const Header = ({ sensorCount }) => {
  return (
    <div className="header">
      <h1>🏭 UGM CO Monitoring Mockup</h1>
      <div className="status-indicators">
        <div className="indicator">
          <span className="dot"></span>
          <span className="text">Mock Data</span>
        </div>
        <div className="indicator">
          <span className="dot"></span>
          <span className="text">
            {sensorCount.online}/{sensorCount.total} Sensors Online
          </span>
        </div>
      </div>
    </div>
  )
}

export default Header


