import React, { useEffect, useState, useRef } from 'react'
import Draggable from 'react-draggable'
import './dragbar.css'

interface IRemixDragBarUi {
  refObject: React.MutableRefObject<any>;
  setHideStatus: (hide: boolean) => void;
  hidden: boolean
  minWidth: number
  maximiseTrigger: number
  resetTrigger: number
}

const DragBar = (props: IRemixDragBarUi) => {
  const [dragState, setDragState] = useState<boolean>(false)
  const [dragBarPosX, setDragBarPosX] = useState<number>(0)
  const [offset, setOffSet] = useState<number>(0)
  const initialWidth = useRef<number>(props.minWidth)
  const nodeRef = React.useRef(null) // fix for strictmode

  useEffect(() => {
    setDragBarPosX(offset + (props.hidden ? 0 : props.refObject.current.offsetWidth))
  }, [props.hidden, offset])

  useEffect(() => {
    initialWidth.current = props.refObject.current.clientWidth
    if (props.maximiseTrigger > 0) {
      const width = 0.4 * window.innerWidth
      if (width > props.refObject.current.offsetWidth) {
        props.refObject.current.style.width = width + 'px'
        setTimeout(() => {
          setDragBarPosX(offset + width)
        }, 300)
      }
    }
  }, [props.maximiseTrigger])

  useEffect(() => {
    if (props.maximiseTrigger > 0) {
      props.refObject.current.style.width = initialWidth.current + 'px'
      setTimeout(() => {
        setDragBarPosX(offset + initialWidth.current)
      }, 300)
    }
  }, [props.resetTrigger])

  const handleResize = () => {
    if (!props.refObject.current) return
    setOffSet(props.refObject.current.offsetLeft)
    setDragBarPosX(props.refObject.current.offsetLeft + props.refObject.current.offsetWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    // TODO: not a good way to wait on the ref doms element to be rendered of course
    setTimeout(() =>
      handleResize(), 2000)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function stopDrag(data: any) {
    setDragState(false)
    if (data.x < props.minWidth + offset) {
      setDragBarPosX(offset)
      props.setHideStatus(true)
    } else {
      props.refObject.current.style.width = (data.x - offset) + 'px'
      setTimeout(() => {
        props.setHideStatus(false)
        setDragBarPosX(offset + props.refObject.current.offsetWidth)
      }, 300)
    }
  }

  function startDrag() {
    setDragState(true)
  }
  return <>
    <div className={`overlay ${dragState ? '' : 'd-none'}`} ></div>
    <Draggable nodeRef={nodeRef} position={{ x: dragBarPosX, y: 0 }} onStart={startDrag} onStop={stopDrag} axis="x">
      <div ref={nodeRef} className={`dragbar ${dragState ? 'ondrag' : ''}`}></div>
    </Draggable>
  </>
}

export default DragBar
