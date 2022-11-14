/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

const CustomNavButtons = ({ parent, next, previous, goToSlide, ...rest }) => {
  const { carouselState: { currentSlide, totalItems, containerWidth, transform } } = rest
  return (
    <div className="mt-1 d-flex justify-content-end carousel-button-group">
      <button
        className={currentSlide === 0 ? 'disable py-1 border btn' : 'py-1 border btn'}
        disabled={currentSlide === 0}
        onClick={() => previous()}
      >
        <i className="fas fa-angle-left"></i>
      </button>
      <button
        className={ 
          (Math.abs(transform) >= parent?.current?.containerRef?.current?.scrollWidth - containerWidth) ? 'disable py-1 border btn' : 'py-1 border btn'}
        onClick={() => {
          if (currentSlide + 1 < totalItems) goToSlide(currentSlide + 1)
        }}
        disabled ={Math.abs(transform) >= parent?.current?.containerRef?.current?.scrollWidth - containerWidth}
      >
        <i className="fas fa-angle-right"></i>
      </button>
    </div>
  )
}

export default CustomNavButtons
