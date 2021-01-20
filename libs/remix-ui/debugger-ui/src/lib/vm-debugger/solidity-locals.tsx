import React, { useState, useEffect } from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line
import { extractData } from '../../utils/solidityTypeFormatter' // eslint-disable-line
import { ExtractData } from '../../types' // eslint-disable-line

export const SolidityLocals = ({ data, message, registerEvent, triggerEvent }) => {
  const [calldata, setCalldata] = useState(null)

  useEffect(() => {
    data && setCalldata(data)
  }, [data])

  const formatSelf = (key: string, data: ExtractData) => {
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
    if (data.type === 'string') {
      data.self = JSON.stringify(data.self)
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
  }

  return (
    <div id='soliditylocals' data-id="solidityLocals">
      <DropdownPanel
        dropdownName='Solidity Locals'
        dropdownMessage={message}
        calldata={calldata || {}}
        extractFunc={extractData}
        formatSelfFunc={formatSelf}
        registerEvent={registerEvent}
        triggerEvent={triggerEvent}
        loadMoreEvent='solidityLocalsLoadMore'
        loadMoreCompletedEvent='solidityLocalsLoadMoreCompleted'
      />
    </div>
  )
}

export default SolidityLocals
