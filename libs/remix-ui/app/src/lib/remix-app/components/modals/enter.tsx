import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from '../../context/context'
import {UsageTypes} from '../../types'
import { type } from 'os'

interface EnterDialogProps {
  hide: boolean,
  handleUserChoice: (userChoice: UsageTypes) => void,
}

const EnterDialog = (props: EnterDialogProps) => {
  const [visibility, setVisibility] = useState<boolean>(false)
  const {showEnter} = useContext(AppContext)

  useEffect(() => {
    setVisibility(!props.hide)
  }, [props.hide])

  const enterAs = async (uType) => {
    props.handleUserChoice(uType)
  }

  const modalClass = (visibility && showEnter) ? "d-flex" : "d-none"
  return (
    <div
      data-id={`EnterModalDialogContainer-react`}
      data-backdrop="static"
      data-keyboard="false"
      className={"modal  " + modalClass}
      role="dialog"
    >
      <div className="modal-dialog align-self-center pb-4" role="document">
        <div
          tabIndex={-1}
          className={'modal-content remixModalContent mb-4'}
          onKeyDown={({keyCode}) => {
          }}
        >
          <div className="modal-header d-flex flex-column">
            <h3 className='text-dark'>Welcome to Remix IDE</h3>
            <div className='d-flex flex-row pt-2'>
              <h6 className="modal-title" data-id={`EnterModalDialogModalTitle-react`}>
                To load the project with the most efficient setup we would like to know your experiance type.
              </h6>
              <i className="text-dark fal fa-door-open text-center" style={{minWidth: "100px", fontSize: "xxx-large"}}></i>
            </div>
          </div>
          <div className="modal-body text-break remixModalBody d-flex flex-row p-3 justify-content-between" data-id={`EnterModalDialogModalBody-react`}>
            <button className="btn-secondary" data-id="beginnerbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Beginner)}}>Learn/Playground</button>
            <button className="btn-secondary" data-id="tutorbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Tutor)}}>Teach/Workshop</button>
            <button className="btn-secondary" data-id="prototyperbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Prototyper)}}>Prototype/Test</button>
            <button className="btn-secondary" data-id="productionbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Production)}}>Production level</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterDialog
