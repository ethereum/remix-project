import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const StoragePanel = ({ calldata, header }) => {
  return (
    <div id='storagepanel'>
      <DropdownPanel dropdownName='Storage' calldata={calldata || {}} header={header} />
    </div>
  )
}

export default StoragePanel
