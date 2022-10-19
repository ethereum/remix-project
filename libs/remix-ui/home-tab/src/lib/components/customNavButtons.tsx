/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

const CustomNavButtons = ({ next, previous, goToSlide, ...rest }) => {
  const { carouselState: { currentSlide, totalItems, itemWidth, containerWidth } } = rest
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
          ((totalItems - currentSlide) * itemWidth + 5) < containerWidth ? 'disable py-1 border btn' : 'py-1 border btn'}
        onClick={() => {
            if (currentSlide + 1 < totalItems) goToSlide(currentSlide + 1)
        }}
        disabled ={((totalItems - currentSlide) * itemWidth + 5) < containerWidth}
      >
        <i className="fas fa-angle-right"></i>
      </button>
    </div>
  )
}

export default CustomNavButtons
