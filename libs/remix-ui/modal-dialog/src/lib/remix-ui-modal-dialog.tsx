import React, {useRef, useState, useEffect} from 'react' // eslint-disable-line
import {ModalDialogProps} from './types' // eslint-disable-line

import './remix-ui-modal-dialog.css'
import { AppModalCancelTypes } from '@remix-ui/app'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    testmode: boolean
    _paq: any
  }
}

const _paq = (window._paq = window._paq || [])

export const ModalDialog = (props: ModalDialogProps) => {
  console.log('ModalDialog', props)
  const [state, setState] = useState({
    toggleBtn: true
  })
  const calledHideFunctionOnce = useRef<boolean>()
  const modal = useRef(null)
  const handleHide = () => {
    _paq.push(['trackEvent', 'modal', 'hide', props.id])
    if (!calledHideFunctionOnce.current) {
      props.handleHide()
    }
    calledHideFunctionOnce.current = true
  }

  useEffect(() => {
    _paq.push(['trackEvent', 'modal', 'propshide', props.hide])
    calledHideFunctionOnce.current = props.hide
    modal.current.focus()

    if (modal.current && !props.preventBlur) {
      modal.current.removeEventListener('blur', handleBlur)
      modal.current.addEventListener('blur', handleBlur)
    }
    return () => {
      modal.current && modal.current.removeEventListener('blur', handleBlur)
    }
  }, [props.hide])

  function handleBlur(e) {
    _paq.push(['trackEvent', 'modal', 'blur', JSON.stringify(e), this.id, props.title, e.currentTarget, e.relatedTarget])
    console.log('handleBlur', e.currentTarget, e.relatedTarget, this)
    console.trace()
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      e.stopPropagation()
      if (document.activeElement !== this) {
        !window.testmode && handleHide()
        !window.testmode && props.cancelFn && props.cancelFn(AppModalCancelTypes.blur)
      }
    }
  }

  const modalKeyEvent = (keyCode) => {
    _paq.push(['trackEvent', 'modal', 'keyEvent', keyCode])
    if (keyCode === 27) {
      // Esc
      if (props.cancelFn) props.cancelFn(AppModalCancelTypes.escape)
      handleHide()
    } else if (keyCode === 13) {
      // Enter
      enterHandler()
    } else if (keyCode === 37) {
      // todo && footerIsActive) { // Arrow Left
      setState((prevState) => {
        return { ...prevState, toggleBtn: true }
      })
    } else if (keyCode === 39) {
      // todo && footerIsActive) { // Arrow Right
      setState((prevState) => {
        return { ...prevState, toggleBtn: false }
      })
    }
  }

  const enterHandler = () => {
    _paq.push(['trackEvent', 'modal', 'enterHandler', state.toggleBtn])
    if (state.toggleBtn) {
      if (props.okFn) props.okFn()
    } else {
      if (props.cancelFn) props.cancelFn(AppModalCancelTypes.enter)
    }
    handleHide()
  }

  return (
    <div
      data-id={`${props.id}ModalDialogContainer-react`}
      data-backdrop="static"
      data-keyboard="false"
      className="modal"
      style={{ display: props.hide ? 'none' : 'block' }}
      role="dialog"
    >
      <div className={'modal-dialog ' + (props.modalParentClass ? props.modalParentClass : '')} role="document">
        <div
          ref={modal}
          tabIndex={-1}
          className={'modal-content remixModalContent ' + (props.modalClass ? props.modalClass : '')}
          onKeyDown={({ keyCode }) => {
            modalKeyEvent(keyCode)
          }}
        >
          <div className="modal-header">
            <h6 className="modal-title" data-id={`${props.id}ModalDialogModalTitle-react`}>
              {props.title && props.title}
            </h6>
            {!props.showCancelIcon && (
              <span data-id={`${props.id}-modal-close`} className="modal-close" onClick={() => handleHide()}>
                <i className="fas fa-times" aria-hidden="true"></i>
              </span>
            )}
          </div>
          <div className="modal-body text-break remixModalBody" data-id={`${props.id}ModalDialogModalBody-react`}>
            {props.children ? props.children : props.message}
          </div>
          <div className="modal-footer" data-id={`${props.id}ModalDialogModalFooter-react`}>
            {/* todo add autofocus ^^ */}
            {props.okLabel && (
              <button
                data-id={`${props.id}-modal-footer-ok-react`}
                className={'modal-ok btn btn-sm ' + (props.okBtnClass ? props.okBtnClass : state.toggleBtn ? 'border-primary' : 'border-secondary')}
                disabled={props.validation && !props.validation.valid}
                onClick={() => {
                  if (props.validation && !props.validation.valid) return
                  if (props.okFn) props.okFn()
                  if (props.donotHideOnOkClick) calledHideFunctionOnce.current = false
                  else handleHide()
                }}
              >
                {props.okLabel ? props.okLabel : 'OK'}
              </button>
            )}
            {props.cancelLabel && (
              <button
                data-id={`${props.id}-modal-footer-cancel-react`}
                className={'modal-cancel btn btn-sm ' + (props.cancelBtnClass ? props.cancelBtnClass : state.toggleBtn ? 'border-secondary' : 'border-primary')}
                data-dismiss="modal"
                onClick={() => {
                  if (props.cancelFn) props.cancelFn(AppModalCancelTypes.click)
                  handleHide()
                }}
              >
                {props.cancelLabel ? props.cancelLabel : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalDialog
