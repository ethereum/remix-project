// eslint-disable-next-line no-use-before-define
import React from 'react'
import { GasPriceProps } from '../types'

export function GasPriceUI (props: GasPriceProps) {
  const handleGasLimit = (e) => {
    props.setGasFee(e.target.value)
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">Gas limit</label>
      <input type="number" className="form-control udapp_gasNval udapp_col2" title="The default gas limit is 3M. Adjust as needed." id="gasLimit" value={props.gasLimit} onChange={handleGasLimit} />
    </div>
  )
}
