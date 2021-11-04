// eslint-disable-next-line no-use-before-define
import React from 'react'
import { GasPriceProps } from '../types'

export function GasPriceUI (props: GasPriceProps) {
  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">Gas limit</label>
      <input type="number" className="form-control udapp_gasNval udapp_col2" id="gasLimit" defaultValue="3000000" />
    </div>
  )
}
