import React, { useState, useRef, useEffect } from 'react'
import './DropdownMenu.css'

export interface MenuItem {
  label: string
  submenu?: MenuItem[]
  onClick?: () => void
}

interface DropdownMenuProps {
  items: MenuItem[]
  disabled?: boolean
  onOpen?: () => void
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, disabled, onOpen }) => {
  const [open, setOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
        setActiveSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="custom-dropdown-wrapper" ref={ref}>
      <button 
        className="custom-dropdown-trigger btn btn-primary"
        onClick={() => {
          if (!disabled) {
            setOpen(!open)
            if (!open && onOpen) onOpen()
          }
        }}
        disabled={disabled}
      >
        <i className="fas fa-angle-down"></i>
      </button>

      {open && (
        <div className="custom-dropdown-panel">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`custom-dropdown-item ${disabled ? 'disabled' : ''}`}
              onMouseEnter={() => !disabled && item.submenu && setActiveSubmenu(idx)}
              onMouseLeave={() => !disabled && setActiveSubmenu(null)}
              onClick={() => {
                if (!disabled && item.onClick) {
                  item.onClick()
                  setOpen(false)
                }
              }}
            >
              <span>{item.label}</span>
              {item.submenu && <i className="fas fa-angle-right" style={{ float: 'right' }}></i>}

              {activeSubmenu === idx && item.submenu && (
                <div className="custom-dropdown-submenu">
                  {item.submenu.map((sub, subIdx) => (
                    <div key={subIdx} className="custom-dropdown-item" onClick={() => !disabled && sub.onClick && sub.onClick()}>
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu