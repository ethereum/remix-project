import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './common.css'

export const CompilationFail = (props: any) => {
    return (
        <i title="No contract compiled yet or compilation failed. Please check the compile tab for more information." className="m-2 ml-3 fas fa-times-circle errorIcon" ></i>
    );
}

export default CompilationFail
