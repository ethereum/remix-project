import React, { useEffect, useState } from 'react' // eslint-disable-line

import './toaster.css'

/* eslint-disable-next-line */
export interface ToasterProps {
  message: any
  timeOut?: number
}

export interface ToasterOptions {
  time: number
}

export const Toaster = (props: ToasterProps) => {
  const [state, setState] = useState({
    message: '',
    hide: false,
    timeOutId: null,
    timeOut: props.timeOut || 700
  })

  useEffect(() => {
    if (props.message) {
      const timeOutId = setTimeout(() => {
        setState(prevState => {
          return { ...prevState, hide: true }
        })
      }, state.timeOut)

      console.log('timeOutId: ', timeOutId)
      setState(prevState => {
        return { ...prevState, hide: false, timeOutId, message: props.message }
      })
    }
  }, [props.message])

  const shortTooltipText = state.message.length > 201 ? state.message.substring(0, 200) + '...' : state.message

  function hide () {
    if (!state.hide) {
      clearTimeout(state.timeOutId)
    }
  }

  function showFullMessage () {
    // alert(state.message)
  }

  function closeTheToaster () {
    hide()
  }

  // out()
  const animate = state.timeOutId ? (state.hide ? 'remixui_animateBottom' : 'remixui_animateTop') : ''
  // const hide = state.timeOutId
  const className = `remixui_tooltip alert alert-info p-2 ${animate}`
  return (
    <div data-shared="tooltipPopup" className={className} onMouseEnter={() => { }} onMouseLeave={() => { }}>
      <span className="px-2">
        {shortTooltipText}
        { state.message.length > 201 ? <button className="btn btn-secondary btn-sm mx-3" style={{ whiteSpace: 'nowrap' }} onClick={() => showFullMessage()}>Show full message</button> : ''}
      </span>
      <span style={{ alignSelf: 'baseline' }}>
        <button data-id="tooltipCloseButton" className="fas fa-times btn-info mx-1 p-0" onClick={() => closeTheToaster()}></button>
      </span>
    </div>
  )
  // animation(this.tooltip, css.animateBottom.className)
}

export default Toaster

/*
const animation = (tooltip, anim) => {
  tooltip.classList.remove(css.animateTop.className)
  tooltip.classList.remove(css.animateBottom.className)
  // eslint-disable-next-line
  void tooltip.offsetWidth // trick for restarting the animation
  tooltip.classList.add(anim)
}
*/
