import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line
import { extractData } from '../../utils/solidityTypeFormatter'
import { ExtractData } from '../../types' // eslint-disable-line

export const SolidityState = ({ calldata, message }) => {
  const formatSelf = (key: string, data: ExtractData) => {
    try {
      let color = 'var(--primary)'
      if (data.isArray || data.isStruct || data.isMapping) {
        color = 'var(--info)'
      } else if (
        data.type.indexOf('uint') === 0 ||
            data.type.indexOf('int') === 0 ||
            data.type.indexOf('bool') === 0 ||
            data.type.indexOf('enum') === 0
      ) {
        color = 'var(--green)'
      } else if (data.type === 'string') {
        color = 'var(--teal)'
        } else if (data.self == 0x0) { // eslint-disable-line
        color = 'var(--gray)'
      }
      return (
        <label className='mb-0' style={{ color: data.isProperty ? 'var(--info)' : '', whiteSpace: 'pre-wrap' }}>
          {' ' + key}:
          <label className='mb-0' style={{ color }}>
            {' ' + data.self}
          </label>
          <label style={{ fontStyle: 'italic' }}>
            {data.isProperty || !data.type ? '' : ' ' + data.type}
          </label>
        </label>
      )
    } catch (e) {
      return (<></>)
    }
  }

  return (
    <div id='soliditystate' data-id='soliditystate'>
      {
        <DropdownPanel dropdownName='Solidity State' calldata={calldata || {}} formatSelfFunc={formatSelf} extractFunc={extractData} />
      }
    </div>
  )
}

export default SolidityState
