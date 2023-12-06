import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from '../../context/context'
import {UsageTypes} from '../../types'
import { type } from 'os'

interface EnterDialogProps {
  show: boolean,
  handleUserChoice: (userChoice: UsageTypes) => void,
}

const EnterDialog = (props: EnterDialogProps) => {
  const [visibility, setVisibility] = useState<boolean>(false)
  const {showEnter} = useContext(AppContext)

  useEffect(() => {
    setVisibility(props.show)
    console.log("useeff vis in enter", props.show, " showEnter ", showEnter)
  }, [props.show])

  const enterAs = async (uType) => {
    props.handleUserChoice(uType)
  }

  const modalClass = (visibility && showEnter) ? "d-flex" : "d-none"
  console.log("enterDialog class ", modalClass)
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
              <h6 className="modal-title text-dark" data-id={`EnterModalDialogModalTitle-react`}>
                In order to understand your needs better, we would like to know how you typically use Remix
              </h6>
              <i className="text-dark fal fa-door-open text-center" style={{minWidth: "100px", fontSize: "xxx-large"}}></i>
            </div>
          </div>
          <div className="modal-body text-break remixModalBody d-flex flex-column p-3 justify-content-between" data-id={`EnterModalDialogModalBody-react`}>
            <button className="btn btn-secondary text-left" data-id="beginnerbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Beginner)}}>Learning - discovering web3 development</button>
            <button className="btn btn-secondary my-1 text-left" data-id="prototyperbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Prototyper)}}>Prototyping - trying out concepts and techniques</button>
            <button className="btn btn-secondary text-left" data-id="advanceUserbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Advance)}}>Developing  projects - Remix as your main dev tool</button>
            <button className="btn btn-secondary mt-1 text-left" data-id="productionbtn" style={{minWidth: "100px"}} onClick={() => {enterAs(UsageTypes.Production)}}>Production - only deployments</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterDialog
