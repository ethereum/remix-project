import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './gas-price.css'

export const GasPrice = (props: any) => {
    // const {updateNetwork} = props
    return (
      <div className="crow">
        <label className="settingsLabel">Gas limit</label>
        <input type="number" className="form-control gasNval col2" id="gasLimit" value="3000000" />
      </div>
    )
}

export default GasPrice

