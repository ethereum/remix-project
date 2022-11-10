/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

const CustomButtonGroupDots = ({ next, previous, goToSlide, ...rest }) => {
  const { carouselState: { currentSlide, totalItems } } = rest

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={() => goToSlide(currentSlide - 1)}></button>
      <button onClick={() => goToSlide(currentSlide + 1)}></button>
    </div>
  )
}

export default CustomButtonGroupDots
