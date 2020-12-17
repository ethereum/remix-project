import React, { useRef, useState, useEffect } from 'react' // eslint-disable-line
import { ModalDialogProps } from './types' // eslint-disable-line

import './remix-ui-modal-dialog.css'

export const ModalDialog = (props: ModalDialogProps) => {
  const [state, setState] = useState({
    toggleBtn: true
  })
  const modal = useRef(null)
  const handleHide = () => {
    props.hide()
  }

  useEffect(
    () => {
      modal.current.focus()
    }, []
  )

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
  return (<>
    <div
      id="modal-dialog"
      data-id="modalDialogContainer"
      data-backdrop="static"
      data-keyboard="false"
      tabIndex={-1}
      className="modal d-block"
      role="dialog"
    >
      <div id="modal-background" className="modal-dialog" role="document">
        <div
          tabIndex={1}
          onBlur={(e) => {
            e.stopPropagation()
            handleHide()
          }}
          ref={modal}
          className={'modal-content remixModalContent ' + (props.opts ? props.opts.class ? props.opts.class : '' : '')}
          onKeyDown={({ keyCode }) => { modalKeyEvent(keyCode) }}
        >
          <div className="modal-header">
            <h6 className="modal-title" data-id="modalDialogModalTitle">
              {props.title && props.title}
            </h6>
            {!props.opts.hideClose &&
            <span className="modal-close" onClick={() => handleHide()}>
              <i id="modal-close" title="Close" className="fas fa-times" aria-hidden="true"></i>
            </span>
            }
          </div>
          <div className="modal-body text-break remixModalBody" data-id="modalDialogModalBody">
            {props.content &&
            props.content
            }
          </div>
          <div className="modal-footer" data-id="modalDialogModalFooter">
            {/* todo add autofocus ^^ */}
            {props.ok &&
            <span
              id="modal-footer-ok"
              className={'modal-ok btn btn-sm ' + (state.toggleBtn ? 'btn-dark' : 'btn-light')}
              onClick={() => {
                if (props.ok && props.ok.fn) props.ok.fn()
                handleHide()
              }}
              tabIndex={1}
            >
              {props.ok && props.ok.label ? props.ok.label : 'OK'}
            </span>
            }
            <span
              id="modal-footer-cancel"
              className={'modal-cancel btn btn-sm ' + (state.toggleBtn ? 'btn-light' : 'btn-dark')}
              data-dismiss="modal"
              onClick={() => {
                if (props.cancel && props.cancel.fn) props.cancel.fn()
                handleHide()
              }}
              tabIndex={2}
            >
              {props.cancel && props.cancel.label ? props.cancel.label : 'Cancel'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </>)
}

export default ModalDialog
