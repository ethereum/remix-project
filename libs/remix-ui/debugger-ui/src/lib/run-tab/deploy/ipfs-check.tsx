import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './ipfs-check.css'

export const IPFSCheck = (props: any) => {
    const {toggleCheckedState, initialCheck} = props
    const [checked, setChecked] = useState(initialCheck || false);

    const onCheckboxChange = (newCheck) => {
        setChecked(newCheck)
        toggleCheckedState(newCheck)
    }

    return (
        <div>
           <input
                id="deployAndRunPublishToIPFS" 
                type="checkbox"
                data-id="contractDropdownIpfsCheckbox"
                className="form-check-input custom-control-input"
                checked={checked}
                onChange={e => onCheckboxChange(!checked) }
            />
            <label
                htmlFor="deployAndRunPublishToIPFS"
                data-id="contractDropdownIpfsCheckboxLabel"
                className="m-0 form-check-label custom-control-label checkboxAlign"
                title="Publishing the source code and ABI to IPFS facilitates source code verification and will greatly foster contract adoption (auditing, debugging, calling it, etc...)"
            >
              Publish to IPFS
            </label>
        </div>
    );
}

export default IPFSCheck
