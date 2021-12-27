import React, { useEffect, useState } from 'react'

export const useDragTerminal = (minHeight: number, defaultPosition: number) => {
  const [isOpen, setIsOpen] = useState(defaultPosition > minHeight)
  const [lastYPosition, setLastYPosition] = useState(0)
  const [terminalPosition, setTerminalPosition] = useState(defaultPosition)
  // Used to save position of the terminal when it is closed
  const [lastTerminalPosition, setLastTerminalPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)

  const handleDraggingStart = (event: React.MouseEvent) => {
    setLastYPosition(event.clientY)
    setIsDragging(true)
  }

  const handleDragging = (event: MouseEvent) => {
    event.preventDefault()

    if (isDragging) {
      const mouseYPosition = event.clientY
      const difference = lastYPosition - mouseYPosition
      const newTerminalPosition = terminalPosition + difference
      setTerminalPosition(newTerminalPosition)
      setLastYPosition(mouseYPosition)
    }
  }

  const handleDraggingEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    // Check terminal position to determine if it should be open or closed
    setIsOpen(terminalPosition > minHeight)
  }

  const handleToggleTerminal = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (isOpen) {
      setLastTerminalPosition(terminalPosition)
      setLastYPosition(0)
      setTerminalPosition(minHeight)
    } else {
      setTerminalPosition(lastTerminalPosition <= minHeight ? 323 : lastTerminalPosition)
    }

    setIsOpen(!isOpen)
  }

  // Add event listeners for dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleDragging)
    document.addEventListener('mouseup', handleDraggingEnd)

    return () => {
      document.removeEventListener('mousemove', handleDragging)
      document.removeEventListener('mouseup', handleDraggingEnd)
    }
  }, [handleDragging, handleDraggingEnd])

  // Reset terminal position
  useEffect(() => {
    if (!terminalPosition) {
      setTerminalPosition(defaultPosition)
    }
  }, [terminalPosition, setTerminalPosition])

  return {
    isOpen,
    terminalPosition,
    isDragging,
    handleDraggingStart,
    handleToggleTerminal
  }
}
