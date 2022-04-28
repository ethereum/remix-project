import React, { CSSProperties } from 'react'  //eslint-disable-line
import './remix-ui-checkbox.css'

/* eslint-disable-next-line */
export interface RemixUiCheckboxProps {
  onClick?: (event) => void
  onChange?: (event) => void
  label?: string
  inputType?: string
  name?: string
  checked?: boolean
  id?: string
  itemName?: string
  categoryId?: string
  title?: string
  visibility?: string
  display?: string
}

export const RemixUiCheckbox = ({
  id,
  label,
  onClick,
  inputType,
  name,
  checked,
  onChange,
  itemName,
  categoryId,
  title,
  visibility,
  display = 'flex'
}: RemixUiCheckboxProps) => {
  return (
    <div className="listenOnNetwork_2A0YE0 custom-control custom-checkbox" title={title} style={{ display: display, alignItems: 'center', visibility: visibility } as CSSProperties } onClick={onClick}>
      <input
        id={id}
        type={inputType}
        onChange={onChange}
        style={{ verticalAlign: 'bottom' }}
        name={name}
        className="custom-control-input"
        checked={checked}
      />
      <label className="form-check-label custom-control-label" id={`heading${categoryId}`} style={{ paddingTop: '0.15rem' }}>
        {name ? <div className="font-weight-bold">{itemName}</div> : ''}
        {label}
      </label>
    </div>
  )
}

export default RemixUiCheckbox
