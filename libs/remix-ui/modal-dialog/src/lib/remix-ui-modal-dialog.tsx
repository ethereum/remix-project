import React, { useRef, useState, useEffect } from 'react' // eslint-disable-line
import { ModalDialogProps } from './types' // eslint-disable-line

import './remix-ui-modal-dialog.css'

export const ModalDialog = (props: ModalDialogProps) => {
  const [state, setState] = useState({
    toggleBtn: true
  })
  const modal = useRef(null)
  const handleHide = () => {
    props.handleHide()
  }

  useEffect(() => {
    modal.current.focus()
  }, [props.hide])

  const modalKeyEvent = (keyCode) => {
    if (keyCode === 27) { // Esc
      if (props.cancel && props.cancel.fn) props.cancel.fn()
      handleHide()
    } else if (keyCode === 13) { // Enter
      enterHandler()
    } else if (keyCode === 37) {
      // todo && footerIsActive) { // Arrow Left
      setState((prevState) => { return { ...prevState, toggleBtn: true } })
    } else if (keyCode === 39) {
      // todo && footerIsActive) { // Arrow Right
      setState((prevState) => { return { ...prevState, toggleBtn: false } })
    }
  }

  const enterHandler = () => {
    if (state.toggleBtn) {
      if (props.ok && props.ok.fn) props.ok.fn()
    } else {
      if (props.cancel && props.cancel.fn) props.cancel.fn()
    }
    handleHide()
  }

  return (
    <div
      data-id="modalDialogContainer"
      data-backdrop="static"
      data-keyboard="false"
      className='modal'
      style={{ display: props.hide ? 'none' : 'block' }}
      role="dialog"
    >
      <div className="modal-dialog" role="document">
        <div
          onBlur={(e) => {
            e.stopPropagation()
            handleHide()
          }}
          ref={modal}
          tabIndex={-1}
          className={'modal-content remixModalContent ' + (props.modalClass ? props.modalClass : '')}
          onKeyDown={({ keyCode }) => { modalKeyEvent(keyCode) }}
        >
          <div className="modal-header">
            <h6 className="modal-title" data-id="modalDialogModalTitle">
              {props.title && props.title}
            </h6>
            {!props.showCancelIcon &&
            <span className="modal-close" onClick={() => handleHide()}>
              <i title="Close" className="fas fa-times" aria-hidden="true"></i>
            </span>
            }
          </div>
          <div className="modal-body text-break remixModalBody" data-id="modalDialogModalBody">
            { props.children ? props.children : props.message }
          </div>
          <div className="modal-footer" data-id="modalDialogModalFooter">
            {/* todo add autofocus ^^ */}
            { props.ok &&
              <span
                className={'modal-ok btn btn-sm ' + (state.toggleBtn ? 'btn-dark' : 'btn-light')}
                onClick={() => {
                  if (props.ok.fn) props.ok.fn()
                  handleHide()
                }}
              >
                { props.ok.label ? props.ok.label : 'OK' }
              </span>
            }
            { props.cancel &&
              <span
                className={'modal-cancel btn btn-sm ' + (state.toggleBtn ? 'btn-light' : 'btn-dark')}
                data-dismiss="modal"
                onClick={() => {
                  if (props.cancel.fn) props.cancel.fn()
                  handleHide()
                }}
              >
                { props.cancel.label ? props.cancel.label : 'Cancel' }
              </span>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalDialog
