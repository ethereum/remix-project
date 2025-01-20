import React, { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { AppContext } from '../../context/context'
import { UsageTypes } from '../../types'
import { type } from 'os'

interface EnterDialogProps {
  handleUserChoice: (userChoice: UsageTypes) => void,
}

const EnterDialog = (props: EnterDialogProps) => {

  const enterAs = async (uType) => {
    props.handleUserChoice(uType)
  }

  const modalClass = "d-flex"
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
          onKeyDown={({ keyCode }) => {
          }}
        >
          <div className="modal-header d-flex flex-column">
            <h3 className='text-dark'><FormattedMessage id="remixApp.enterText1" /></h3>
            <div className='d-flex flex-row pt-2'>
              <h6 className="modal-title text-dark" data-id={`EnterModalDialogModalTitle-react`}>
                <FormattedMessage id="remixApp.enterText2" />
              </h6>
              <i className="text-dark fal fa-door-open text-center" style={{ minWidth: "100px", fontSize: "xxx-large" }}></i>
            </div>
          </div>
          <div className="modal-body text-break remixModalBody d-flex flex-column p-3 justify-content-between" data-id={`EnterModalDialogModalBody-react`}>
            <button className="btn btn-secondary text-left" data-id="beginnerbtn" style={{ minWidth: "100px" }} onClick={() => {enterAs(UsageTypes.Beginner)}}><FormattedMessage id="remixApp.enterText3" /></button>
            <button className="btn btn-secondary my-1 text-left" data-id="prototyperbtn" style={{ minWidth: "100px" }} onClick={() => {enterAs(UsageTypes.Prototyper)}}><FormattedMessage id="remixApp.enterText4" /></button>
            <button className="btn btn-secondary text-left" data-id="advanceUserbtn" style={{ minWidth: "100px" }} onClick={() => {enterAs(UsageTypes.Advance)}}><FormattedMessage id="remixApp.enterText5" /></button>
            <button className="btn btn-secondary mt-1 text-left" data-id="productionbtn" style={{ minWidth: "100px" }} onClick={() => {enterAs(UsageTypes.Production)}}><FormattedMessage id="remixApp.enterText6" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterDialog
