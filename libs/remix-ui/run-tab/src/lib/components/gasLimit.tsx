// eslint-disable-next-line no-use-before-define
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { GasPriceProps } from '../types'

const defaultGasLimit = 3000000
export function GasLimitUI(props: GasPriceProps) {
  const inputComponent = useRef<HTMLInputElement>(null)
  const currentGasLimit = useRef(defaultGasLimit)
  const [gasLimitAuto, setGasLimitAuto] = useState(true)

  useEffect(() => {
    handleGasLimitAuto()
  }, [])

  useEffect(() => {
    handleGasLimitAuto()
  }, [gasLimitAuto])

  const handleGasLimit = (e) => {
    props.setGasFee(e.target.value)
  }

  const handleGasLimitAuto = () => {
    if (gasLimitAuto) {
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
      <div className='pl-0 custom-control custom-checkbox udapp_col2 udapp_gasNval'>
        <div className="d-flex pb-1 custom-control custom-radio">
          <input
            className="custom-control-input"
            type="radio"
            name="gasLimitRadio"
            value="auto"
            onChange={() => setGasLimitAuto(!gasLimitAuto)}
            checked={gasLimitAuto}
            id="glAutoConfig"
          />
          <label className="form-check-label custom-control-label" htmlFor="glAutoConfig" data-id="glAutoConfiguration">
            <FormattedMessage id="udapp.gasLimitAuto" />
          </label>
        </div>
        <div className="d-flex custom-control custom-radio align-items-baseline">
          <input
            className="custom-control-input"
            type="radio"
            name="gasLimitRadio"
            value="manual"
            onChange={() => setGasLimitAuto(!gasLimitAuto)}
            checked={!gasLimitAuto}
            id="glManualConfig"
          />
          <label className="mb-1 w-50 form-check-label custom-control-label" htmlFor="glManualConfig" data-id="glManualConfiguration">
            <FormattedMessage id="udapp.gasLimitManual" />
          </label>
          <CustomTooltip placement={'right'} tooltipClasses="text-nowrap" tooltipId="remixGasPriceTooltip" tooltipText={<FormattedMessage id="udapp.tooltipText4" />}>
            <input
              type="number"
              ref={inputComponent}
              disabled={gasLimitAuto}
              className="form-control w-100 float-right"
              id="gasLimit"
              value={props.gasLimit === 0 ? currentGasLimit.current : props.gasLimit}
              onChange={handleGasLimit}
            />
          </CustomTooltip>
        </div>
      </div>
    </div>
  )
}
