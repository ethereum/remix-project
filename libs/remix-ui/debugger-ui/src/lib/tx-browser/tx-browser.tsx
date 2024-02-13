import {CustomTooltip, isValidHash} from '@remix-ui/helper'
import React, {useState, useEffect, useRef} from 'react' //eslint-disable-line
import {useIntl, FormattedMessage} from 'react-intl'
import './tx-browser.css'

export const TxBrowser = ({requestDebug, updateTxNumberFlag, unloadRequested, transactionNumber, debugging}) => {
  const [state, setState] = useState({
    txNumber: '',
    isTxNumberValid: false
  })

  const inputValue = useRef(null)

  const intl = useIntl()

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        txNumber: transactionNumber,
        isTxNumberValid: isValidHash(transactionNumber),
      }
    })
  }, [transactionNumber, debugging])

  const handleSubmit = () => {
    if (!state.txNumber || !state.isTxNumberValid) return
    if (debugging) {
      unload()
    } else {
      requestDebug(undefined, state.txNumber)
    }
  }

  const unload = () => {
    unloadRequested()
  }

  const txInputChanged = (value) => {
    setState((prevState) => {
      return {
        ...prevState,
        isTxNumberValid: isValidHash(value),
        txNumber: value
      }
    })
  }

  const txInputOnInput = () => {
    updateTxNumberFlag(!inputValue.current.value)
  }

  const customJSX = (
    <div
      id="debuggerTransactionStartButtonContainer"
      data-id="debuggerTransactionStartButton"
      onClick={handleSubmit}
      className={`${!state.isTxNumberValid ? 'disabled ' : ''} btn btn-primary btn-sm btn-block text-decoration-none`}
    >
      <button
        className={`${!state.isTxNumberValid ? 'disabled ' : ''} btn btn-link btn-sm btn-block h-75 p-0 m-0 text-decoration-none`}
        id="load"
        onClick={handleSubmit}
        data-id="debuggerTransactionStartButton"
        disabled={!state.txNumber || !state.isTxNumberValid}
        style={{pointerEvents: 'none', color: 'white'}}
      >
        <span>
          <FormattedMessage id={`debugger.${debugging ? 'stopDebugging' : 'startDebugging'}`} />
        </span>
      </button>
    </div>
  )
  return (
    <div className="pb-2 container px-0">
      <div className="txContainer">
        <div className="py-1 d-flex justify-content-center w-100 input-group">
          <input
            ref={inputValue}
            value={state.txNumber}
            className="form-control m-0 txinput"
            id="txinput"
            type="text"
            onChange={({target: {value}}) => txInputChanged(value)}
            onInput={txInputOnInput}
            placeholder={intl.formatMessage({id: 'debugger.placeholder'})}
            data-id="debuggerTransactionInput"
            disabled={debugging}
          />
        </div>
        <div className="d-flex justify-content-center w-100 btn-group py-1">
          <CustomTooltip
            placement="bottom"
            tooltipText={<FormattedMessage id={`debugger.${!state.isTxNumberValid ? 'provideTxNumber' : debugging ? 'stopDebugging' : 'startDebugging'}`} />}
            tooltipId={'debuggingButtontooltip'}
            tooltipClasses="text-nowrap"
          >
            {customJSX}
          </CustomTooltip>
        </div>
      </div>
      <span id="error" />
    </div>
  )
}

export default TxBrowser
