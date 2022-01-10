import React, { useContext, useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PermissionHandlerProps } from '../interface'
import './permission-dialog.css'

const PermissionHandlerDialog = (props: PermissionHandlerProps) => {
  const { from, to, remember, method, message } = props.value

  const switchMode = () => {

  }

  const rememberSwitch = () => {
    return <input type="checkbox" onChange={switchMode} className='form-check-input' id='remember' data-id={remember ? 'permissionHandlerRememberChecked' : 'permissionHandlerRememberUnchecked'}/>
  }
  const reset = () => {

  }

  const imgFrom = () => { return <img alt='' id='permissionModalImagesFrom' src={from.icon} /> }
  const imgTo = () => { return <img alt='' id='permissionModalImagesTo' src={to.icon} /> }
  const pluginsImages = () => {
    return (
      <article className='images'>
        {imgFrom}
        <i className="fas fa-arrow-right"></i>
        {imgTo}
      </article>
    )
  }

  const text = () => {
    return `"${from.displayName}" ${(remember ? 'has changed and' : '')} would like to access to "${method}" of "${to.displayName}"`
  }

  const pluginMessage = () => {
    return message
      ? <div>
        <h6>Description</h6>
        <p>{message}</p>
      </div> : null
  }

  return (<section className="permission">
    {pluginsImages}
    <article>
      <h4 data-id="permissionHandlerMessage">{text} :</h4>
      <h6>{from.displayName}</h6>
      <p> {from.description} || <i>No description Provided</i></p>
      <h6>{to.displayName} :</h6>
      <p> {to.description} || <i>No description Provided</i></p>
      {pluginMessage}
    </article>
    <article className='remember'>
      <div className='form-check'>
        {rememberSwitch}
        <label className="form-check-label" data-id="permissionHandlerRememberChoice">Remember this choice</label>
      </div>
      <button className="btn btn-sm" onClick={reset}>Reset all Permissions</button>
    </article>
  </section>)
}

export default PermissionHandlerDialog
