import { CustomTooltip } from '@remix-ui/helper'
import React, {CSSProperties} from 'react' //eslint-disable-line
import './remix-ui-checkbox.css'
import { Placement } from 'react-bootstrap/esm/types'

/* eslint-disable-next-line */
export interface RemixUiCheckboxProps {
  onClick?: (event) => void
  onChange?: (event) => void
  label?: string
  inputType?: string
  name?: string
  checked?: boolean
  disabled?: boolean
  id?: string
  itemName?: string
  categoryId?: string
  title?: string
  visibility?: string
  display?: string
  tooltipPlacement?: Placement
  optionalClassName?: string
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
  optionalClassName = '',
  display = 'flex',
  disabled,
  tooltipPlacement = 'right'
}: RemixUiCheckboxProps) => {
  const childJSXWithTooltip = (
    <CustomTooltip tooltipText={title} tooltipId={`${name}Tooltip`} placement={tooltipPlacement}>
      <div
        className={`listenOnNetwork_2A0YE0 form-check ${optionalClassName}`}
        style={
          {
            display: display,
            alignItems: 'center',
            visibility: visibility
          } as CSSProperties
        }
        onClick={onClick}
      >
        <input id={id} type={inputType} onChange={onChange} style={{ verticalAlign: 'bottom' }} name={name} className="form-check-input" checked={checked} disabled={disabled} />
        <label className="form-check-label ms-1" id={`heading${categoryId}`} style={{ paddingTop: '0.15rem' }} aria-disabled={disabled} htmlFor={id}>
          {name ? <div className="fw-bold">{itemName}</div> : ''}
          {label}
        </label>
      </div>
    </CustomTooltip>
  )
  const childJSX = (
    <div
      className="listenOnNetwork_2A0YE0 form-check"
      style={
        {
          display: display,
          alignItems: 'center',
          visibility: visibility
        } as CSSProperties
      }
      onClick={onClick}
    >
      <input id={id} type={inputType} onChange={onChange} style={{ verticalAlign: 'bottom' }} name={name} className="form-check-input" checked={checked} />
      <label className="form-check-label ms-1" id={`heading${categoryId}`} style={{ paddingTop: '0.15rem' }}>
        {name ? <div className="fw-bold">{itemName}</div> : ''}
        {label}
      </label>
    </div>
  )
  return title ? childJSXWithTooltip : childJSX
}

export default RemixUiCheckbox
