// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from '@remix-ui/clipboard'
import Web3 from 'web3'
import { MainnetProps } from '../types'

export function MainnetPrompt (props: MainnetProps) {
  const [baseFee, setBaseFee] = useState<string>('')

  useEffect(() => {
    props.init((txFeeText, gasPriceValue, gasPriceStatus) => {
      if (txFeeText) props.setTxFeeContent(txFeeText)
      if (gasPriceValue) onGasPriceChange(gasPriceValue)
      if (props.network && props.network.lastBlock && props.network.lastBlock.baseFeePerGas) {
        const baseFee = Web3.utils.fromWei(Web3.utils.toBN(parseInt(props.network.lastBlock.baseFeePerGas, 16)), 'Gwei')

        setBaseFee(baseFee)
        onMaxFeeChange(baseFee)
      }
      if (gasPriceStatus !== undefined) props.updateGasPriceStatus(gasPriceStatus)
    })
  }, [])

  const onMaxFeeChange = (value: string) => {
    const maxFee = value
    // @ts-ignore
    if (parseInt(props.network.lastBlock.baseFeePerGas, 16) > Web3.utils.toWei(maxFee, 'Gwei')) {
      props.setTxFeeContent('Transaction is invalid. Max fee should not be less than Base fee')
      props.updateGasPriceStatus(false)
      props.updateConfirmSettings(true)
      return
    } else {
      props.updateGasPriceStatus(true)
      props.updateConfirmSettings(false)
    }

    props.setNewGasPrice(maxFee, (txFeeText, priceStatus) => {
      props.setTxFeeContent(txFeeText)
      if (priceStatus) {
        props.updateConfirmSettings(false)
      } else {
        props.updateConfirmSettings(true)
      }
      props.updateGasPriceStatus(priceStatus)
      props.updateMaxFee(maxFee)
      props.updateBaseFeePerGas(props.network.lastBlock.baseFeePerGas)
    })
  }

  const onGasPriceChange = (value: string) => {
    const gasPrice = value

    props.setNewGasPrice(gasPrice, (txFeeText, priceStatus) => {
      props.setTxFeeContent(txFeeText)
      props.updateGasPriceStatus(priceStatus)
      props.updateGasPrice(gasPrice)
    })
  }

  const onMaxPriorityFeeChange = (value: string) => {
    props.updateMaxPriorityFee(value)
  }

  return (
    <div>
      <div className="text-dark">You are about to create a transaction on {props.network.name} Network. Confirm the details to send the info to your provider.
        <br />The provider for many users is MetaMask. The provider will ask you to sign the transaction before it is sent to {props.network.name} Network.
      </div>
      <div className="mt-3">
        <div>
          <span className="text-dark mr-2">From:</span>
          <span>{props.tx.from}</span>
        </div>
        <div>
          <span className="text-dark mr-2">To:</span>
          <span>{props.tx.to ? props.tx.to : '(Contract Creation)'}</span>
        </div>
        <div className="d-flex align-items-center">
          <span className="text-dark mr-2">Data:</span>
          <pre className="udapp_wrapword mb-0">{props.tx.data && props.tx.data.length > 50 ? props.tx.data.substring(0, 49) + '...' : props.tx.data}
            <CopyToClipboard content={props.tx.data} />
          </pre>
        </div>
        <div className="mb-3">
          <span className="text-dark mr-2">Amount:</span>
          <span>{props.amount} Ether</span>
        </div>
        <div>
          <span className="text-dark mr-2">Gas estimation:</span>
          <span>{props.gasEstimation}</span>
        </div>
        <div>
          <span className="text-dark mr-2">Gas limit:</span>
          <span>{props.tx.gas}</span>
        </div>
        {
          props.network.lastBlock.baseFeePerGas
            ? <div>
              <div className="align-items-center my-1" title="Represents the part of the tx fee that goes to the miner.">
                <div className='d-flex'>
                  <span className="text-dark mr-2 text-nowrap">Max Priority fee:</span>
                  <input className="form-control mr-1 text-right" style={{ height: '1.2rem', width: '6rem' }} id='maxpriorityfee' onInput={(e: any) => onMaxPriorityFeeChange(e.target.value)} defaultValue={props.maxPriorityFee} />
                  <span title="visit https://ethgasstation.info for current gas price info.">Gwei</span>
                </div>
              </div>
              <div className="align-items-center my-1" title="Represents the maximum amount of fee that you will pay for this transaction. The minimun needs to be set to base fee.">
                <div className='d-flex'>
                  <span className="text-dark mr-2 text-nowrap">Max fee (Not less than base fee {Web3.utils.fromWei(Web3.utils.toBN(parseInt(props.network.lastBlock.baseFeePerGas, 16)), 'Gwei')} Gwei):</span>
                  <input className="form-control mr-1 text-right" style={{ height: '1.2rem', width: '6rem' }} id='maxfee' onInput={(e: any) => onMaxFeeChange(e.target.value)} defaultValue={baseFee} />
                  <span>Gwei</span>
                  <span className="text-dark ml-2"></span>
                </div>
              </div>
            </div>
            : <div className="d-flex align-items-center my-1">
              <span className="text-dark mr-2 text-nowrap">Gas price:</span>
              <input className="form-control mr-1 text-right" style={{ width: '40px', height: '28px' }} id='gasprice' onInput={(e: any) => onGasPriceChange(e.target.value)} />
              <span>Gwei (visit <a target='_blank' href='https://ethgasstation.info' rel="noreferrer">ethgasstation.info</a> for current gas price info.)</span>
            </div>
        }
        <div className="mb-3">
          <span className="text-dark mr-2">Max transaction fee:</span>
          <span className="text-warning" id='txfee'>{ props.txFeeContent }</span>
        </div>
      </div>
      <div className="d-flex py-1 align-items-center custom-control custom-checkbox remixui_checkbox">
        <input className="form-check-input custom-control-input" id="confirmsetting" type="checkbox" />
        <label className="m-0 form-check-label custom-control-label" htmlFor="confirmsetting">Do not show this warning again.</label>
      </div>
    </div>
  )
}
