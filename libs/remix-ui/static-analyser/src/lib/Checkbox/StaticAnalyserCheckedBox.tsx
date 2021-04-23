import React from 'react' //eslint-disable-line

interface StaticAnalyserCheckBoxProps {
  onClick?: (event) => void
  onChange?: (event) => void
  label?: string
  inputType?: string
  name?: string
  checked?: boolean
  id?: string
  itemName?: string
  categoryId?: string
}

const StaticAnalyserCheckedBox = ({
  id,
  label,
  onClick,
  inputType,
  name,
  checked,
  onChange,
  itemName,
  categoryId
}: StaticAnalyserCheckBoxProps) => {
  return (
    <div className="listenOnNetwork_2A0YE0 custom-control custom-checkbox" style={{ display: 'flex', alignItems: 'center' }} onClick={onClick}>
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

export default StaticAnalyserCheckedBox
