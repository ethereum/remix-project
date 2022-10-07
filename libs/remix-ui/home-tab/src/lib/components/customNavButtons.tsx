/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

const CustomNavButtons = ({ next, previous, goToSlide, ...rest }) => {
  const { carouselState: { currentSlide, totalItems } } = rest
  return (
    <div className="mt-1 d-flex justify-content-end carousel-button-group">
      <button className={currentSlide === 0 ? 'disable py-0 border btn' : 'py-0 border btn'} onClick={() => previous()}>
        <i className="fas fa-angle-left"></i>
      </button>
      <button className={currentSlide + 1 === totalItems ? 'disable py-0 border btn' : 'py-0 border btn'} onClick={() => {
          if (currentSlide + 1 < totalItems) goToSlide(currentSlide + 1)
        }} >
        <i className="fas fa-angle-right"></i>
      </button>
    </div>
  )
}

export default CustomNavButtons
