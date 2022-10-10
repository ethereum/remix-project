/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'

interface  CustomButtonGroupAsArrowsProps {}
  
function CustomButtonGroupAsArrows ({ next, previous }) {
    return (
        <div
            style={{
            textAlign: "center",
            }}
        >
            <h4>These buttons can be positioned anywhere you want on the screen</h4>
            <button onClick={previous}>Prev</button>
            <button onClick={next}>Next</button>
        </div>
    )
}

export default CustomButtonGroupAsArrows