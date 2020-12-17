import React, { useEffect, useState } from 'react'

import './toaster.css';

/* eslint-disable-next-line */
export interface ToasterProps {
  message: any
  opts?: ToasterOptions
}

export interface ToasterOptions {
  time: number
}

export const Toaster = (props: ToasterProps) => {
  const [state, setState] = useState({
    timeOutId: null,
    message: '',
    hiding: false
  })

  const opts = defaultOptions(props.opts)

  useEffect(() => {
    let timeOutId = null
    if (props.message) {
      timeOutId = setTimeout(() => {
        setState(prevState => {
          return {
            ...prevState,
            hiding: true
          }
        })
      }, opts.time)
    }    

    setState(prevState => {
      return {
        ...prevState,
        message: props.message,
        hiding: false,
        timeOutId
      }
    })
  }, [props.message])

  const shortTooltipText = state.message.length > 201 ? state.message.substring(0, 200) + '...' : state.message
      
  function hide () {
    if (state.timeOutId) clearTimeout(state.timeOutId)
  }

  function showFullMessage () {
    // alert(state.message)
  }

  function closeTheToaster () {
    hide()           
  }

  // out()
  const animate = state.timeOutId ? (state.hiding ? 'remixui_animateBottom' : 'remixui_animateTop') : ''
  // const hide = state.timeOutId
  const className = `remixui_tooltip alert alert-info p-2 ${animate}`
  return (
    <div data-shared="tooltipPopup" className={className}  onMouseEnter={() => { }} onMouseLeave={() => { }}>
      <span className="px-2">
        {shortTooltipText}
        { state.message.length > 201 ? <button className="btn btn-secondary btn-sm mx-3" style={{whiteSpace: 'nowrap'}} onClick={() => showFullMessage()}>Show full message</button> : ''}            
      </span>
      <span style={{alignSelf: 'baseline'}}>
        <button data-id="tooltipCloseButton" className="fas fa-times btn-info mx-1 p-0" onClick={() => closeTheToaster()}></button>
      </span>
    </div>
  )
  
  // animation(this.tooltip, css.animateBottom.className)  
};

export default Toaster;

const defaultOptions = (opts) : ToasterOptions => {
  opts = opts || {}
  return {
    time: opts.time || 7000
  }
}

/*
const animation = (tooltip, anim) => {
  tooltip.classList.remove(css.animateTop.className)
  tooltip.classList.remove(css.animateBottom.className)
  // eslint-disable-next-line
  void tooltip.offsetWidth // trick for restarting the animation
  tooltip.classList.add(anim)
}
*/
