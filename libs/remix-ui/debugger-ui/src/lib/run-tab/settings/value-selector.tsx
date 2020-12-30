import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './value-selector.css'

export const ValueSelector = () => {
    return (
      <div className="crow">
        <label className="settingsLabel">Value</label>
        <div className="gasValueContainer">
          <input type="text" className="form-control gasNval col2" id="value" value="0" title="Enter the value and choose the unit" />
          <select name="unit" className="form-control p-1 gasNvalUnit col2_2 custom-select" id="unit">
            <option data-unit="wei">wei</option>
            <option data-unit="gwei">gwei</option>
            <option data-unit="finney">finney</option>
            <option data-unit="ether">ether</option>
          </select>
        </div>
      </div>
    )
}

export default ValueSelector
