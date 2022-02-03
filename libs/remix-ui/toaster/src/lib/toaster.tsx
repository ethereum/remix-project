import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line

import './toaster.css'

/* eslint-disable-next-line */
export interface ToasterProps {
  message: string | JSX.Element
  timeOut?: number,
  handleHide?: () => void
}

export const Toaster = (props: ToasterProps) => {
  const [state, setState] = useState<{
    message: string | JSX.Element,
    hide: boolean,
    hiding: boolean,
    timeOutId: any,
    timeOut: number,
    showModal: boolean,
    showFullBtn: boolean
  }>({
    message: '',
    hide: true,
    hiding: false,
    timeOutId: null,
    timeOut: props.timeOut || 7000,
    showModal: false,
    showFullBtn: false
  })

  useEffect(() => {
    if (props.message) {
      const timeOutId = setTimeout(() => {
        setState(prevState => {
          return { ...prevState, hiding: true }
        })
      }, state.timeOut)

      setState(prevState => {
        if (typeof props.message === 'string' && (props.message.length > 201)) {
          const shortTooltipText = props.message.substring(0, 200) + '...'

          return { ...prevState, hide: false, hiding: false, timeOutId, message: shortTooltipText }
        } else {
          const shortTooltipText = props.message

          return { ...prevState, hide: false, hiding: false, timeOutId, message: shortTooltipText }
        }
      })
    }
  }, [props.message])

  useEffect(() => {
    if (state.hiding) {
      setTimeout(() => {
        closeTheToaster()
      }, 1800)
    }
  }, [state.hiding])

  const showFullMessage = () => {
    setState(prevState => {
      return { ...prevState, showModal: true }
    })
  }

  const hideFullMessage = () => { //eslint-disable-line
    setState(prevState => {
      return { ...prevState, showModal: false }
    })
  }

  const closeTheToaster = () => {
    if (state.timeOutId) {
      clearTimeout(state.timeOutId)
    }
    props.handleHide && props.handleHide()
    setState(prevState => {
      return { ...prevState, message: '', hide: true, hiding: false, timeOutId: null, showModal: false }
    })
  }

  const handleMouseEnter = () => {
    if (state.timeOutId) {
      clearTimeout(state.timeOutId)
    }
    setState(prevState => {
      return { ...prevState, timeOutId: null }
    })
  }

  const handleMouseLeave = () => {
    if (!state.timeOutId) {
      const timeOutId = setTimeout(() => {
        setState(prevState => {
          return { ...prevState, hiding: true }
        })
      }, state.timeOut)

      setState(prevState => {
        return { ...prevState, timeOutId }
      })
    }
  }

  return (
    <>
      <ModalDialog
        id='toaster'
        message={props.message}
        cancelLabel='Close'
        cancelFn={() => {}}
        hide={!state.showModal}
        handleHide={hideFullMessage}
      />
      { !state.hide &&
        <div data-shared="tooltipPopup" className={`remixui_tooltip alert alert-info p-2 ${state.hiding ? 'remixui_animateTop' : 'remixui_animateBottom'}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <span className="px-2">
            { state.message }
            { state.showFullBtn && <button className="btn btn-secondary btn-sm mx-3" style={{ whiteSpace: 'nowrap' }} onClick={showFullMessage}>Show full message</button> }
          </span>
          <span style={{ alignSelf: 'baseline' }}>
            <button data-id="tooltipCloseButton" className="fas fa-times btn-info mx-1 p-0" onClick={closeTheToaster}></button>
          </span>
        </div>
      }
    </>
  )
}

export default Toaster
