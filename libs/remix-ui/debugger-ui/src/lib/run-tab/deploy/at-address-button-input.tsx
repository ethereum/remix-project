import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './common.css'

export const AtAddressButtonInput = (props: any) => {
    const {atAddressChanged} = props
    return (
        <input className="input ataddressinput form-control" placeholder="Load contract from Address" title="address of contract" onInput={() => { atAddressChanged() }} />
    );
}

export default AtAddressButtonInput
