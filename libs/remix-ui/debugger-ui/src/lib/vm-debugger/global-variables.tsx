import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line
import { BN } from 'ethereumjs-util'
import Web3 from 'web3'

export const GlobalVariables = ({ block, receipt, tx, className }) => {
  // see https://docs.soliditylang.org/en/latest/units-and-global-variables.html#block-and-transaction-properties
  const globals = {
    'block.chainid': tx.chainId,
    'block.coinbase': block.miner,
    'block.difficulty': block.difficulty,
    'block.gaslimit': block.gasLimit,
    'block.number': block.number,
    'block.timestamp': block.timestamp,
    'msg.sender': tx.from,
    'msg.sig': tx.input.substring(0, 10),
    'msg.value': tx.value + ' Wei',
    'tx.origin': tx.from
  }
  if (block.baseFeePerGas) {
    globals['block.basefee'] = Web3.utils.toBN(block.baseFeePerGas).toString(10) + ` Wei (${block.baseFeePerGas})`
  }

  return (
    <div id='globalvariable' data-id='globalvariable' className={className}>
      <DropdownPanel hexHighlight={false} bodyStyle={{ fontFamily: 'monospace' }} dropdownName='Global Variables' calldata={globals || {}} />
    </div>
  )
}

export default GlobalVariables
