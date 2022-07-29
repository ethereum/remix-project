import React, { useState } from 'react'
import { DeployButtonProps } from '../types'
import { ButtonGroup, Dropdown } from 'react-bootstrap'

export function DeployButton (props: DeployButtonProps) {
  const [showOptions, setShowOptions] = useState<boolean>(false)

  const toggleOptions = () => {
    setShowOptions(!showOptions)
  }
  
  return (
    <>
    { props.deployOptions && (props.deployOptions || []).length > 0 ?
      <Dropdown as={ButtonGroup}>
        <button onClick={props.handleActionClick} title={props.buttonOptions.title} className={`udapp_instanceButton ${props.buttonOptions.widthClass} btn btn-sm ${props.buttonOptions.classList}`} data-id={props.buttonOptions.dataId}>{ props.deployOptions[props.selectedIndex] ? props.deployOptions[props.selectedIndex].title : 'Deploy' }</button>
        <Dropdown.Toggle split id="dropdown-split-basic" className={`btn btn-sm dropdown-toggle dropdown-toggle-split ${props.buttonOptions.classList}`} style={{ maxWidth: 25, minWidth: 0, height: 32 }} />
        <Dropdown.Menu className="deploy-items border-0">
          {
            (props.deployOptions).map(({ title, active }, index) => <Dropdown.Item onClick={() => {
              props.setSelectedIndex(index)
              toggleOptions()
            }} key={index}> { props.selectedIndex === index ? <span>&#10003; {title} </span> : <span className="pl-3">{title}</span> }</Dropdown.Item>)
          }
        </Dropdown.Menu>
      </Dropdown> : 
      <button onClick={props.handleActionClick} title={props.buttonOptions.title} className={`udapp_instanceButton ${props.buttonOptions.widthClass} btn btn-sm ${props.buttonOptions.classList}`} data-id={props.buttonOptions.dataId}>
        Deploy
      </button>
    }
    </>
  )
}
