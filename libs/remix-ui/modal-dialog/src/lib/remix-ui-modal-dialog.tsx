import React, { useRef, useState, useEffect } from 'react';

import './remix-ui-modal-dialog.css';
import {ModalDialogProps} from './types';

/* eslint-disable-next-line */


export const ModalDialog = (props: ModalDialogProps) => {
  const [state, setState] = useState({
    toggleBtn: true,
    hideState: true
  })
  const okBtn = useRef(null)
  const cancelBtn = useRef(null)
  useEffect(() => {
    setState(prevState => {
      console.log("useeffect to ", props.hide)  
      return {...prevState, hideState: props.hide}
    })
}, [props.hide])
  const modalKeyEvent = (keyCode) => {
    console.log("key is ", keyCode)
    if (keyCode === 27) { // Esc
      if (props.cancel && props.cancel.fn) props.cancel.fn()
      setState((prevState)=>{return {...prevState, hideState: true}})
    //} else if (keyCode === 13) { // Enter
    //  okListener()
    } else if (keyCode === 37) {
      // todo && footerIsActive) { // Arrow Left
      setState((prevState)=>{return {...prevState, toggleBtn: true}})
      okBtn.current.focus()
    } else if (keyCode === 39) {
      // todo && footerIsActive) { // Arrow Right
      setState((prevState)=>{return {...prevState, toggleBtn: false}})
      cancelBtn.current.focus()
    }
  }
  return (<>
    <div
      id="modal-dialog"
      data-id="modalDialogContainer"
      data-backdrop="static"  
      data-keyboard="false"
      tabIndex={-1}
      className={"modal " + (state.hideState ? "d-none" : "d-block")}
      role="dialog"
      onKeyDown={({keyCode})=>{modalKeyEvent(keyCode)}}
    >
      <div id="modal-background" className="modal-dialog" role="document">
        <div className={"modal-content remixModalContent " + (props.opts ? props.opts.class ? props.opts.class : '': '')}>
          <div className="modal-header">
            <h6 className="modal-title" data-id="modalDialogModalTitle">
            {props.title && props.title}
            </h6>
            {!props.opts.hideClose &&
            <span className="modal-close">
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
            <span
              id="modal-footer-ok"
              className={"modal-ok btn btn-sm " + (state.toggleBtn ? "btn-dark" : "btn-light")}
              onClick={() => {if (props.ok && props.ok.fn) props.ok.fn()}}
            >
              {props.ok&&props.ok.label ? props.ok.label: 'OK'}
            </span>
            <span id="modal-footer-cancel" className={"modal-cancel btn btn-sm " + (state.toggleBtn ? "btn-light" : "btn-dark")} data-dismiss="modal">{props.cancel&&props.cancel.label ? props.cancel.label: 'Cancel'}</span>
          </div>
        </div>
      </div>
    </div>
  </>);
};

export default ModalDialog;
