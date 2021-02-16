import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './gas-price.css'

export const GasPrice = () => {
  const [gasPrice, setGasPrice] = useState("3000000");
  return (
    <div className="remixui_crow">
      <label className="remixui_settingsLabel">Gas limit</label>
      <input type="number" className="form-control remixui_gasNval remixui_col2" id="gasLimit" value={gasPrice} onInput={(e) => setGasPrice((e.target as HTMLTextAreaElement).value)} />
    </div>
  )
}

export default GasPrice
