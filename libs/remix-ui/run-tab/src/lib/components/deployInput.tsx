import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { DeployInputProps } from '../types'
import { DeployButton } from './deployButton'

export function DeployInput (props: DeployInputProps) {
  return (
    <div className="udapp_contractActionsContainerSingle pt-2" style={{ display: 'flex' }}>
      <DeployButton buttonOptions={props.buttonOptions} selectedIndex={props.selectedIndex} setSelectedIndex={props.setSelectedIndex} handleActionClick={props.handleActionClick} deployOptions={props.deployOptions} />
      <OverlayTrigger
        placement="right-start"
        overlay={
          <Tooltip id="deployInputTooltip" className="text-nowrap">
            <span>{props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}</span>
          </Tooltip>
        }
      >
        <input
          className="form-control"
          data-id={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : 'multiParamManagerBasicInputField'}
          placeholder={props.inputs}
          title={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}
          onChange={props.handleBasicInput}
          ref={props.basicInputRef}
          style={{ visibility: !props.inputs ? 'hidden' : 'visible' }}
        />
      </OverlayTrigger>
    </div>
  )
}
