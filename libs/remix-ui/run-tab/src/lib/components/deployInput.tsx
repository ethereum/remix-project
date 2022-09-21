import React from 'react'
import { DeployInputProps } from '../types'
import { DeployButton } from './deployButton'

export function DeployInput (props: DeployInputProps) {
  return (
    <div className="udapp_contractActionsContainerSingle pt-2" style={{ display: 'flex' }}>
      <DeployButton buttonOptions={props.buttonOptions} selectedIndex={props.selectedIndex} setSelectedIndex={props.setSelectedIndex} handleActionClick={props.handleActionClick} deployOptions={props.deployOptions} />
      <input
        className="form-control"
        data-id={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : 'multiParamManagerBasicInputField'}
        placeholder={props.inputs}
        title={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}
        onChange={props.handleBasicInput}
        ref={props.basicInputRef}
        style={{ visibility: !props.inputs ? 'hidden' : 'visible' }}
      />
    </div>
  )
}
