import React from 'react' // eslint-disable-line
import { CopyToClipboard } from '@remix-ui/clipboard' // eslint-disable-line
import { shortenHexData } from '@remix-ui/helper'
import { execution } from '@remix-project/remix-lib'
const typeConversion = execution.typeConversion

const showTable = (opts, showTableHash) => {
  let msg = ''
  let toHash
  const data = opts.data // opts.data = data.tx
  if (data.to) {
    toHash = opts.to + ' ' + data.to
  } else {
    toHash = opts.to
  }
  let callWarning = ''
  if (opts.isCall) {
    callWarning = '(Cost only applies when called by a contract)'
  }
  if (!opts.isCall) {
    if (opts.status !== undefined && opts.status !== null) {
      if (opts.status === '0x0' || opts.status === false) {
        msg = 'Transaction mined but execution failed'
      } else if (opts.status === '0x1' || opts.status === true) {
        msg = 'Transaction mined and execution succeed'
      }
    } else {
      msg = 'Status not available at the moment'
    }
  }

  let stringified = ' - '
  if (opts.logs && opts.logs.decoded) {
    stringified = typeConversion.stringify(opts.logs.decoded)
  }
  const val = opts.val != null ? typeConversion.toInt(opts.val) : 0
  return (
    <table
      className={`mt-1 mb-2 mr-4  align-self-center ${showTableHash.includes(opts.hash) ? 'active' : ''}`}
      id="txTable"
      data-id={`txLoggerTable${opts.hash}`}
    >
      <tbody>
        {opts.status !== undefined ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              status
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableStatus${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >{`${opts.status} ${msg}`}</td>
          </tr>
        ) : null}
        {opts.hash && !opts.isCall ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              transaction hash
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts.hash}
              <CopyToClipboard content={opts.hash} />
            </td>
          </tr>
        ) : null}
        {opts.contractAddress ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              contract address
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableContractAddress${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts.contractAddress}
              <CopyToClipboard content={opts.contractAddress} />
            </td>
          </tr>
        ) : null}
        {opts.from ? (
          <tr className="remix_ui_terminal_tr">
            <td className="td tableTitle" data-shared={`key_${opts.hash}`}>
              from
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableFrom${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts.from}
              <CopyToClipboard content={opts.from} />
            </td>
          </tr>
        ) : null}
        {opts.to ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              to
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableTo${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {toHash}
              <CopyToClipboard content={data.to ? data.to : toHash} />
            </td>
          </tr>
        ) : null}
        {opts.gas ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              gas
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableGas${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts.gas} gas
              <CopyToClipboard content={opts.gas} />
            </td>
          </tr>
        ) : null}
        {opts.transactionCost ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              transaction cost
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableTransactionCost${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts.transactionCost} gas {callWarning}
              <CopyToClipboard content={opts.transactionCost} />
            </td>
          </tr>
        ) : null}
        {opts.executionCost ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              execution cost
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableExecutionHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts.executionCost} gas {callWarning}
              <CopyToClipboard content={opts.executionCost} />
            </td>
          </tr>
        ) : null}
        {opts.input ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              input
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {shortenHexData(opts.input)}
              <CopyToClipboard content={opts.input} />
            </td>
          </tr>
        ) : null}
        {opts['decoded input'] ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              decoded input
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts['decoded input'].trim()}
              <CopyToClipboard content={opts['decoded input']} />
            </td>
          </tr>
        ) : null}
        {opts['decoded output'] ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              decoded output
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {opts['decoded output']}
              <CopyToClipboard content={opts['decoded output']} />
            </td>
          </tr>
        ) : null}
        {opts.logs ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              logs
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {JSON.stringify(stringified, null, '\t')}
              <CopyToClipboard
                content={JSON.stringify(stringified, null, '\t')}
              />
              <CopyToClipboard content={JSON.stringify(opts.logs.raw || '0')} />
            </td>
          </tr>
        ) : null}
        {opts.val ? (
          <tr className="remix_ui_terminal_tr">
            <td className="remix_ui_terminal_td" data-shared={`key_${opts.hash}`}>
              val
            </td>
            <td
              className="remix_ui_terminal_td"
              data-id={`txLoggerTableHash${opts.hash}`}
              data-shared={`pair_${opts.hash}`}
            >
              {val} wei
              <CopyToClipboard content={`${val} wei`} />
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  )
}
export default showTable
