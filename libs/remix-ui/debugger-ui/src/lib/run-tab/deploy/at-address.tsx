import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './common.css'

export const AtAddress = (props: any) => {
    const {loadFromAddress} = props
    return (
        <button className="atAddress btn btn-sm btn-info" id="runAndDeployAtAdressButton" onClick={() => loadFromAddress()}>At Address</button>
    );
}

export default AtAddress
