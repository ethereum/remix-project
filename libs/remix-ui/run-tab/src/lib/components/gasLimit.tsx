// eslint-disable-next-line no-use-before-define
import {CustomTooltip} from '@remix-ui/helper'
import React, { useEffect, useRef } from 'react'
import {FormattedMessage} from 'react-intl'
import {GasPriceProps} from '../types'

const defaultGasLimit = 3000000
export function GasLimitUI(props: GasPriceProps) {
  const auto = useRef(true)
  const inputComponent = useRef<HTMLInputElement>(null)
  const currentGasLimit = useRef(defaultGasLimit)

  useEffect(() => {
    handleGasLimitAuto(true)
  }, [])

  const handleGasLimit = (e) => {
    props.setGasFee(e.target.value)
  }

  const handleGasLimitAuto = (checked) => {
    auto.current = checked
    if (checked) {
      currentGasLimit.current = parseInt(inputComponent.current.value)
      props.setGasFee(0)
    } else {
      props.setGasFee(currentGasLimit.current)
    }    
  }

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">
        <FormattedMessage id="udapp.gasLimit" />
      </label>
      <div className='custom-control custom-checkbox udapp_col2 udapp_gasNval'>
        <input type="checkbox" className="" id="gasLimitAuto" checked={auto.current} onChange={(e) => { handleGasLimitAuto(e.target.checked) } } />
        <CustomTooltip placement={'right'} tooltipClasses="text-nowrap" tooltipId="remixGasPriceTooltip" tooltipText={<FormattedMessage id="udapp.tooltipText4" />}>
          <input type="number" ref={inputComponent} disabled={auto.current} className="form-control" id="gasLimit" value={props.gasLimit === 0 ? currentGasLimit.current : props.gasLimit} onChange={handleGasLimit} />        
        </CustomTooltip>        
      </div>      
    </div>
  )
}
